/** 导出跨端共用的会话同步与列表读取能力。 */
export { createIMConversationSync, createWebIMConversationSync, listWebIMCachedConversationItems, } from './conversation-sync.js';
/** 导出账号内会话草稿持久化能力。 */
export { createIMConversationDraftSync, readIMConversationDraftDocument, } from './conversation-draft.js';
/** 导出会话列表非设置动作。 */
export { createIMConversationListActionsSync } from './conversation-list-actions.js';
/** 导出归档会话全分页与快照收敛能力。 */
export { createIMConversationArchiveSync } from './conversation-archive-sync.js';
/** 导出会话历史清空能力与权限判断。 */
export { canIMGroupMemberClearAllMessages, createIMConversationClearSync, isIMConversationClearRealtime, } from './conversation-clear-sync.js';
/** 导出跨端共用的中性会话设置 facade。 */
export { createIMConversationSettingsSync } from './conversation-settings.js';
/** 导出新 Gateway Difference 原子同步 owner。 */
export { syncIMGatewayDifference } from './gateway-difference-sync.js';
/** 导出单聊对端稳定身份解析能力。 */
export { resolveDirectConversationPeerUserID } from './direct-conversation-peer.js';
//# sourceMappingURL=index.js.map