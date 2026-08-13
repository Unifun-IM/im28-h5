import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  buildIM28GroupQRCodePayload,
  buildIM28UserQRCodePayload,
  type GatewayUser,
  type WebIMSync,
} from '@im28/im-sdk/web';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import closeIconURL from '../../assets/rn/assets/icons/imm28/xmark.regular.svg';
import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import checkIconURL from '../../assets/rn/assets/icons/imm28/check-circle.solid.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { loadGroupProfileSource } from '../chat/group-profile-source.js';
import { buildGroupProfileView } from '../chat/group-profile-view.js';
import {
  loadChatForwardTargets,
  readChatForwardTargets,
  resolveChatForwardTargetConversationID,
  type ChatForwardTargetSource,
} from '../chat/forward-target-source.js';
import { filterChatForwardTargets, type ChatForwardTarget } from '../chat/forward-target-view.js';
import { createBrowserQRCodeShareFile } from './browser-qr-image.js';
import '../contacts/contact-card-share.css';
import './qr-code-share.css';

/** 二维码应用内分享页的两种可刷新来源。 */
export type QRCodeShareKind = 'user' | 'group';

/** 发送前只保留重建 PNG 所需公开字段和稳定身份。 */
interface QRCodeShareSource {
  readonly kind: QRCodeShareKind;
  readonly identity: string;
  readonly displayName: string;
  readonly payload: string;
}

/** RN 二维码分享页允许好友与群聊两类目标。 */
type QRCodeShareTargetTab = 'friend' | 'group';

