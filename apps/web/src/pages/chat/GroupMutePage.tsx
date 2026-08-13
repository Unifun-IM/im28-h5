import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { resolveIMGroupMemberDisplayName, type Conversation, type WebIMGroupMember, type WebIMJoinedGroup } from '@im28/im-sdk/web';
import { Link, Navigate, useParams } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import { InteractionModal } from '../../components/interaction/index.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { getRNAvatarGradient, getRNAvatarInitial } from '../../components/rn-avatar-view.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import './group-management-action-page.css';

/** RN 手动禁言固定时长选项。 */
const MEMBER_MUTE_OPTIONS = [
  { label: '15 分钟', seconds: 15 * 60 },
  { label: '30 分钟', seconds: 30 * 60 },
  { label: '1 小时', seconds: 60 * 60 },
  { label: '3 小时', seconds: 3 * 60 * 60 },
  { label: '1 天', seconds: 24 * 60 * 60 },
  { label: '3 天', seconds: 3 * 24 * 60 * 60 },
  { label: '7 天', seconds: 7 * 24 * 60 * 60 },
  { label: '1 个月', seconds: 30 * 24 * 60 * 60 },
] as const;

/** 禁言确认动作只持有稳定目标和明确下一状态。 */
type GroupMuteAction =
  | { readonly type: 'scope'; readonly scope: 'off' | 'all' | 'normal' }
  | { readonly type: 'member'; readonly userID: string; readonly seconds: number }
  | { readonly type: 'unmute-member'; readonly userID: string };

