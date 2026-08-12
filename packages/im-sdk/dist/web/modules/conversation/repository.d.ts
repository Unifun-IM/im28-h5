import type { Conversation } from '../../core/types.js';
import type { DatabaseAdapter, DatabaseRow } from '../../db/database.js';
import { Repository } from '../../db/repository.js';
export interface ConversationListOptions {
    readonly limit?: number;
    readonly offset?: number;
    readonly archived?: boolean;
}
export declare class ConversationRepository extends Repository {
    constructor(database: DatabaseAdapter);
    upsert(conversation: Conversation): Promise<void>;
    getByID(conversationID: string): Promise<Conversation | null>;
    list(options?: ConversationListOptions): Promise<readonly Conversation[]>;
    replaceAll(conversations: readonly Conversation[]): Promise<void>;
    /** 只替换普通会话集合，保留独立归档端点维护的归档快照。 */
    replaceUnarchived(conversations: readonly Conversation[]): Promise<void>;
    /** 用服务端完整归档快照收敛索引，同时保留已取消归档会话的其他本地字段。 */
    reconcileArchivedSnapshot(conversations: readonly Conversation[]): Promise<void>;
    updateLatestMessage(conversationID: string, latestMessageID: string, updatedAt: number): Promise<void>;
    incrementUnread(conversationID: string, count?: number): Promise<void>;
    updatePinned(conversationID: string, isPinned: boolean, pinnedAt?: number): Promise<void>;
    updateMuted(conversationID: string, isMuted: boolean): Promise<void>;
    /** 更新服务端确认的自动删除设置，不修改已有消息记录。 */
    updateAutoDelete(conversationID: string, autoDeleteSeconds: number, updatedBy?: string, updatedAt?: number): Promise<void>;
    updateDraft(conversationID: string, draft: string): Promise<void>;
    deleteByID(conversationID: string): Promise<void>;
}
/** 将 conversations 表行恢复为平台中立会话。 */
export declare function mapStoredConversationRow(row: DatabaseRow): Conversation;
/** 构造事务内完整会话写入语句，避免归档同步绕过 Repository 字段契约。 */
export declare function createConversationUpsertStatement(conversation: Conversation): import("../../db/database.js").DatabaseStatement;
//# sourceMappingURL=repository.d.ts.map