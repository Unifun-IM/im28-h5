/** 导出跨端共用的会话同步与列表读取能力。 */
export { createIMConversationSync, createWebIMConversationSync, listWebIMCachedConversationItems, } from './conversation-sync.js';
/** 导出会话同步的中性与兼容契约。 */
export type { IMConversationSync, IMConversationSyncDependencies, WebIMConversationListItem, WebIMConversationSync, WebIMConversationSyncDependencies, WebIMConversationSyncOptions, } from './conversation-sync.js';
/** 导出账号内会话草稿持久化能力。 */
export { createIMConversationDraftSync, readIMConversationDraftDocument, } from './conversation-draft.js';
/** 导出会话草稿持久化契约。 */
export type { IMConversationDraftSync, IMConversationDraftSyncDependencies, } from './conversation-draft.js';
/** 导出会话列表非设置动作。 */
export { createIMConversationListActionsSync } from './conversation-list-actions.js';
/** 导出会话列表动作契约。 */
export type { IMConversationListActionsSync, IMConversationListActionsSyncDependencies, } from './conversation-list-actions.js';
/** 导出归档会话全分页与快照收敛能力。 */
export { createIMConversationArchiveSync } from './conversation-archive-sync.js';
/** 导出归档会话同步契约。 */
export type { IMConversationArchiveSync, IMConversationArchiveSyncDependencies, IMConversationArchiveSyncOptions, } from './conversation-archive-sync.js';
/** 导出会话历史清空能力与权限判断。 */
export { canIMGroupMemberClearAllMessages, createIMConversationClearSync, isIMConversationClearRealtime, } from './conversation-clear-sync.js';
/** 导出会话历史清空契约。 */
export type { IMConversationClearMemberPermission, IMConversationClearOptions, IMConversationClearScope, IMConversationClearSync, IMConversationClearSyncDependencies, } from './conversation-clear-sync.js';
/** 导出会话自动删除设置契约。 */
export type { IMConversationAutoDeleteSetting, WebIMConversationAutoDeleteSetting, WebIMConversationAutoDeleteSync, WebIMConversationAutoDeleteSyncDependencies, } from './conversation-auto-delete-sync.js';
/** 导出会话基础设置契约。 */
export type { IMConversationSetting, WebIMConversationSetting, WebIMConversationSettingSync, WebIMConversationSettingSyncDependencies, } from './conversation-setting-sync.js';
/** 导出跨端共用的中性会话设置 facade。 */
export { createIMConversationSettingsSync } from './conversation-settings.js';
/** 导出中性会话设置契约。 */
export type { IMConversationSettingsSync, IMConversationSettingsSyncDependencies, } from './conversation-settings.js';
/** 导出会话列表未读 mention 快照契约。 */
export type { WebIMUnreadMentionSnapshot } from './conversation-unread-mention.js';
/** 导出新 Gateway Difference 原子同步 owner。 */
export { syncIMGatewayDifference } from './gateway-difference-sync.js';
/** 导出 Gateway Difference 同步结果契约。 */
export type { IMGatewayDifferenceSyncResult } from './gateway-difference-sync.js';
/** 导出单聊对端稳定身份解析能力。 */
export { resolveDirectConversationPeerUserID } from './direct-conversation-peer.js';
/** 导出单聊对端稳定身份解析输入。 */
export type { ResolveDirectConversationPeerUserIDInput } from './direct-conversation-peer.js';
//# sourceMappingURL=index.d.ts.map