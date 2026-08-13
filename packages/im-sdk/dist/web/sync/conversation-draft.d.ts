import { type Conversation, type PresetEmojiDocument } from '@im28/im-sdk/core';
import { type WebIMSyncContextDependencies } from './sync-context.js';
import { type WebIMSyncMutationQueueDependencies } from './sync-mutation-queue.js';
/** 会话草稿 facade 统一正文与预设表情实体的账号内 SQLite 读写。 */
export interface IMConversationDraftSync {
    /** 读取当前账号指定会话的规范草稿文档。 */
    getDraft(conversationID: string): Promise<PresetEmojiDocument>;
    /** 保存规范草稿并返回完成收敛的会话快照。 */
    saveDraft(conversationID: string, document: PresetEmojiDocument): Promise<Conversation>;
}
/** 草稿能力只依赖账号数据库和共享写队列，不调用远端接口。 */
export interface IMConversationDraftSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies {
}
/** 创建 RN、Web 与 Desktop 可复用的本地会话草稿 facade。 */
export declare function createIMConversationDraftSync(dependencies: IMConversationDraftSyncDependencies): IMConversationDraftSync;
/** 从会话 draft 索引和扩展 payload 恢复合法草稿文档。 */
export declare function readIMConversationDraftDocument(conversation: Pick<Conversation, 'draft' | 'payload'>): PresetEmojiDocument;
//# sourceMappingURL=conversation-draft.d.ts.map