/** 二维码分享页通过稳定路由重建来源，确认后发送一张图片。 */
export default function QRCodeSharePage({ kind }: { readonly kind: QRCodeShareKind }) {
  /** conversationID 仅在群二维码分享路由存在。 */
  const { conversationID = '' } = useParams();
  /** navigate 负责关闭分享层和发送成功后的真实聊天跳转。 */
  const navigate = useNavigate();
  /** runtime 提供资料、目标和消息 facade。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** source 保存当前二维码的可验证公开来源。 */
  const [source, setSource] = useState<QRCodeShareSource | null>(null);
  /** targetSource 保存好友和已加入群的共享目标快照。 */
  const [targetSource, setTargetSource] = useState<ChatForwardTargetSource>({ recent: [], contacts: [], groups: [] });
  /** activeTab 对齐 RN cardShare 的好友、群聊顺序。 */
  const [activeTab, setActiveTab] = useState<QRCodeShareTargetTab>('friend');
  /** keyword 只在当前目标 tab 执行本地筛选。 */
  const [keyword, setKeyword] = useState('');
  /** selectedKey 保持 RN 当前单选行为。 */
  const [selectedKey, setSelectedKey] = useState('');
  /** loading 标识二维码来源与目标刷新轮次。 */
  const [loading, setLoading] = useState(false);
  /** sharing 阻止重复生成、上传和发送二维码。 */
  const [sharing, setSharing] = useState(false);
  /** error 显示真实读取、上传或消息写入失败。 */
  const [error, setError] = useState<string | null>(null);

  /** 返回路由严格由当前二维码种类和会话身份构造。 */
  const backHref = kind === 'group'
    ? `/conversations/${encodeURIComponent(conversationID)}/settings/qrcode`
    : '/me/qrcode';

  /** 并行恢复二维码来源和共享目标，缓存结果可先展示。 */
  const load = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID || (kind === 'group' && !conversationID)) return;
    /** sync 是本页唯一业务 owner 聚合入口。 */
    const sync = runtime.getSync();
    setLoading(true);
    setError(null);
    try {
      /** values 让来源与候选目标共享同一认证 runtime 快照。 */
      const values = await Promise.all([
        loadQRCodeShareSource(sync, kind, conversationID),
        loadChatForwardTargets({ sync, includeRecent: false, onCached: setTargetSource }),
      ]);
      setSource(values[0]);
      setTargetSource(values[1]);
    } catch (cause) {
      setError(readQRCodeShareError(cause, '二维码分享数据加载失败'));
    } finally {
      setLoading(false);
    }
  }, [conversationID, kind, runtime, snapshot.userID]);

  useEffect(() => { void load(); }, [load]);

  /** targets 复用唯一目标投影，并排除当前用户自己的好友目标。 */
  const targets = useMemo(() => readChatForwardTargets(targetSource, activeTab)
    .filter(target => target.kind !== 'friend' || target.id !== snapshot.userID), [activeTab, snapshot.userID, targetSource]);
  /** visibleTargets 复用转发链的稳定本地筛选。 */
  const visibleTargets = useMemo(
    () => filterChatForwardTargets(targets, keyword),
    [keyword, targets],
  );
  /** selectedTarget 只从当前真实目标快照解析，拒绝手工目标 ID。 */
  const selectedTarget = useMemo(
    () => targets.find(target => target.key === selectedKey) ?? null,
    [selectedKey, targets],
  );

  /** 用户显式确认后才生成 320 像素 PNG 并调用 shared 图片发送。 */
  async function shareQRCode(): Promise<void> {
    if (!runtime || !source || !selectedTarget || sharing) return;
    setSharing(true);
    setError(null);
    try {
      /** sync 绑定当前账号数据库、上传端口和 Gateway。 */
      const sync = runtime.getSync();
      /** targetConversationID 必须由现有会话解析 owner 返回。 */
      const targetConversationID = await resolveChatForwardTargetConversationID(sync, selectedTarget);
      /** file 仅在确认后生成，不跨路由或写入浏览器缓存。 */
      const file = await createBrowserQRCodeShareFile({
        kind: source.kind,
        identity: source.identity,
        payload: source.payload,
        avatar: {
          initial: getRNAvatarInitial(source.displayName, source.kind === 'group' ? '群' : '?'),
          backgroundColor: readQRCodeShareAvatarColor(getRNAvatarGradient(source.identity)),
        },
      });
      await sync.messages.sendImage({
        conversationID: targetConversationID,
        source: file,
        name: file.name,
        mimeType: file.type,
        size: file.size,
        width: 320,
        height: 320,
      });
      navigate(`/conversations/${encodeURIComponent(targetConversationID)}`, { replace: true });
    } catch (cause) {
      setError(readQRCodeShareError(cause, '二维码发送失败'));
    } finally {
      setSharing(false);
    }
  }

  if (restoring) return <QRCodeShareState label="正在恢复会话" />;
  if (!runtime) return <QRCodeShareState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  return (
    <main className="rn-contact-card-share-page rn-qr-share-page" aria-busy={loading || sharing}>
      <section className="rn-contact-card-share-sheet">
        <header className="rn-contact-card-share-header">
          <button type="button" aria-label="关闭选择聊天" disabled={sharing} onClick={() => navigate(backHref)}><RNAssetIcon assetURL={closeIconURL} /></button>
          <h1>{`已选中(${selectedTarget ? 1 : 0})`}</h1><span aria-hidden="true" />
        </header>
        <label className="rn-contact-card-share-search">
          <RNAssetIcon assetURL={searchIconURL} /><span className="sr-only">搜索分享对象</span>
          <input type="search" value={keyword} placeholder="搜索" onChange={event => setKeyword(event.target.value)} />
          {keyword ? <button type="button" aria-label="清除搜索" onClick={() => setKeyword('')}><RNAssetIcon assetURL={clearIconURL} /></button> : null}
        </label>
        <nav className="rn-qr-share-tabs" aria-label="分享对象类型">
          <button type="button" className={activeTab === 'friend' ? 'is-active' : ''} onClick={() => { setActiveTab('friend'); setSelectedKey(''); }}>好友</button>
          <button type="button" className={activeTab === 'group' ? 'is-active' : ''} onClick={() => { setActiveTab('group'); setSelectedKey(''); }}>群聊</button>
        </nav>
        {error ? <p className="rn-contact-card-share-error" role="alert">{error}</p> : null}
        <section className="rn-contact-card-share-grid" aria-label="选择二维码分享对象">
          {visibleTargets.map(target => <QRCodeShareTarget key={target.key} target={target} selected={selectedKey === target.key} disabled={sharing} onSelect={() => setSelectedKey(selectedKey === target.key ? '' : target.key)} />)}
          {loading && targets.length === 0 ? <p>{activeTab === 'group' ? '正在加载群聊' : '正在加载好友'}</p> : null}
          {!loading && visibleTargets.length === 0 ? <p>{keyword.trim() ? `未找到相关${activeTab === 'group' ? '群聊' : '好友'}` : `暂无${activeTab === 'group' ? '群聊' : '好友'}`}</p> : null}
        </section>
        <footer className="rn-contact-card-share-footer"><button type="button" disabled={!source || !selectedTarget || sharing} onClick={() => void shareQRCode()}>{sharing ? '正在分享' : '分享'}</button></footer>
      </section>
    </main>
  );
}

