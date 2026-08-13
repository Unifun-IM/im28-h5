import type { WebIMForwardMessagesDependencies } from './message-forward.js';
import type { WebIMForwardMessagesToTargetsOptions, WebIMForwardMessagesToTargetsResult } from './message-forward-types.js';
import { type WebIMSyncContext } from './sync-context.js';
/** Gateway 批量目标能力允许的最大转发目标数。 */
export declare const IM_FORWARD_MAX_TARGETS = 50;
/** 在 shared owner 内复用现有单目标状态机，逐目标收敛真实转发结果。 */
export declare function forwardWebIMMessagesToTargets(context: WebIMSyncContext, options: WebIMForwardMessagesToTargetsOptions, dependencies: WebIMForwardMessagesDependencies): Promise<WebIMForwardMessagesToTargetsResult>;
/** 规范多目标会话身份并在副作用前拒绝空集合或超限。 */
export declare function normalizeForwardConversationIDs(values: readonly string[]): readonly string[];
export type { WebIMForwardMessagesToTargetsOptions, WebIMForwardMessagesToTargetsResult, WebIMForwardTargetResult, } from './message-forward-types.js';
//# sourceMappingURL=message-forward-targets.d.ts.map