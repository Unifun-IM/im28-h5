import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { Conversation, WebIMContact, WebIMJoinedGroup } from '@im28/im-sdk/web';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import closeIconURL from '../../assets/rn/assets/icons/imm28/xmark.regular.svg';
import clearIconURL from '../../assets/rn/assets/icons/imm28/xmark-circle.solid.svg';
import searchIconURL from '../../assets/rn/assets/icons/imm28/search.regular.svg';
import checkIconURL from '../../assets/rn/assets/icons/imm28/check-circle.solid.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { contactToChatForwardTarget, filterChatForwardTargets } from './forward-target-view.js';
import '../contacts/contact-card-share.css';

/** 群名片页恢复结果只包含当前路由已确认的真实会话和群快照。 */
interface GroupCardShareSource {
  readonly conversation: Conversation;
  readonly group: WebIMJoinedGroup;
}

/** RN 同语义的群名片好友选择页，刷新后仍从 shared cache 恢复。 */
export function GroupCardSharePage() {
  // conversationID 来自 React Router 稳定 SPA path。
  const { conversationID = '' } = useParams();
  // navigate 负责关闭选择层和成功后的真实会话跳转。
  const navigate = useNavigate();
  // runtime 是联系人、群资料与群卡片写动作的唯一 owner。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // source 保存已确认属于当前账号的群会话和群资料。
  const [source, setSource] = useState<GroupCardShareSource | null>(null);
  // contacts 保存 cache-first 后的真实好友列表。
  const [contacts, setContacts] = useState<readonly WebIMContact[]>([]);
  // keyword 只执行本地好友筛选。
  const [keyword, setKeyword] = useState('');
  // selectedUserID 对齐 RN selector 当前单选集合行为。
  const [selectedUserID, setSelectedUserID] = useState('');
  // loading 标识 source 与联系人刷新轮次。
  const [loading, setLoading] = useState(false);
  // sharing 阻止群名片重复提交。
  const [sharing, setSharing] = useState(false);
  // error 呈现真实读取或写入失败。
  const [error, setError] = useState<string | null>(null);

  /** 从 shared cache 恢复群会话、群资料和好友，再执行 canonical 刷新。 */
  const load = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID || !conversationID) return;
    // sync 由当前认证 runtime 单例提供。
    const sync = runtime.getSync();
    setLoading(true);
    setError(null);
    try {
      // conversations 缺失时使用 canonical 全量同步恢复深链。
      let conversations = await sync.conversations.listCached({ limit: 500 });
      let conversation = conversations.find(item => item.conversationID === conversationID);
      if (!conversation) {
        conversations = await sync.conversations.sync({ pageSize: 100 });
        conversation = conversations.find(item => item.conversationID === conversationID);
      }
      if (!conversation || conversation.type !== 'group') {
        throw new Error('群聊不存在或尚未同步');
      }
      // cachedGroups 和 cachedContacts 先恢复当前账号本地快照。
      const [cachedGroups, cachedContacts] = await Promise.all([
        sync.groups.listCached(),
        sync.contacts.listCached().catch(() => [] as readonly WebIMContact[]),
      ]);
      const cachedGroup = cachedGroups.find(item => item.groupID === conversation.targetID);
      if (cachedGroup) setSource({ conversation, group: cachedGroup });
      setContacts(cachedContacts);
      // 远端刷新保持群资料和好友候选与 RN 当前网络快照一致。
      const [groups, refreshedContacts] = await Promise.all([
        sync.groups.sync({ pageSize: 100 }),
        sync.contacts.list({ pageSize: 100 }),
      ]);
      const group = groups.find(item => item.groupID === conversation.targetID);
      if (!group) throw new Error('群资料不存在或尚未同步');
      setSource({ conversation, group });
      setContacts(refreshedContacts);
    } catch (cause) {
      setError(readGroupCardShareError(cause, '群名片分享数据加载失败'));
    } finally {
      setLoading(false);
    }
  }, [conversationID, runtime, snapshot.userID]);

  useEffect(() => { void load(); }, [load]);

  // targets 只允许好友并排除本人，严格对齐 RN 当前生产 selector。
  const targets = useMemo(() => contacts
    .filter(contact => contact.userID !== snapshot.userID)
    .map(contactToChatForwardTarget), [contacts, snapshot.userID]);
  // visibleTargets 复用转发页的稳定本地筛选规则。
  const visibleTargets = useMemo(
    () => filterChatForwardTargets(targets, keyword),
    [keyword, targets],
  );

  /** 用户显式点击分享后才调用 shared 群名片 mutation。 */
  async function shareCard(): Promise<void> {
    if (!runtime || !source || !selectedUserID || sharing) return;
    setSharing(true);
    setError(null);
    try {
      // result 来自 shared owner，包含已写入 SQLite 的真实 direct conversation ID。
      const result = await runtime.getSync().contacts.shareGroupCard({
        groupID: source.group.groupID,
        groupName: source.group.name,
        faceURL: source.group.avatarURL,
        targetUserIDs: [selectedUserID],
      });
      const targetConversationID = result.conversationIDs[0];
      if (!targetConversationID) throw new Error('分享成功但目标会话不可用');
      navigate(`/conversations/${encodeURIComponent(targetConversationID)}`, { replace: true });
    } catch (cause) {
      setError(readGroupCardShareError(cause, '分享群名片失败'));
    } finally {
      setSharing(false);
    }
  }

  if (restoring) return <GroupCardShareState label="正在恢复会话" />;
  if (!runtime) return <GroupCardShareState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  return (
    <main className="rn-contact-card-share-page" aria-busy={loading || sharing}>
      <section className="rn-contact-card-share-sheet">
        <header className="rn-contact-card-share-header">
          <button type="button" aria-label="关闭选择聊天" onClick={() => navigate(-1)}><RNAssetIcon assetURL={closeIconURL} /></button>
          <h1>{`已选中(${selectedUserID ? 1 : 0})`}</h1><span aria-hidden="true" />
        </header>
        <label className="rn-contact-card-share-search">
          <RNAssetIcon assetURL={searchIconURL} /><span className="sr-only">搜索好友</span>
          <input type="search" value={keyword} placeholder="搜索" onChange={event => setKeyword(event.target.value)} />
          {keyword ? <button type="button" aria-label="清除搜索" onClick={() => setKeyword('')}><RNAssetIcon assetURL={clearIconURL} /></button> : null}
        </label>
        {error ? <p className="rn-contact-card-share-error" role="alert">{error}</p> : null}
        <section className="rn-contact-card-share-grid" aria-label="选择群名片分享好友">
          {visibleTargets.map(target => <GroupCardTarget key={target.key} target={target} selected={selectedUserID === target.id} disabled={sharing} onSelect={() => setSelectedUserID(selectedUserID === target.id ? '' : target.id)} />)}
          {loading && targets.length === 0 ? <p>正在加载好友</p> : null}
          {!loading && visibleTargets.length === 0 ? <p>{keyword.trim() ? '未找到相关好友' : '暂无可分享好友'}</p> : null}
        </section>
        <footer className="rn-contact-card-share-footer"><button type="button" disabled={!source || !selectedUserID || sharing} onClick={() => void shareCard()}>{sharing ? '正在分享' : '分享'}</button></footer>
      </section>
    </main>
  );
}

/** 好友目标复用 RN 圆形头像、名称和选中标记。 */
function GroupCardTarget({ target, selected, disabled, onSelect }: { readonly target: ReturnType<typeof contactToChatForwardTarget>; readonly selected: boolean; readonly disabled: boolean; readonly onSelect: () => void }) {
  // avatarStyle 使用好友 ID 生成稳定 fallback 渐变。
  const avatarStyle = { '--contact-card-target-gradient': getRNAvatarGradient(target.id) } as CSSProperties;
  return <button type="button" className={selected ? 'is-selected' : undefined} aria-pressed={selected} disabled={disabled} onClick={onSelect}><span className="rn-contact-card-share-avatar" style={avatarStyle}><span>{getRNAvatarInitial(target.title)}</span>{target.avatarURL ? <img src={target.avatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}{selected ? <span className="rn-contact-card-share-check"><RNAssetIcon assetURL={checkIconURL} /></span> : null}</span><strong>{target.title}</strong></button>;
}

/** 统一呈现认证恢复和运行配置错误。 */
function GroupCardShareState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-contact-card-share-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

/** 将未知异常转换为不泄露本地数据的页面文案。 */
function readGroupCardShareError(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

export default GroupCardSharePage;
