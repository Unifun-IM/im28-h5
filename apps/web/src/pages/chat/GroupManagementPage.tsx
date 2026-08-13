import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  type Conversation,
  type WebIMJoinedGroup,
} from '@im28/im-sdk/web';
import { Link, Navigate, useParams } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import arrowIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-right.regular.svg';
import { InteractionModal } from '../../components/interaction/index.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import './group-management-page.css';

/** 群设置开关动作只保存 shared patch 字段与下一布尔值。 */
type GroupSettingAction = {
  readonly type: 'join-approval' | 'member-invite' | 'member-add-friend';
  readonly nextValue: boolean;
};

/** RN 群管理首页只消费 shared 群设置 facade 并导航到独立角色页面。 */
export function GroupManagementPage() {
  /** conversationID 来自稳定群设置 SPA 子路由。 */
  const { conversationID = '' } = useParams();
  /** runtime 提供当前认证账号和唯一 Web sync composition。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** sync 生命周期绑定当前认证 runtime。 */
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  /** conversation 保存已验证的真实群会话。 */
  const [conversation, setConversation] = useState<Conversation | null>(null);
  /** group 保存 shared capability 和群主身份。 */
  const [group, setGroup] = useState<WebIMJoinedGroup | null>(null);
  /** loading 覆盖首次 cache 与权威刷新。 */
  const [loading, setLoading] = useState(true);
  /** submitting 阻止设置 mutation 重复提交。 */
  const [submitting, setSubmitting] = useState(false);
  /** settingAction 驱动非破坏性设置二次确认。 */
  const [settingAction, setSettingAction] = useState<GroupSettingAction | null>(null);
  /** error 保留真实 SDK、Gateway 或 SQLite 失败。 */
  const [error, setError] = useState<string | null>(null);
  /** notice 展示成功且已收敛的设置变更。 */
  const [notice, setNotice] = useState<string | null>(null);

  /** 按会话、群资料顺序恢复真实管理事实。 */
  const load = useCallback(async (): Promise<void> => {
    if (!sync || !snapshot.userID || !conversationID) return;
    setLoading(true);
    setError(null);
    try {
      /** conversations 先读 cache，缺失时才执行 canonical 同步。 */
      let conversations = await sync.conversations.listCached({ limit: 500 });
      /** target 必须是当前账号真实群会话。 */
      let target = conversations.find(item => item.conversationID === conversationID);
      if (!target) {
        conversations = await sync.conversations.sync({ pageSize: 100 });
        target = conversations.find(item => item.conversationID === conversationID);
      }
      if (!target || target.type !== 'group' || !target.targetID.trim()) {
        throw new Error('群聊不存在或尚未同步');
      }
      setConversation(target);
      /** groupID 只来自已验证 Conversation targetID。 */
      const groupID = target.targetID.trim();
      /** cachedGroups 让弱网管理页先恢复可用群设置。 */
      const cachedGroups = await sync.groups.listCached();
      setGroup(cachedGroups.find(item => item.groupID === groupID) ?? null);
      /** refreshedGroups 刷新 capability 和群设置，不在首页拉取成员。 */
      const refreshedGroups = await sync.groups.sync({ pageSize: 100 });
      setGroup(refreshedGroups.find(item => item.groupID === groupID) ?? null);
    } catch (cause) {
      setError(readGroupManagementError(cause));
    } finally {
      setLoading(false);
    }
  }, [conversationID, snapshot.userID, sync]);

  useEffect(() => { void load(); }, [load]);

  /** settingsURL 是管理页固定返回目标。 */
  const settingsURL = `/conversations/${encodeURIComponent(conversationID)}/settings`;
  /** muteURL 指向群禁言唯一 SPA 子路由。 */
  const muteURL = `${settingsURL}/manage/mute`;
  /** speechURL 指向发言频率唯一 SPA 子路由。 */
  const speechURL = `${settingsURL}/manage/speech-frequency`;
  /** adminsURL 指向群管理员列表唯一 SPA 子路由。 */
  const adminsURL = `${settingsURL}/manage/admins`;
  /** ownerTransferURL 指向群主转让唯一 SPA 子路由。 */
  const ownerTransferURL = `${settingsURL}/manage/owner-transfer`;

  /** 设置确认后只提交一个显式 shared patch，并从 SQLite 恢复页面 DTO。 */
  async function confirmSettingAction(): Promise<void> {
    if (!sync || !conversation || !settingAction || submitting) return;
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      /** options 严格对应 RN 三个开关，未修改字段保持 undefined。 */
      const options = settingAction.type === 'join-approval'
        ? { groupID: conversation.targetID, joinApprovalRequired: settingAction.nextValue }
        : settingAction.type === 'member-invite'
          ? { groupID: conversation.targetID, allowMemberInvite: settingAction.nextValue }
          : { groupID: conversation.targetID, allowMemberAddFriend: settingAction.nextValue };
      /** result 明确区分本地已收敛和远端部分成功。 */
      const result = await sync.groupManagement.updateSettings(options);
      setSettingAction(null);
      if (result.cacheState === 'remote-only') {
        setError('服务端设置已更新，本地群资料尚未收敛；请稍后刷新。');
        return;
      }
      /** cachedGroups 使用 shared mapper 恢复完整页面字段和权限。 */
      const cachedGroups = await sync.groups.listCached();
      setGroup(cachedGroups.find(item => item.groupID === conversation.targetID) ?? null);
      setNotice('设置成功');
    } catch (cause) {
      setError(readGroupManagementError(cause));
      setSettingAction(null);
    } finally {
      setSubmitting(false);
    }
  }

  if (restoring) return <GroupManagementState label="正在恢复群管理" />;
  if (!runtime) return <GroupManagementState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  if (!conversationID) return <Navigate to="/conversations" replace />;
  if (!loading && !error && (!group || !group.permissions.canOpenGroupManage)) {
    return <Navigate to={settingsURL} replace />;
  }

  return (
    <main className="rn-group-management-page" aria-busy={loading || submitting}>
      <section className="rn-group-management-surface">
        <PageNavbar className="rn-group-management-header">
          <Link to={settingsURL} aria-label="返回群设置"><RNAssetIcon assetURL={backIconURL} /></Link>
          <h1>群管理</h1><span />
        </PageNavbar>
        <div className="rn-group-management-content">
          {error ? <p className="rn-group-management-error" role="alert">{error}</p> : null}
          {notice ? <p className="rn-group-management-notice" role="status">{notice}</p> : null}
          {loading ? <p className="rn-group-management-empty">正在加载群管理</p> : null}
          {!loading && group?.permissions.canManageAdmins ? (
            <section className="rn-group-management-card">
              <ManagementSwitch label="入群验证" checked={group.joinApprovalRequired === true} disabled={submitting} onChange={() => setSettingAction({ type: 'join-approval', nextValue: group.joinApprovalRequired !== true })} />
              <ManagementSwitch label="邀请好友" checked={group.allowMemberInvite === true} disabled={submitting} onChange={() => setSettingAction({ type: 'member-invite', nextValue: group.allowMemberInvite !== true })} />
              <ManagementSwitch label="群内可互加好友" checked={group.allowMemberAddFriend === true} disabled={submitting} divided={false} onChange={() => setSettingAction({ type: 'member-add-friend', nextValue: group.allowMemberAddFriend !== true })} />
            </section>
          ) : null}
          {!loading && (group?.permissions.canMuteAll || group?.permissions.canMuteMembers || group?.permissions.canManageAdmins) ? (
            <section className="rn-group-management-card">
              {group.permissions.canMuteAll || group.permissions.canMuteMembers ? <ManagementLink label="群禁言" value={group.muteAll ? '全员禁言' : group.muteMember ? '普通成员禁言' : '关闭'} to={muteURL} /> : null}
              {group.permissions.canManageAdmins ? <ManagementLink label="发言频率" value={formatSpeechFrequency(group.speechFrequencyEnabled === true, group.speechFrequencySeconds)} to={speechURL} divided={false} /> : null}
            </section>
          ) : null}
          {!loading && group?.permissions.canManageAdmins ? (
            <section className="rn-group-management-card">
              <ManagementLink label="管理员设置" value="" to={adminsURL} divided={false} />
            </section>
          ) : null}
          {!loading && group?.permissions.canTransferOwner ? (
            <section className="rn-group-management-card">
              <ManagementLink label="转让群主" value="" to={ownerTransferURL} divided={false} />
            </section>
          ) : null}
          {!loading && !error && !group?.permissions.canManageAdmins && !group?.permissions.canTransferOwner ? <p className="rn-group-management-empty">当前账号暂无可管理项目</p> : null}
        </div>
      </section>
      <InteractionModal open={Boolean(settingAction)} ariaLabel="确认群设置" onRequestClose={() => { if (!submitting) setSettingAction(null); }}>
        <section className="rn-group-management-confirm im-modal-sheet">
          <h2>确认设置</h2>
          <p>{buildSettingConfirmText(settingAction)}</p>
          <div><button type="button" disabled={submitting} onClick={() => setSettingAction(null)}>取消</button><button type="button" disabled={submitting} onClick={() => { void confirmSettingAction(); }}>{submitting ? '处理中' : '确认'}</button></div>
        </section>
      </InteractionModal>
    </main>
  );
}

