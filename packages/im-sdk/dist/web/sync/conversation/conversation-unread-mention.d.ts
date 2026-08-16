import { type Conversation, type Message } from '@im28/im-sdk/core';
import type { WebIMSyncContext } from '../sync-context.js';
/** 未读 mention 快照组合稳定消息身份与已有群成员名称。 */
export interface WebIMUnreadMentionSnapshot {
    readonly message: Message;
    readonly senderDisplayName?: string;
}
/** 读取单个群会话的最近未读 mention 与可用发送人名称。 */
export declare function readUnreadMentionSnapshot(context: WebIMSyncContext, conversation: Conversation): Promise<WebIMUnreadMentionSnapshot | null>;
//# sourceMappingURL=conversation-unread-mention.d.ts.map