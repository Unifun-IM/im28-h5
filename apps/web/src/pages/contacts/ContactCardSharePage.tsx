import { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

import { ChatTargetPickerModal, type ChatTargetPickerItem } from '../../components/chat-target-picker/index.js';
import { useAppToast } from '../../components/interaction/index.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { readContactCardShareLocationState } from './contact-action-view.js';

/** 好友名片兼容路由只恢复名片来源并呈现统一弹窗。 */
export function ContactCardSharePage() {
  /** routeUserID 标识正在分享的好友名片。 */
  const { userID: routeUserID = '' } = useParams();
  /** location 只提供已校验的公开名片状态。 */
  const location = useLocation();
  /** navigate 关闭弹窗后返回来源页。 */
  const navigate = useNavigate();
  /** runtime 提供联系人 shared mutation。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** toast 承载好友名片发送成功反馈。 */
  const { toast } = useAppToast();
  /** shareState 严格校验 URL 与 history state。 */
  const shareState = useMemo(
    () => readContactCardShareLocationState(location.state, routeUserID),
    [location.state, routeUserID],
  );
  /** sharing 阻止唯一好友目标重复提交。 */
  const [sharing, setSharing] = useState(false);
  /** shareCompleted 在部分成功后阻止重复发送已成功目标。 */
  const [shareCompleted, setShareCompleted] = useState(false);
  /** error 呈现真实 shared mutation 失败。 */
  const [error, setError] = useState<string | null>(null);

  /** 向唯一选中好友执行 shared type108 发送。 */
  async function shareCard(targets: readonly ChatTargetPickerItem[]): Promise<void> {
    /** target 必须是统一弹窗交付的唯一好友目标。 */
    const target = targets[0];
    if (!runtime || !shareState || sharing || !target || target.kind !== 'friend') return;
    setSharing(true);
    setError(null);
    try {
      /** result 按目标保留 sent、failed 和 unknown。 */
      const result = await runtime.getSync().messageBroadcast.sendCard({
        targets: [{ kind: 'friend', targetID: target.id }],
        card: {
          type: 'user',
          userID: shareState.card.userID,
          nickname: shareState.card.displayName,
          avatarURL: shareState.card.avatarURL,
        },
      });
      if (result.successCount === 0) {
        setError(`好友名片发送失败：${result.failedCount + result.unknownCount}个目标未成功`);
        return;
      }
      if (result.failedCount || result.unknownCount) {
        setShareCompleted(true);
        setError(`已发送到${result.successCount}个目标，${result.failedCount + result.unknownCount}个目标未成功`);
        return;
      }
      toast.success('好友名片已发送');
      navigate(-1);
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : '分享好友名片失败');
    } finally {
      setSharing(false);
    }
  }

  if (restoring) return <CardShareState label="正在恢复名片" />;
  if (!runtime) return <CardShareState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  if (!shareState) return <Navigate to={`/contacts/users/${encodeURIComponent(routeUserID)}`} replace />;
  return <main className="rn-contact-card-share-page"><ChatTargetPickerModal open sync={runtime.getSync()} selectionMode="single" allowedKinds={['friend']} excludeUserIDs={[snapshot.userID, routeUserID]} actionLabel="分享" pending={sharing} confirmDisabled={shareCompleted} operationError={error} onClose={() => navigate(-1)} onConfirm={targets => { void shareCard(targets); }} /></main>;
}

/** 统一呈现名片恢复与运行配置状态。 */
function CardShareState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-contact-card-share-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

export default ContactCardSharePage;
