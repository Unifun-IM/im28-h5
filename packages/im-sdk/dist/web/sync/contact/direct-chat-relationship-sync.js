import { resolveIMDirectChatRelationshipPresentation, } from '@im28/im-sdk/core';
import { createWebIMSyncError } from '../sync-context.js';
/** 创建不直接访问 Gateway 或数据库的单聊关系组合 facade。 */
export function createIMDirectChatRelationshipSync(dependencies) {
    return {
        /** 并行读取两项权威事实，并按共享优先级返回页面投影。 */
        async get(userID) {
            /** normalizedUserID 阻止空会话目标进入下游读取。 */
            const normalizedUserID = userID.trim();
            if (!normalizedUserID) {
                throw createWebIMSyncError('DIRECT_CHAT_RELATIONSHIP_USER_ID_REQUIRED', 'Direct chat relationship requires a peer user ID.');
            }
            /** relationship 与 blockedByMe 分别保留资料和黑名单 owner。 */
            const [relationship, blockedByMe] = await Promise.all([
                dependencies.getPeerRelationship(normalizedUserID),
                dependencies.isBlockedByMe(normalizedUserID),
            ]);
            return resolveIMDirectChatRelationshipPresentation({ relationship, blockedByMe });
        },
    };
}
//# sourceMappingURL=direct-chat-relationship-sync.js.map