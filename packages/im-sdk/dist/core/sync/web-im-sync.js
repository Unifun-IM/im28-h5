import { createWebIMCallSync } from './call-sync.js';
import { createWebIMBlacklistSync } from './blacklist-sync.js';
import { createWebIMFriendApplicationSync, } from './friend-application-sync.js';
import { createWebIMGroupApplicationSync, } from './group-application-sync.js';
import { createWebIMJoinedGroupSync, } from './joined-group-sync.js';
import { createWebIMPeerProfileSync, } from './peer-profile-sync.js';
import { createWebIMConversationSync, } from './conversation-sync.js';
import { createWebIMMessageSync, } from './message-sync.js';
import { createWebIMRealtimeSync, } from './realtime-sync.js';
import { createWebIMSyncMutationQueue } from './sync-mutation-queue.js';
import { createWebIMContactSync, } from './contact-sync.js';
import { createWebIMProfileSync } from './profile-sync.js';
/** 创建联系人、会话与消息共享认证上下文的同步 facade。 */
export function createWebIMSync(dependencies) {
    // mutationQueue 让所有远端拉取和本地写入按调用顺序完整执行。
    const mutationQueue = createWebIMSyncMutationQueue();
    // sharedDependencies 仅增加队列 owner，不复制 Gateway 或账号状态。
    const sharedDependencies = { ...dependencies, mutationQueue };
    // contacts 是 blacklist 好友关系 enrichment 的唯一现有 owner。
    const contacts = createWebIMContactSync(dependencies);
    return {
        blacklist: createWebIMBlacklistSync({
            gatewayClient: dependencies.gatewayClient,
            getCurrentUserID: dependencies.getCurrentUserID,
            listContacts: () => contacts.list(),
        }),
        calls: createWebIMCallSync(sharedDependencies),
        contacts,
        conversations: createWebIMConversationSync(sharedDependencies),
        friendApplications: createWebIMFriendApplicationSync(dependencies),
        groupApplications: createWebIMGroupApplicationSync(dependencies),
        groups: createWebIMJoinedGroupSync(sharedDependencies),
        messages: createWebIMMessageSync(sharedDependencies),
        peerProfile: createWebIMPeerProfileSync(sharedDependencies),
        profile: createWebIMProfileSync(dependencies),
        realtime: createWebIMRealtimeSync(sharedDependencies),
    };
}
//# sourceMappingURL=web-im-sync.js.map