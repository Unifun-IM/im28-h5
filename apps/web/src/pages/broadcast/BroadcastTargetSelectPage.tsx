import { useMemo } from 'react';
import { IM_BROADCAST_MAX_TARGETS, type IMBroadcastTarget } from '@im28/im-sdk/web';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { ChatTargetPickerModal, type ChatTargetPickerItem } from '../../components/chat-target-picker/index.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { readBroadcastBackHref, readBroadcastRouteState } from './broadcast-route.js';

/** 群发目标兼容路由只恢复来源并呈现统一多选弹窗。 */
export function BroadcastTargetSelectPage() {
  /** location 提供返回入口和 compose 返回的初始目标。 */
  const location = useLocation();
  /** navigate 只负责关闭弹窗或进入 compose。 */
  const navigate = useNavigate();
  /** runtime 提供目标列表 facade。 */
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  /** routeState 只接受稳定群发目标身份。 */
  const routeState = useMemo(() => readBroadcastRouteState(location.state), [location.state]);
  /** backHref 从白名单状态恢复。 */
  const backHref = routeState?.backHref ?? readBroadcastBackHref(location.state);
  /** initialSelectedKeys 把稳定业务身份映射到通用弹窗 key。 */
  const initialSelectedKeys = useMemo(() => (routeState?.targets ?? [])
    .map(target => `${target.kind}:${target.targetID}`), [routeState]);

  /** 选择确认后只把稳定目标身份交给 compose route。 */
  function startBroadcast(targets: readonly ChatTargetPickerItem[]): void {
    /** identities 丢弃全部 UI 展示字段。 */
    const identities: readonly IMBroadcastTarget[] = targets.map(target => ({
      kind: target.kind,
      targetID: target.id,
    }));
    navigate('/broadcast/compose', { state: { targets: identities, backHref } });
  }

  if (restoring) return <BroadcastPageState label="正在恢复会话" />;
  if (!runtime) return <BroadcastPageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;
  return (
    <main className="rn-broadcast-page">
      <ChatTargetPickerModal
        open
        sync={runtime.getSync()}
        selectionMode="multiple"
        excludeUserIDs={[snapshot.userID]}
        maxSelected={IM_BROADCAST_MAX_TARGETS}
        initialSelectedKeys={initialSelectedKeys}
        actionLabel="开始群发消息"
        onClose={() => navigate(backHref, { replace: true })}
        onConfirm={startBroadcast}
      />
    </main>
  );
}

/** 群发兼容路由状态参数。 */
interface BroadcastPageStateProps {
  readonly label: string;
  readonly detail?: string | null;
}

/** 统一承载 runtime 恢复和配置错误。 */
function BroadcastPageState({ label, detail }: BroadcastPageStateProps) {
  return <main className="rn-broadcast-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}

export default BroadcastTargetSelectPage;
