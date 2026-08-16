import { type Conversation, type DatabaseAdapter } from '@im28/im-sdk/core';
/** 单次清空边界收敛所需的目标和本地操作时间。 */
export interface ApplyConversationClearBoundaryOptions {
    readonly conversationID: string;
    readonly clearBeforeSeq: string;
    readonly removeUnsequencedBefore?: number;
    readonly updatedAt?: number;
}
/** 归一化 Gateway uint64 cursor，拒绝空值、负数和非十进制输入。 */
export declare function normalizeConversationClearCursor(value: unknown): string;
/** 判断带精确 seq 的服务端消息是否位于当前清空边界之后。 */
export declare function isConversationMessageAfterClearBoundary(messageSeq: unknown, clearBeforeSeq: string | undefined): boolean;
/** 比较十进制 cursor，返回更大的单调边界。 */
export declare function maxConversationClearCursor(left: string | undefined, right: string): string;
/** 在一个 SQLite 事务中删除边界内消息并推进会话摘要。 */
export declare function applyConversationClearBoundary(database: DatabaseAdapter, options: ApplyConversationClearBoundaryOptions): Promise<Conversation>;
//# sourceMappingURL=conversation-clear-state.d.ts.map