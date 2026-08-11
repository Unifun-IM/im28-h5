import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { WebIMContact, WebIMJoinedGroup } from '@im28/im-sdk/web';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import {
  readChatForwardLocationState,
  type ChatForwardLocationState,
} from './chat-forward-route.js';
import {
  contactToChatForwardTarget,
  conversationToChatForwardTarget,
  filterChatForwardTargets,
  findForwardGroupConversationID,
  groupToChatForwardTarget,
  type ChatForwardTarget,
  type ChatForwardTargetKind,
} from './forward-target-view.js';
import './chat-forward.css';

/** 选择器 tab 与 RN 最近聊天、好友、群聊顺序一致。 */
const TARGET_TABS: readonly { readonly kind: ChatForwardTargetKind; readonly label: string }[] = [
  { kind: 'conversation', label: '最近聊天' },
  { kind: 'friend', label: '好友' },
  { kind: 'group', label: '群聊' },
];

/** React Router 转发目标页只消费 SDK facade 和内存来源 ID。 */
export function ChatForwardTargetPage() {
  // sourceConversationID 用于校验路由与 location.state 指向同一来源。
  const { conversationID: sourceConversationID = '' } = useParams();
  // location.state 缺失代表刷新或外部深链，必须安全退出。
  const location = useLocation();
  // navigate 管理选择目标和返回来源聊天的 SPA history。
  const navigate = useNavigate();
  // runtime 提供当前认证账号绑定的 facade owners。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // forwardState 只包含来源会话和 client message IDs。
  const forwardState = useMemo(
    () => readChatForwardLocationState(location.state),
    [location.state],
  );
  // activeTab 切换三类目标而不重新创建数据 owner。
  const [activeTab, setActiveTab] = useState<ChatForwardTargetKind>('conversation');
  // keyword 只在当前 tab 执行本地过滤。
  const [keyword, setKeyword] = useState('');
  // recent 保存 cache-first 会话目标。
  const [recent, setRecent] = useState<readonly ChatForwardTarget[]>([]);
  // contacts 保存真实 Gateway 好友目标。
  const [contacts, setContacts] = useState<readonly WebIMContact[]>([]);
  // groups 保存 cache-first 已加入群目标。
  const [groups, setGroups] = useState<readonly WebIMJoinedGroup[]>([]);
  // loading 只表示三类 facade 的当前刷新轮次。
  const [loading, setLoading] = useState(false);
  // openingKey 阻止重复打开同一目标会话。
  const [openingKey, setOpeningKey] = useState('');
  // error 显示真实 cache、Gateway 或会话解析失败。
  const [error, setError] = useState<string | null>(null);

  /** 先展示会话和群缓存，再并行刷新全部真实目标数据。 */
  const loadTargets = useCallback(async (): Promise<void> => {
    if (
      !runtime ||
      !snapshot.userID ||
      !forwardState ||
      forwardState.sourceConversationID !== sourceConversationID
    ) return;
    // sync 是本页唯一 SDK facade 聚合入口。
    const sync = runtime.getSync();
    setLoading(true);
    setError(null);
    try {
      // cachedResults 允许慢网时先显示最近会话和群聊。
      const [cachedConversations, cachedGroups] = await Promise.all([
        sync.conversations.listCached({ archived: false, limit: 100 }),
        sync.groups.listCached(),
      ]);
      setRecent(cachedConversations.map(conversationToChatForwardTarget));
      setGroups(cachedGroups);
      // syncedResults 由三个既有 facade 完成分页、归一化和落库。
      const [syncedConversations, syncedContacts, syncedGroups] = await Promise.all([
        sync.conversations.sync({ pageSize: 100 }),
        sync.contacts.list({ pageSize: 100 }),
        sync.groups.sync({ pageSize: 50 }),
      ]);
      setRecent(syncedConversations.map(conversationToChatForwardTarget));
      setContacts(syncedContacts);
      setGroups(syncedGroups);
    } catch (cause) {
      setError(readForwardTargetError(cause));
    } finally {
      setLoading(false);
    }
  }, [forwardState, runtime, snapshot.userID, sourceConversationID]);

  useEffect(() => { void loadTargets(); }, [loadTargets]);

  // targets 仅投影当前 tab，保持各 facade 原始顺序。
  const targets = useMemo(() => {
    if (activeTab === 'friend') return contacts.map(contactToChatForwardTarget);
    if (activeTab === 'group') return groups.map(groupToChatForwardTarget);
    return recent;
  }, [activeTab, contacts, groups, recent]);
  // visibleTargets 应用当前关键字，不改变 target identity。
  const visibleTargets = useMemo(
    () => filterChatForwardTargets(targets, keyword),
    [keyword, targets],
  );

  /** 通过既有 facade 解析真实目标会话，再携带同一 ID 状态进入聊天页。 */
  async function openTarget(target: ChatForwardTarget): Promise<void> {
    if (!runtime || !forwardState || openingKey) return;
    // sync 负责打开单聊和验证群会话 cache。
    const sync = runtime.getSync();
    setOpeningKey(target.key);
    setError(null);
    try {
      // targetConversationID 必须来自 facade 返回值或真实会话 cache。
      let targetConversationID = target.conversationID;
      if (target.kind === 'friend') {
        targetConversationID = (await sync.peerProfile.openConversation(target.id)).conversationID;
      } else if (target.kind === 'group') {
        // conversations 先读 cache，缺失时使用 canonical sync 刷新。
        let conversations = await sync.conversations.listCached({ limit: 500 });
        targetConversationID = findForwardGroupConversationID(target, conversations);
        if (!targetConversationID) {
          conversations = await sync.conversations.sync({ pageSize: 100 });
          targetConversationID = findForwardGroupConversationID(target, conversations);
        }
      }
      if (!targetConversationID) throw new Error('目标会话尚未建立');
      // routeState 继续只传稳定 IDs，不携带 Message body。
      const routeState: ChatForwardLocationState = { forward: forwardState };
      navigate(`/conversations/${encodeURIComponent(targetConversationID)}`, { state: routeState });
    } catch (cause) {
      setError(readForwardTargetError(cause, '打开转发目标失败'));
    } finally {
      setOpeningKey('');
    }
  }

  if (restoring) return <ForwardTargetState label="正在恢复会话" />;
  if (!runtime) return <ForwardTargetState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  if (
    !forwardState ||
    forwardState.sourceConversationID !== sourceConversationID
  ) {
    return <Navigate to={`/conversations/${encodeURIComponent(sourceConversationID)}`} replace />;
  }

  return (
    <main className="rn-chat-forward-target-page" aria-busy={loading}>
      <section className="rn-chat-forward-target-surface">
        <header className="rn-chat-forward-target-header">
          <button type="button" aria-label="返回聊天" onClick={() => navigate(-1)}>
            <RNAssetIcon assetURL={backIconURL} />
          </button>
          <h1>选择转发对象</h1>
          <span aria-hidden="true" />
        </header>
        <label className="rn-chat-forward-search">
          <RNAssetIcon assetURL={searchIconURL} />
          <span className="sr-only">搜索转发对象</span>
          <input type="search" value={keyword} placeholder="搜索" onChange={event => setKeyword(event.target.value)} />
          {keyword ? <button type="button" aria-label="清除" onClick={() => setKeyword('')}><RNAssetIcon assetURL={clearIconURL} /></button> : null}
        </label>
        <nav className="rn-chat-forward-tabs" aria-label="转发对象类型">
          {TARGET_TABS.map(tab => (
            <button type="button" key={tab.kind} className={activeTab === tab.kind ? 'is-active' : ''} onClick={() => setActiveTab(tab.kind)}>
              {tab.label}
            </button>
          ))}
        </nav>
        {error ? <p className="rn-chat-forward-error" role="status">{error}</p> : null}
        <section className="rn-chat-forward-target-list" aria-label="转发对象列表">
          {visibleTargets.map(target => <ForwardTargetRow key={target.key} target={target} opening={openingKey === target.key} onOpen={() => void openTarget(target)} />)}
          {loading && targets.length === 0 ? <div className="rn-chat-forward-loading"><span /></div> : null}
          {!loading && visibleTargets.length === 0 ? <p className="rn-chat-forward-empty">{keyword.trim() ? '没有找到相关对象' : '暂无可选对象'}</p> : null}
        </section>
      </section>
    </main>
  );
}

/** 转发目标行复用 RN 圆形头像和左右 flex 布局。 */
function ForwardTargetRow({ target, opening, onOpen }: { readonly target: ChatForwardTarget; readonly opening: boolean; readonly onOpen: () => void }) {
  // avatarStyle 使用目标 ID 生成稳定 RN fallback 渐变。
  const avatarStyle = { '--forward-target-avatar-gradient': getRNAvatarGradient(target.id) } as CSSProperties;
  return (
    <button className="rn-chat-forward-target-row" type="button" disabled={opening} onClick={onOpen}>
      <span className="rn-chat-forward-target-avatar" style={avatarStyle}>
        <span>{getRNAvatarInitial(target.title)}</span>
        {target.avatarURL ? <img src={target.avatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}
      </span>
      <span className="rn-chat-forward-target-copy"><strong>{target.title}</strong><small>{target.description}</small></span>
      {opening ? <span className="rn-chat-forward-row-spinner" /> : null}
    </button>
  );
}

/** 统一呈现认证恢复和运行配置错误。 */
function ForwardTargetState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-chat-forward-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

/** 将未知异常转换为不泄露本地数据的页面文案。 */
function readForwardTargetError(cause: unknown, fallback = '转发对象加载失败，请稍后重试'): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}
