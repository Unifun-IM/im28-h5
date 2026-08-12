import type { Message } from '@im28/im-sdk/core';
import { type WebIMMessageSendDependencies } from './message-send-state.js';
import { type WebIMSyncContext } from './sync-context.js';
/** 群名片分享参数保留 RN 已有的多好友目标和可选附言。 */
export interface IMShareGroupCardOptions {
    readonly groupID: string;
    readonly groupName: string;
    readonly faceURL?: string;
    readonly targetUserIDs: readonly string[];
    readonly message?: string;
}
/** 群名片分享结果暴露真实会话与已持久化消息供平台投影。 */
export interface IMShareGroupCardResult {
    readonly groupID: string;
    readonly targetUserIDs: readonly string[];
    readonly conversationIDs: readonly string[];
    readonly cardMessages: readonly Message[];
    readonly noteMessages: readonly Message[];
}
/** 在冻结账号上下文中执行 RN/Web/Desktop 共用的群名片发送顺序。 */
export declare function shareIMGroupCard(context: WebIMSyncContext, options: IMShareGroupCardOptions, dependencies: WebIMMessageSendDependencies): Promise<IMShareGroupCardResult>;
//# sourceMappingURL=group-card-share.d.ts.map