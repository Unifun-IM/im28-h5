import { WebIMRuntimeError } from './runtime-error.js';
// 状态表是 lifecycle 的唯一语义 owner，runtime orchestrator 只能派发事件。
const WEB_IM_RUNTIME_TRANSITIONS = {
    anonymous: {
        auth_started: 'authenticating',
        auth_restored: 'authenticated',
        offline_restored: 'offline-readonly',
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
    'offline-readonly': {
        offline_reconnect_started: 'offline-validating',
        signed_out: 'anonymous',
    },
    'offline-validating': {
        offline_reconnect_failed: 'offline-readonly',
        offline_reconnect_succeeded: 'authenticated',
        offline_session_invalid: 'anonymous',
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
export function transitionWebIMRuntimeState(currentState, event) {
    // undefined 代表 orchestration 顺序错误，不能静默保留旧状态。
    const nextState = WEB_IM_RUNTIME_TRANSITIONS[currentState][event];
    if (!nextState) {
        throw new WebIMRuntimeError('INVALID_LIFECYCLE_TRANSITION', `Cannot apply ${event} while Web IM runtime is ${currentState}.`);
    }
    return nextState;
}
//# sourceMappingURL=runtime-lifecycle.js.map