import type { Message, MessageStatus } from '../../core/types.js';
import type { DatabaseAdapter } from '../../db/database.js';
import { Repository } from '../../db/repository.js';
export interface MessageHistoryOptions {
    readonly conversationID: string;
    readonly limit?: number;
    readonly beforeSendTime?: number;
    /** 按会话 seq 截止读取，供已读与未读窗口独立恢复。 */
    readonly maxSeq?: number;
}
export interface MessageSearchOptions {
    readonly conversationID?: string;
    readonly keyword?: string;
    readonly contentTypes?: readonly number[];
    readonly limit?: number;
    readonly offset?: number;
}
export declare class MessageRepository extends Repository {
    constructor(database: DatabaseAdapter);
    upsert(message: Message): Promise<void>;
    /** 在一个数据库事务中写入同一批消息，避免 optimistic 批次部分落库。 */
    upsertMany(messages: readonly Message[]): Promise<void>;
    getByClientMsgID(clientMsgID: string): Promise<Message | null>;
    getByServerMsgID(serverMsgID: string): Promise<Message | null>;
    getHistory(options: MessageHistoryOptions): Promise<readonly Message[]>;
    search(options: MessageSearchOptions): Promise<readonly Message[]>;
    updateStatus(clientMsgID: string, status: MessageStatus): Promise<void>;
    /** 将指定账号遗留的 outgoing sending 行恢复为可显式重试状态。 */
    failInterruptedOutgoingSends(senderID: string): Promise<number>;
    markLocalDeleted(clientMsgID: string): Promise<void>;
    /** 在单个事务中隐藏已获确认的消息集合。 */
    markLocalDeletedMany(clientMsgIDs: readonly string[]): Promise<void>;
    deleteByConversationID(conversationID: string): Promise<void>;
}
//# sourceMappingURL=repository.d.ts.map