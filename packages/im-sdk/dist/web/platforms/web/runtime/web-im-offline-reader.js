import { listWebIMCachedConversationItems, } from '../../../sync/conversation-sync.js';
import { getWebIMCachedMessageHistory } from '../../../sync/message-sync.js';
/** 创建没有写入、远端同步或 realtime 表面的离线 reader。 */
export function createWebIMOfflineReader(dependencies) {
    return {
        conversations: {
            listCachedItems: async (options) => listWebIMCachedConversationItems(requireOfflineReadContext(dependencies), options),
        },
        messages: {
            getCachedHistory: async (options) => getWebIMCachedMessageHistory(requireOfflineReadContext(dependencies).database, options),
        },
    };
}
/** 拒绝 runtime 已退出离线状态后的旧 reader 引用。 */
function requireOfflineReadContext(dependencies) {
    // context 由 runtime 同时校验 lifecycle state、userID 与当前只读数据库。
    const context = dependencies.getContext();
    if (!context || !context.userID.trim()) {
        throw new Error('Web IM offline reader is unavailable.');
    }
    return context;
}
//# sourceMappingURL=web-im-offline-reader.js.map