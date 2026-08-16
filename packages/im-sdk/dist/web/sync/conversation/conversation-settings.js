import { createWebIMConversationAutoDeleteSync, } from './conversation-auto-delete-sync.js';
import { createWebIMConversationSettingSync, } from './conversation-setting-sync.js';
import { createWebIMSyncMutationQueue, } from '../sync-mutation-queue.js';
/** 创建 RN/Web/Desktop 共用的会话设置业务 facade。 */
export function createIMConversationSettingsSync(dependencies) {
    /** mutationQueue 保证设置和自动删除写入使用同一串行 owner。 */
    const mutationQueue = dependencies.mutationQueue ?? createWebIMSyncMutationQueue();
    /** sharedDependencies 注入同一账号、Gateway 与 mutation queue。 */
    const sharedDependencies = { ...dependencies, mutationQueue };
    /** settingSync 复用既有严格 Gateway/Repository 收敛实现。 */
    const settingSync = createWebIMConversationSettingSync(sharedDependencies);
    /** autoDeleteSync 复用既有枚举、详情和 realtime 元数据规则。 */
    const autoDeleteSync = createWebIMConversationAutoDeleteSync(sharedDependencies);
    return {
        /** 委托平台无关的设置读取。 */
        getSetting: conversationID => settingSync.getSetting(conversationID),
        /** 委托平台无关的免打扰 mutation。 */
        setMuted: (conversationID, isMuted) => settingSync.setMuted(conversationID, isMuted),
        /** 委托平台无关的置顶 mutation。 */
        setPinned: (conversationID, isPinned) => settingSync.setPinned(conversationID, isPinned),
        /** 委托平台无关的自动删除读取。 */
        getAutoDelete: conversationID => autoDeleteSync.getAutoDelete(conversationID),
        /** 委托平台无关的自动删除 mutation。 */
        setAutoDelete: (conversationID, autoDeleteSeconds) => autoDeleteSync.setAutoDelete(conversationID, autoDeleteSeconds),
    };
}
//# sourceMappingURL=conversation-settings.js.map