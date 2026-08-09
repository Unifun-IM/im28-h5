import { WebIMRuntimeError } from './runtime-error.js';

/** Web IM auth 与 realtime 合并后的可观察 runtime 状态。 */
export type WebIMRuntimeState =
  | 'anonymous'
  | 'authenticating'
  | 'authenticated'
  | 'connecting'
  | 'online'
  | 'reconnecting';

/** 能驱动 runtime 状态变化的显式事件。 */
export type WebIMRuntimeEvent =
  | 'auth_started'
  | 'auth_restored'
  | 'auth_succeeded'
  | 'auth_failed'
  | 'realtime_connecting'
  | 'realtime_connected'
  | 'realtime_disconnected'
  | 'token_expired'
  | 'signed_out';

// 状态表是 lifecycle 的唯一语义 owner，runtime orchestrator 只能派发事件。
const WEB_IM_RUNTIME_TRANSITIONS: Readonly<
  Record<
    WebIMRuntimeState,
    Readonly<Partial<Record<WebIMRuntimeEvent, WebIMRuntimeState>>>
  >
> = {
  anonymous: {
    auth_started: 'authenticating',
    auth_restored: 'authenticated',
    signed_out: 'anonymous',
  },
  authenticating: {
    auth_succeeded: 'authenticated',
    auth_failed: 'anonymous',
    signed_out: 'anonymous',
  },
  authenticated: {
    realtime_connecting: 'connecting',
    token_expired: 'anonymous',
    signed_out: 'anonymous',
  },
  connecting: {
    realtime_connected: 'online',
    realtime_disconnected: 'reconnecting',
    token_expired: 'anonymous',
    signed_out: 'anonymous',
  },
  online: {
    realtime_disconnected: 'reconnecting',
    token_expired: 'anonymous',
    signed_out: 'anonymous',
  },
  reconnecting: {
    realtime_connecting: 'connecting',
    realtime_connected: 'online',
    token_expired: 'anonymous',
    signed_out: 'anonymous',
  },
};

/** 根据唯一状态表计算下一状态，非法转换必须显式失败。 */
export function transitionWebIMRuntimeState(
  currentState: WebIMRuntimeState,
  event: WebIMRuntimeEvent,
): WebIMRuntimeState {
  // undefined 代表 orchestration 顺序错误，不能静默保留旧状态。
  const nextState = WEB_IM_RUNTIME_TRANSITIONS[currentState][event];
  if (!nextState) {
    throw new WebIMRuntimeError(
      'INVALID_LIFECYCLE_TRANSITION',
      `Cannot apply ${event} while Web IM runtime is ${currentState}.`,
    );
  }
  return nextState;
}
