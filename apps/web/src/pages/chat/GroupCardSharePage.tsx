import { useCallback, useEffect, useState } from 'react';
import { IM_BROADCAST_MAX_TARGETS, type Conversation, type WebIMJoinedGroup } from '@im28/im-sdk/web';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { ChatTargetPickerModal, type ChatTargetPickerItem } from '../../components/chat-target-picker/index.js';
import { useWebIMRuntime } from '../../runtime/index.js';

/** 群名片来源只保留当前账号真实会话和群快照。 */
interface GroupCardShareSource {
  readonly conversation: Conversation;
  readonly group: WebIMJoinedGroup;
}

/** 群名片兼容路由恢复来源后使用统一多选弹窗。 */
export function GroupCardSharePage() {
  /** conversationID 来自稳定 SPA path。 */
  const { conversationID = '' } = useParams();
  /** navigate 关闭弹窗后返回来源页。 */
  const navigate = useNavigate();
  /** runtime 提供群资料和群名片 shared mutation。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** source 保存已验证的群会话和群资料。 */
  const [source, setSource] = useState<GroupCardShareSource | null>(null);
  /** loading 标识来源恢复轮次。 */
  const [loading, setLoading] = useState(true);
  /** sharing 阻止多目标重复分享。 */
  const [sharing, setSharing] = useState(false);
  /** shareCompleted 在部分成功后阻止重复发送已成功目标。 */
  const [shareCompleted, setShareCompleted] = useState(false);
  /** error 呈现真实读取或写入失败。 */
  const [error, setError] = useState<string | null>(null);

  /** 从当前账号 cache 和 canonical sync 恢复群来源。 */
  const load = useCallback(async (): Promise<void> => {
    if (!runtime || !snapshot.userID || !conversationID) return;
    /** sync 是来源读取唯一 owner。 */
    const sync = runtime.getSync();
    setLoading(true);
    setError(null);
    setShareCompleted(false);
    try {
      let conversations = await sync.conversations.listCached({ limit: 500 });
      let conversation = conversations.find(item => item.conversationID === conversationID);
      if (!conversation) {
        conversations = await sync.conversations.sync({ pageSize: 100 });
        conversation = conversations.find(item => item.conversationID === conversationID);
      }
      if (!conversation || conversation.type !== 'group') throw new Error('群聊不存在或尚未同步');
      /** groups 由 canonical facade 刷新并落库。 */
      const groups = await sync.groups.sync({ pageSize: 100 });
      /** group 必须与会话 target 匹配。 */
      const group = groups.find(item => item.groupID === conversation.targetID);
      if (!group) throw new Error('群资料不存在或尚未同步');
      setSource({ conversation, group });
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : '群名片数据加载失败');
    } finally {
      setLoading(false);
    }
  }, [conversationID, runtime, snapshot.userID]);

  useEffect(() => { void load(); }, [load]);

  /** 向全部选中好友或群聊执行 shared type108 批量发送。 */
  async function shareCard(targets: readonly ChatTargetPickerItem[]): Promise<void> {
    if (!runtime || !source || sharing) return;
    setSharing(true);
    setError(null);
    try {
      /** result 按目标保留 sent、failed 和 unknown。 */
      const result = await runtime.getSync().messageBroadcast.sendCard({
        targets: targets.map(target => ({ kind: target.kind, targetID: target.id })),
        card: {
          type: 'group',
          groupID: source.group.groupID,
          groupName: source.group.name,
          avatarURL: source.group.avatarURL,
        },
      });
      if (result.successCount === 0) {
        setError(`群名片发送失败：${result.failedCount + result.unknownCount}个目标未成功`);
        return;
      }
      if (result.failedCount || result.unknownCount) {
        setShareCompleted(true);
        setError(`已发送到${result.successCount}个目标，${result.failedCount + result.unknownCount}个目标未成功`);
        return;
      }
      navigate(-1);
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : '分享群名片失败');
    } finally {
      setSharing(false);
    }
  }

  if (restoring) return <GroupCardShareState label="正在恢复会话" />;
  if (!runtime) return <GroupCardShareState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  return <main className="rn-contact-card-share-page" aria-busy={loading || sharing}><ChatTargetPickerModal open sync={runtime.getSync()} selectionMode="multiple" excludeUserIDs={[snapshot.userID]} maxSelected={IM_BROADCAST_MAX_TARGETS} actionLabel="分享" pending={sharing} confirmDisabled={loading || !source || shareCompleted} operationError={error} onClose={() => navigate(-1)} onConfirm={targets => { void shareCard(targets); }} /></main>;
}

/** 统一呈现群名片来源恢复状态。 */
function GroupCardShareState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-contact-card-share-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

export default GroupCardSharePage;
