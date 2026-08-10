import type { Conversation } from '../../core/types.js';
import type { DatabaseAdapter } from '../../db/database.js';
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
    updateLatestMessage(conversationID: string, latestMessageID: string, updatedAt: number): Promise<void>;
    incrementUnread(conversationID: string, count?: number): Promise<void>;
    updatePinned(conversationID: string, isPinned: boolean, pinnedAt?: number): Promise<void>;
    updateMuted(conversationID: string, isMuted: boolean): Promise<void>;
    updateDraft(conversationID: string, draft: string): Promise<void>;
    deleteByID(conversationID: string): Promise<void>;
}
//# sourceMappingURL=repository.d.ts.map