/** 群禁言页消费 shared capability、群 DTO 和成员 DTO。 */
export function GroupMutePage() {
  /** conversationID 来自群管理 SPA 子路由。 */
  const { conversationID = '' } = useParams();
  /** runtime 提供当前账号唯一同步入口。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** sync 随认证 runtime 生命周期变化。 */
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  /** conversation 保存已验证的真实群会话。 */
  const [conversation, setConversation] = useState<Conversation | null>(null);
  /** group 保存 shared permission 和群禁言状态。 */
  const [group, setGroup] = useState<WebIMJoinedGroup | null>(null);
  /** members 保存全量成员和禁言状态。 */
  const [members, setMembers] = useState<readonly WebIMGroupMember[]>([]);
  /** loading 覆盖首次 cache 和权威刷新。 */
  const [loading, setLoading] = useState(true);
  /** submitting 阻止重复远端写入。 */
  const [submitting, setSubmitting] = useState(false);
  /** pickerTarget 驱动成员时长选择层。 */
  const [pickerTarget, setPickerTarget] = useState<string | null>(null);
  /** action 驱动全部禁言操作二次确认。 */
  const [action, setAction] = useState<GroupMuteAction | null>(null);
  /** error 保留真实 SDK/Gateway/SQLite 失败。 */
  const [error, setError] = useState<string | null>(null);
  /** notice 只在 shared facade 已收敛后展示。 */
  const [notice, setNotice] = useState<string | null>(null);

  /** manageURL 是页面固定返回目标。 */
  const manageURL = `/conversations/${encodeURIComponent(conversationID)}/settings/manage`;

  /** 从当前账号 cache 恢复后刷新群和成员权威快照。 */
  const load = useCallback(async (): Promise<void> => {
    if (!sync || !snapshot.userID || !conversationID) return;
    setLoading(true);
    setError(null);
    try {
      /** conversations 先读 SQLite，缺失时再同步。 */
      let conversations = await sync.conversations.listCached({ limit: 500 });
      /** target 必须是稳定真实群会话。 */
      let target = conversations.find(item => item.conversationID === conversationID);
      if (!target) {
        conversations = await sync.conversations.sync({ pageSize: 100 });
        target = conversations.find(item => item.conversationID === conversationID);
      }
      if (!target || target.type !== 'group' || !target.targetID.trim()) throw new Error('群聊不存在或尚未同步');
      setConversation(target);
      /** cacheFacts 支持弱网立即展示。 */
      const [cachedGroups, cachedMembers] = await Promise.all([sync.groups.listCached(), sync.groupMembers.listCached(target.targetID)]);
      setGroup(cachedGroups.find(item => item.groupID === target.targetID) ?? null);
      setMembers(cachedMembers);
      /** refreshedFacts 对齐 RN 进入页面即刷新。 */
      const [refreshedGroups, refreshedMembers] = await Promise.all([sync.groups.sync({ pageSize: 100 }), sync.groupMembers.sync(target.targetID, { pageSize: 100 })]);
      setGroup(refreshedGroups.find(item => item.groupID === target.targetID) ?? null);
      setMembers(refreshedMembers);
    } catch (cause) {
      setError(readMuteError(cause));
    } finally {
      setLoading(false);
    }
  }, [conversationID, snapshot.userID, sync]);

  useEffect(() => { void load(); }, [load]);

  /** mutedMembers 只使用 shared DTO 的标准禁言字段。 */
  const mutedMembers = useMemo(() => members.filter(member => member.isMuted), [members]);
  /** candidates 对齐 RN：排除本人、群主、管理员和已禁言成员。 */
  const candidates = useMemo(() => members.filter(member => member.userID !== snapshot.userID && member.role === 'member' && !member.isMuted), [members, snapshot.userID]);

  /** 执行确认动作时只调用一次 shared mutation。 */
  async function confirmAction(): Promise<void> {
    if (!sync || !conversation || !action || submitting) return;
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      if (action.type === 'scope') {
        /** scope 同时明确两个开关，避免旧范围残留。 */
        const result = await sync.groupManagement.updateMute({ groupID: conversation.targetID, muteAll: action.scope === 'all', muteMember: action.scope === 'normal' });
        if (result.cacheState === 'remote-only') throw new Error('服务端设置已更新，本地群资料尚未收敛；请稍后刷新。');
      } else {
        /** muteUntil 为空只表示解除，否则由选择秒数生成未来 ISO 时间。 */
        const muteUntil = action.type === 'unmute-member' ? '' : new Date(Date.now() + action.seconds * 1000).toISOString();
        const result = await sync.groupManagement.updateMemberMute({ groupID: conversation.targetID, userID: action.userID, muteUntil });
        if (result.cacheState === 'remote-only') throw new Error('服务端设置已更新，本地成员快照尚未收敛；请稍后刷新。');
      }
      setAction(null);
      setPickerTarget(null);
      setNotice('设置成功');
      await load();
    } catch (cause) {
      setError(readMuteError(cause));
      setAction(null);
    } finally {
      setSubmitting(false);
    }
  }

  if (restoring) return <GroupMuteState label="正在恢复群禁言" />;
  if (!runtime) return <GroupMuteState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  if (!conversationID) return <Navigate to="/conversations" replace />;
  if (!loading && group && !group.permissions.canMuteAll && !group.permissions.canMuteMembers) return <Navigate to={manageURL} replace />;

  return (
    <main className="rn-group-action-page" aria-busy={loading || submitting}>
      <section className="rn-group-action-surface">
        <header className="rn-group-action-header"><Link to={manageURL} aria-label="返回群管理"><RNAssetIcon assetURL={backIconURL} /></Link><h1>群禁言</h1><span /></header>
        <div className="rn-group-action-content">
          {error ? <p className="rn-group-action-error" role="alert">{error}</p> : null}
          {notice ? <p className="rn-group-action-notice" role="status">{notice}</p> : null}
          {loading ? <p className="rn-group-action-empty">正在加载群禁言</p> : null}
          {!loading && group?.permissions.canMuteAll ? <section className="rn-group-action-card"><h2>群禁言范围</h2><MuteScopeOption label="关闭" selected={!group.muteAll && !group.muteMember} disabled={submitting} onSelect={() => setAction({ type: 'scope', scope: 'off' })} /><MuteScopeOption label="全员禁言" selected={group.muteAll === true} disabled={submitting} onSelect={() => setAction({ type: 'scope', scope: 'all' })} /><MuteScopeOption label="仅普通成员禁言" selected={group.muteMember === true && !group.muteAll} disabled={submitting} divided={false} onSelect={() => setAction({ type: 'scope', scope: 'normal' })} /></section> : null}
          {!loading && group?.permissions.canMuteMembers ? <section className="rn-group-action-card"><div className="rn-group-action-section-title"><strong>手动禁言({mutedMembers.length})</strong></div>{mutedMembers.map(member => <MuteMemberRow key={member.userID} member={member} actionLabel="解除" onAction={() => setAction({ type: 'unmute-member', userID: member.userID })} />)}{candidates.map(member => <MuteMemberRow key={member.userID} member={member} actionLabel="禁言" onAction={() => setPickerTarget(member.userID)} />)}{!mutedMembers.length && !candidates.length ? <p className="rn-group-action-empty">暂无可操作成员</p> : null}</section> : null}
        </div>
      </section>
      <InteractionModal open={Boolean(pickerTarget)} ariaLabel="选择禁言时长" onRequestClose={() => setPickerTarget(null)}><section className="rn-group-action-picker im-modal-sheet"><h2>选择禁言时长</h2>{MEMBER_MUTE_OPTIONS.map(option => <button type="button" key={option.seconds} onClick={() => { if (pickerTarget) setAction({ type: 'member', userID: pickerTarget, seconds: option.seconds }); setPickerTarget(null); }}>{option.label}</button>)}<button type="button" onClick={() => setPickerTarget(null)}>取消</button></section></InteractionModal>
      <InteractionModal open={Boolean(action)} ariaLabel="确认禁言设置" onRequestClose={() => { if (!submitting) setAction(null); }}><section className="rn-group-management-confirm im-modal-sheet"><h2>确认设置</h2><p>{buildMuteConfirmText(action, members)}</p><div><button type="button" disabled={submitting} onClick={() => setAction(null)}>取消</button><button type="button" disabled={submitting} onClick={() => { void confirmAction(); }}>{submitting ? '处理中' : '确认'}</button></div></section></InteractionModal>
    </main>
  );
}

