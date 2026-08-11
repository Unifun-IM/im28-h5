import type { Message } from '../../core/types.js';
import type { DatabaseAdapter } from '../../db/database.js';
/** 未读 mention 查询只接受稳定会话、账号身份和服务端 seq 边界。 */
export interface LatestUnreadMentionOptions {
    readonly conversationID: string;
    readonly currentUserID: string;
    readonly lastReadSeq: number;
}
/** 从当前账号 SQLite 读取未读区间内最近一条命中本人或全员的 incoming mention。 */
export declare function findLatestUnreadMention(database: DatabaseAdapter, options: LatestUnreadMentionOptions): Promise<Message | null>;
//# sourceMappingURL=unread-mention.d.ts.map