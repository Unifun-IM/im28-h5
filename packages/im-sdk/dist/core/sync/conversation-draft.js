import { ConversationRepository, normalizePresetEmojiEntities, trimPresetEmojiDocument, } from '@im28/im-sdk/core';
import { requireWebIMSyncContext, } from './sync-context.js';
import { normalizeWebIMConversationID, requireCachedWebIMConversation, } from './conversation-sync-target.js';
import { createWebIMSyncMutationQueue, } from './sync-mutation-queue.js';
/** 创建 RN、Web 与 Desktop 可复用的本地会话草稿 facade。 */
export function createIMConversationDraftSync(dependencies) {
    /** mutationQueue 与消息发送、会话设置共用顺序，避免草稿和列表快照竞态。 */
    const mutationQueue = dependencies.mutationQueue ?? createWebIMSyncMutationQueue();
    return {
        /** 只读取当前账号已存在的规范会话。 */
        async getDraft(conversationID) {
            /** targetID 拒绝空白或页面拼装的无效身份。 */
            const targetID = normalizeWebIMConversationID(conversationID);
            /** context 固定本轮认证账号与数据库。 */
            const context = requireWebIMSyncContext(dependencies, 'Conversation draft');
            /** repository 禁止跨账号读取草稿。 */
            const repository = new ConversationRepository(context.database);
            /** conversation 必须来自当前账号 SQLite。 */
            const conversation = await requireCachedWebIMConversation(repository, targetID);
            return readIMConversationDraftDocument(conversation);
        },
        /** 保存动作在共享队列内原子更新 draft 索引和 raw payload。 */
        saveDraft: (conversationID, document) => mutationQueue.enqueue(async () => {
            /** targetID 先执行统一会话身份校验。 */
            const targetID = normalizeWebIMConversationID(conversationID);
            /** context 固定写入期间的账号数据库。 */
            const context = requireWebIMSyncContext(dependencies, 'Conversation draft');
            /** repository 是会话索引与 payload 的唯一 SQLite owner。 */
            const repository = new ConversationRepository(context.database);
            /** existing 防止给未缓存或跨账号会话创建孤立草稿。 */
            const existing = await requireCachedWebIMConversation(repository, targetID);
            /** normalizedDocument 同步裁剪正文并重算 UTF-16 entity 偏移。 */
            const normalizedDocument = trimPresetEmojiDocument(document);
            /** existingPayload 只扩展 App 草稿字段，不覆盖其他能力保存的 payload。 */
            const existingPayload = readConversationPayload(existing);
            /** next 是完整会话快照，保留排序、未读和设置字段。 */
            const next = {
                ...existing,
                draft: normalizedDocument.text,
                payload: {
                    ...existingPayload,
                    draftPresetEmojiEntities: [...normalizedDocument.entities],
                },
            };
            await repository.upsert(next);
            return next;
        }),
    };
}
/** 从会话 draft 索引和扩展 payload 恢复合法草稿文档。 */
export function readIMConversationDraftDocument(conversation) {
    /** text 保留 SQLite 中已规范化的草稿正文。 */
    const text = conversation.draft ?? '';
    /** payload 仅接受普通对象，拒绝数组和未知值。 */
    const payload = readConversationPayload(conversation);
    return {
        text,
        entities: normalizePresetEmojiEntities(payload.draftPresetEmojiEntities, text),
    };
}
/** 将未知会话 payload 收窄为可安全扩展的普通对象。 */
function readConversationPayload(conversation) {
    /** payload 是兼容历史扩展字段的唯一输入。 */
    const payload = conversation.payload;
    return payload && typeof payload === 'object' && !Array.isArray(payload)
        ? payload
        : {};
}
//# sourceMappingURL=conversation-draft.js.map