/** 禁言范围选项保持固定行高和单选语义。 */
function MuteScopeOption({ label, selected, disabled, divided = true, onSelect }: { readonly label: string; readonly selected: boolean; readonly disabled: boolean; readonly divided?: boolean; readonly onSelect: () => void }) { return <button className={`rn-group-action-option${divided ? ' is-divided' : ''}`} type="button" aria-pressed={selected} disabled={disabled} onClick={onSelect}><span>{label}</span><span>{selected ? '✓' : ''}</span></button>; }

/** 成员行展示 shared 名称、头像和明确动作。 */
function MuteMemberRow({ member, actionLabel, onAction }: { readonly member: WebIMGroupMember; readonly actionLabel: string; readonly onAction: () => void }) {
  /** name 遵循 shared 备注、群昵称、昵称优先级。 */
  const name = resolveIMGroupMemberDisplayName(member, member.userID);
  /** avatarStyle 使用 RN 稳定 fallback 渐变。 */
  const avatarStyle = { '--group-action-avatar-gradient': getRNAvatarGradient(member.userID) } as CSSProperties;
  return <div className="rn-group-action-member"><span className="rn-group-action-avatar" style={avatarStyle}><span>{getRNAvatarInitial(name, '群')}</span>{member.avatarURL ? <img src={member.avatarURL} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}</span><span><strong>{name}</strong><small>{member.isMuted ? formatMuteUntil(member.muteUntil) : member.userID}</small></span><button type="button" onClick={onAction}>{actionLabel}</button></div>;
}

/** 将禁言到期时间转换为稳定中文剩余时长。 */
function formatMuteUntil(value: string | undefined): string {
  /** remainingMs 只接受未来可解析时间。 */
  const remainingMs = Date.parse(value ?? '') - Date.now();
  if (!Number.isFinite(remainingMs) || remainingMs <= 0) return '禁言中';
  /** minutes 向上取整避免显示零分钟。 */
  const minutes = Math.ceil(remainingMs / 60000);
  if (minutes >= 1440) return `剩余${Math.ceil(minutes / 1440)}天`;
  if (minutes >= 60) return `剩余${Math.ceil(minutes / 60)}小时`;
  return `剩余${minutes}分钟`;
}

/** 构造二次确认文案时只解析当前成员快照。 */
function buildMuteConfirmText(action: GroupMuteAction | null, members: readonly WebIMGroupMember[]): string {
  if (!action) return '';
  if (action.type === 'scope') return action.scope === 'off' ? '确定关闭群禁言吗？' : action.scope === 'all' ? '确定开启全员禁言吗？' : '确定仅禁言普通成员吗？';
  /** target 只从稳定用户 ID 查找。 */
  const target = members.find(member => member.userID === action.userID);
  /** name 复用 shared 成员名称规则。 */
  const name = target ? resolveIMGroupMemberDisplayName(target, target.userID) : action.userID;
  return action.type === 'unmute-member' ? `确定解除“${name}”的禁言吗？` : `确定禁言“${name}”吗？`;
}

/** 群禁言启动状态参数。 */
interface GroupMuteStateProps { readonly label: string; readonly detail?: string | null; }

/** 统一承载 runtime 恢复和配置异常。 */
function GroupMuteState({ label, detail }: GroupMuteStateProps) { return <main className="rn-group-action-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>; }

/** 将未知异常映射成稳定可见文案。 */
function readMuteError(cause: unknown): string { return cause instanceof Error && cause.message ? cause.message : '群禁言操作失败，请稍后重试'; }

export default GroupMutePage;
