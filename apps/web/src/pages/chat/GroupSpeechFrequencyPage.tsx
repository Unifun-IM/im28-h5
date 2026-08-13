import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Conversation, IMGroupSpeechFrequencySeconds, WebIMJoinedGroup } from '@im28/im-sdk/web';
import { Link, Navigate, useParams } from 'react-router-dom';

import backIconURL from '../../assets/rn/assets/icons/imm28/nav-arrow-left.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import './group-management-action-page.css';

/** RN 发言频率页支持的关闭和固定秒数档位。 */
const SPEECH_FREQUENCY_OPTIONS: readonly { readonly label: string; readonly seconds: 0 | IMGroupSpeechFrequencySeconds }[] = [
  { label: '关闭发言频率控制', seconds: 0 },
  { label: '30秒', seconds: 30 },
  { label: '1分钟', seconds: 60 },
  { label: '3分钟', seconds: 180 },
  { label: '5分钟', seconds: 300 },
  { label: '10分钟', seconds: 600 },
  { label: '30分钟', seconds: 1800 },
  { label: '1小时', seconds: 3600 },
];

/** 发言频率页面只持有选择态，业务提交由 shared facade 完成。 */
export function GroupSpeechFrequencyPage() {
  /** conversationID 来自群管理 SPA 子路由。 */
  const { conversationID = '' } = useParams();
  /** runtime 提供当前账号唯一 sync composition。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** sync 随认证 runtime 生命周期变化。 */
  const sync = useMemo(() => runtime?.getSync() ?? null, [runtime]);
  /** conversation 保存已验证的真实群会话。 */
  const [conversation, setConversation] = useState<Conversation | null>(null);
  /** group 保存 shared permission 和当前设置。 */
  const [group, setGroup] = useState<WebIMJoinedGroup | null>(null);
  /** selectedSeconds 在保存前只属于页面草稿。 */
  const [selectedSeconds, setSelectedSeconds] = useState<0 | IMGroupSpeechFrequencySeconds>(0);
  /** loading 覆盖 cache 与权威刷新。 */
  const [loading, setLoading] = useState(true);
  /** submitting 阻止重复保存。 */
  const [submitting, setSubmitting] = useState(false);
  /** error 显示真实 SDK/Gateway/SQLite 失败。 */
  const [error, setError] = useState<string | null>(null);

  /** manageURL 是页面固定返回目标。 */
  const manageURL = `/conversations/${encodeURIComponent(conversationID)}/settings/manage`;

  /** 按会话和 joined-group 恢复真实设置。 */
  const load = useCallback(async (): Promise<void> => {
    if (!sync || !snapshot.userID || !conversationID) return;
    setLoading(true);
    setError(null);
    try {
      /** conversations 先读当前账号 SQLite，缺失时再全量同步。 */
      let conversations = await sync.conversations.listCached({ limit: 500 });
      /** target 必须是当前真实群会话。 */
      let target = conversations.find(item => item.conversationID === conversationID);
      if (!target) {
        conversations = await sync.conversations.sync({ pageSize: 100 });
        target = conversations.find(item => item.conversationID === conversationID);
      }
      if (!target || target.type !== 'group' || !target.targetID.trim()) throw new Error('群聊不存在或尚未同步');
      setConversation(target);
      /** groups 先读 cache，随后刷新服务端设置。 */
      let groups = await sync.groups.listCached();
      let targetGroup = groups.find(item => item.groupID === target.targetID) ?? null;
      setGroup(targetGroup);
      groups = await sync.groups.sync({ pageSize: 100 });
      targetGroup = groups.find(item => item.groupID === target.targetID) ?? null;
      if (!targetGroup) throw new Error('群资料尚未同步');
      setGroup(targetGroup);
      /** seconds 仅在服务端明确开启时恢复，否则为关闭。 */
      const seconds = targetGroup.speechFrequencyEnabled
        ? normalizeSpeechFrequency(targetGroup.speechFrequencySeconds)
        : 0;
      setSelectedSeconds(seconds);
    } catch (cause) {
      setError(readActionError(cause, '发言频率加载失败'));
    } finally {
      setLoading(false);
    }
  }, [conversationID, snapshot.userID, sync]);

  useEffect(() => { void load(); }, [load]);

  /** 保存只调用 shared facade 的一个显式 patch。 */
  async function save(): Promise<void> {
    if (!sync || !conversation || submitting || !group?.permissions.canManageAdmins) return;
    setSubmitting(true);
    setError(null);
    try {
      /** options 关闭时不伪造无效 0 秒字段。 */
      const options = selectedSeconds === 0
        ? { groupID: conversation.targetID, speechFrequencyEnabled: false }
        : { groupID: conversation.targetID, speechFrequencyEnabled: true, speechFrequencySeconds: selectedSeconds };
      /** result 明确暴露远端成功、本地未收敛。 */
      const result = await sync.groupManagement.updateSettings(options);
      if (result.cacheState === 'remote-only') {
        setError('服务端设置已更新，本地群资料尚未收敛；请稍后刷新。');
        return;
      }
      window.history.back();
    } catch (cause) {
      setError(readActionError(cause, '发言频率保存失败'));
    } finally {
      setSubmitting(false);
    }
  }

  if (restoring) return <GroupActionState label="正在恢复发言频率" />;
  if (!runtime) return <GroupActionState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  if (!conversationID) return <Navigate to="/conversations" replace />;
  if (!loading && group && !group.permissions.canManageAdmins) return <Navigate to={manageURL} replace />;

  return (
    <main className="rn-group-action-page" aria-busy={loading || submitting}>
      <section className="rn-group-action-surface">
        <header className="rn-group-action-header"><Link to={manageURL} aria-label="返回群管理"><RNAssetIcon assetURL={backIconURL} /></Link><h1>发言频率</h1><button type="button" disabled={loading || submitting || !group} onClick={() => { void save(); }}>{submitting ? '保存中' : '确定'}</button></header>
        <div className="rn-group-action-content">
          {error ? <p className="rn-group-action-error" role="alert">{error}</p> : null}
          {loading ? <p className="rn-group-action-empty">正在加载发言频率</p> : null}
          {!loading && group && !error ? <section className="rn-group-action-card">{SPEECH_FREQUENCY_OPTIONS.map(option => <button className="rn-group-action-option" type="button" aria-pressed={selectedSeconds === option.seconds} disabled={submitting} key={option.seconds} onClick={() => setSelectedSeconds(option.seconds)}><span>{option.label}</span><span>{selectedSeconds === option.seconds ? '✓' : ''}</span></button>)}</section> : null}
        </div>
      </section>
    </main>
  );
}

/** 将服务端秒数限制在 RN 和 OpenAPI 的共同档位。 */
function normalizeSpeechFrequency(value: number | undefined): 0 | IMGroupSpeechFrequencySeconds {
  /** seconds 只接受固定白名单。 */
  const seconds = Number(value ?? 0);
  return [30, 60, 180, 300, 600, 1800, 3600].includes(seconds)
    ? seconds as IMGroupSpeechFrequencySeconds
    : 30;
}

/** 群动作页启动状态参数。 */
interface GroupActionStateProps { readonly label: string; readonly detail?: string | null; }

/** 统一承载 runtime 恢复和配置异常。 */
function GroupActionState({ label, detail }: GroupActionStateProps) { return <main className="rn-group-action-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>; }

/** 将未知异常映射成稳定可见文案。 */
function readActionError(cause: unknown, fallback: string): string { return cause instanceof Error && cause.message ? cause.message : fallback; }

export default GroupSpeechFrequencyPage;
