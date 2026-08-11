import type { Message, MessageRepository } from '@im28/im-sdk/core';
import type { WebIMForwardMessagesOptions } from './message-forward-types.js';
import { type WebIMSyncContext } from './sync-context.js';
/** 校验平台提供的输出 ID 与来源顺序严格对齐，防止覆盖来源或批内实体。 */
export declare function normalizeForwardOutputIDs(options: WebIMForwardMessagesOptions, sourceClientMsgIDs: readonly string[]): readonly (string | undefined)[];
/** 防止平台注入的稳定 ID 覆盖当前账号内不相关的缓存消息。 */
export declare function assertReusableForwardOutputRows(params: {
    readonly context: WebIMSyncContext;
    readonly conversationID: string;
    readonly messageRepository: MessageRepository;
    readonly sourceMessages: readonly Message[];
    readonly outputClientMsgIDs: readonly (string | undefined)[];
    readonly commentText: string;
    readonly commentClientMsgID: string;
}): Promise<void>;
//# sourceMappingURL=message-forward-identities.d.ts.map