/** 群管理开关保持 RN 稳定行高并只发出明确下一状态。 */
function ManagementSwitch({ label, checked, disabled, divided = true, onChange }: { readonly label: string; readonly checked: boolean; readonly disabled: boolean; readonly divided?: boolean; readonly onChange: () => void }) {
  return <div className={`rn-group-management-switch${divided ? ' is-divided' : ''}`}><span>{label}</span><button type="button" role="switch" aria-label={label} aria-checked={checked} disabled={disabled} onClick={onChange}><span /></button></div>;
}

/** 群管理详情行使用 React Router Link 保持 SPA 导航。 */
function ManagementLink({ label, value, to, divided = true }: { readonly label: string; readonly value: string; readonly to: string; readonly divided?: boolean }) {
  return <Link className={`rn-group-management-link${divided ? ' is-divided' : ''}`} to={to}><span>{label}</span><span><small>{value}</small><RNAssetIcon assetURL={arrowIconURL} /></span></Link>;
}

/** 将 RN 发言频率档位投影为管理页副标题。 */
function formatSpeechFrequency(enabled: boolean, seconds = 0): string {
  if (!enabled) return '关闭';
  /** labels 只覆盖 Gateway 支持的固定秒数。 */
  const labels: Readonly<Record<number, string>> = { 30: '30秒', 60: '1分钟', 180: '3分钟', 300: '5分钟', 600: '10分钟', 1800: '30分钟', 3600: '1小时' };
  return labels[seconds] ?? `${seconds || 30}秒`;
}

/** 构造设置确认文案，不在页面重述权限规则。 */
function buildSettingConfirmText(action: GroupSettingAction | null): string {
  if (!action) return '';
  /** labels 对齐 RN 设置名称。 */
  const labels = { 'join-approval': '入群验证', 'member-invite': '邀请好友', 'member-add-friend': '群内可互加好友' } as const;
  return `确定${action.nextValue ? '开启' : '关闭'}“${labels[action.type]}”吗？`;
}

/** 将共享异常转换为不含凭据的页面文案。 */
function readGroupManagementError(cause: unknown): string { return cause instanceof Error && cause.message ? cause.message : '群管理操作失败，请稍后重试'; }

/** 群管理启动状态参数。 */
interface GroupManagementStateProps { readonly label: string; readonly detail?: string | null; }

/** 统一承载 runtime 恢复和配置异常。 */
function GroupManagementState({ label, detail }: GroupManagementStateProps) { return <main className="rn-group-management-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>; }

export default GroupManagementPage;