/** 分享目标复用 RN 圆形头像、名称和单选标记。 */
function QRCodeShareTarget({ target, selected, disabled, onSelect }: { readonly target: ChatForwardTarget; readonly selected: boolean; readonly disabled: boolean; readonly onSelect: () => void }) {
  /** avatarStyle 使用稳定目标 ID 生成 RN fallback 渐变。 */
  const avatarStyle = { '--contact-card-target-gradient': getRNAvatarGradient(target.id) } as CSSProperties;
  return <button type="button" className={selected ? 'is-selected' : undefined} aria-pressed={selected} disabled={disabled} onClick={onSelect}><span className="rn-contact-card-share-avatar" style={avatarStyle}><span>{getRNAvatarInitial(target.title)}</span>{target.avatarURL ? <img src={target.avatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}{selected ? <span className="rn-contact-card-share-check"><RNAssetIcon assetURL={checkIconURL} /></span> : null}</span><strong>{target.title}</strong></button>;
}

/** 从可刷新路由恢复个人或群二维码公开来源。 */
async function loadQRCodeShareSource(sync: WebIMSync, kind: QRCodeShareKind, conversationID: string): Promise<QRCodeShareSource> {
  if (kind === 'user') {
    /** profile 直接来自当前认证账号的 Gateway 详情。 */
    const profile: GatewayUser = await sync.profile.getCurrent();
    /** userID 必须由权威详情返回。 */
    const userID = profile.user_id?.trim() ?? '';
    if (!userID) throw new Error('二维码身份不可用');
    return { kind, identity: userID, displayName: profile.nickname?.trim() || userID, payload: buildIM28UserQRCodePayload(userID) };
  }
  /** groupSource 复用群资料页面的会话与群身份双重校验。 */
  const groupSource = await loadGroupProfileSource({ sync, conversationID });
  /** groupView 统一群名、头像与 targetID 投影。 */
  const groupView = buildGroupProfileView(groupSource.conversation, groupSource.group);
  return { kind, identity: groupView.groupID, displayName: groupView.name, payload: buildIM28GroupQRCodePayload(groupView.groupID) };
}

/** 统一呈现认证恢复和运行配置错误。 */
function QRCodeShareState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-contact-card-share-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

/** 将未知分享异常转换为不泄露本地数据的页面文案。 */
function readQRCodeShareError(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

/** 从 RN 渐变 token 读取 Canvas 可用的首个稳定颜色。 */
function readQRCodeShareAvatarColor(gradient: string): string {
  /** colorMatch 只接受本地 helper 生成的六位十六进制颜色。 */
  const colorMatch = gradient.match(/#[0-9A-Fa-f]{6}/);
  return colorMatch?.[0] ?? '#596EEB';
}
