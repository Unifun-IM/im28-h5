import { createWebIMCallSync } from '../../../sync/call-sync.js';
import { createWebIMCustomEmojiSync, } from '../../../sync/custom-emoji-sync.js';
import { createWebIMBlacklistSync } from '../../../sync/blacklist-sync.js';
import { createWebIMFriendApplicationSync, } from '../../../sync/friend-application-sync.js';
import { createWebIMGroupApplicationSync, } from '../../../sync/group-application-sync.js';
import { createWebIMJoinedGroupSync, } from '../../../sync/joined-group-sync.js';
import { createIMGroupMentionSync, } from '../../../sync/group-mention.js';
import { createWebIMPeerProfileSync, } from '../../../sync/peer-profile-sync.js';
import { createWebIMConversationSync, } from '../../../sync/conversation-sync.js';
import { canIMGroupMemberClearAllMessages } from '../../../sync/conversation-clear-sync.js';
import { createWebIMMessageSync, } from '../../../sync/message-sync.js';
import { createWebIMRealtimeSync, } from '../../../sync/realtime-sync.js';
import { createWebIMSyncMutationQueue } from '../../../sync/sync-mutation-queue.js';
import { createWebIMContactSync, } from '../../../sync/contact-sync.js';
import { createWebIMProfileSync } from '../../../sync/profile-sync.js';
/** 创建联系人、会话与消息共享认证上下文的同步 facade。 */
export function createWebIMSync(dependencies) {
    // mutationQueue 让所有远端拉取和本地写入按调用顺序完整执行。
    const mutationQueue = createWebIMSyncMutationQueue();
    // sharedDependencies 仅增加队列 owner，不复制 Gateway 或账号状态。
    const sharedDependencies = { ...dependencies, mutationQueue };
    // contacts 是 blacklist 好友关系 enrichment 的唯一现有 owner。
    const contacts = createWebIMContactSync(sharedDependencies);
    // groupMentions 是群成员身份、权限和 type106 发送的唯一业务 owner。
    const groupMentions = createIMGroupMentionSync(sharedDependencies);
    /** canClearAllMembers 从共享成员 cache 读取当前账号角色并应用中性权限规则。 */
    const canClearAllMembers = async (conversation) => {
        /** currentUserID 只来自 runtime 私有认证 owner。 */
        const currentUserID = dependencies.getCurrentUserID()?.trim() ?? '';
        if (!currentUserID || conversation.type !== 'group')
            return false;
        /** members 与群设置、mention 共用同一账号数据库快照。 */
        const members = await groupMentions.listMembers(conversation.targetID);
        /** currentMember 未命中时保持 fail-closed。 */
        const currentMember = members.find(member => member.userID === currentUserID);
        return canIMGroupMemberClearAllMessages(currentMember);
    };
    // messages 保留旧公开入口，但生产组合显式注入同一 neutral facade。
    const messages = createWebIMMessageSync({
        ...sharedDependencies,
        groupMentionSync: groupMentions,
    });
    return {
        blacklist: createWebIMBlacklistSync({
            gatewayClient: dependencies.gatewayClient,
            getCurrentUserID: dependencies.getCurrentUserID,
            listContacts: () => contacts.list(),
        }),
        calls: createWebIMCallSync(sharedDependencies),
        contacts,
        conversations: createWebIMConversationSync({
            ...sharedDependencies,
            canClearAllMembers,
            useGatewayDifference: true,
        }),
        customEmojis: createWebIMCustomEmojiSync(sharedDependencies),
        friendApplications: createWebIMFriendApplicationSync(dependencies),
        groupApplications: createWebIMGroupApplicationSync(dependencies),
        groups: createWebIMJoinedGroupSync(sharedDependencies),
        groupMentions,
        groupMembers: {
            listCached: groupID => groupMentions.listMembers(groupID),
            sync: (groupID, options) => groupMentions.syncMembers(groupID, options),
            updateSelfNickname: (groupID, nickname) => groupMentions.updateSelfNickname(groupID, nickname),
            inviteMembers: options => groupMentions.inviteMembers(options),
            removeMembers: options => groupMentions.removeMembers(options),
        },
        messages,
        peerProfile: createWebIMPeerProfileSync(sharedDependencies),
        profile: createWebIMProfileSync(dependencies),
        realtime: createWebIMRealtimeSync(sharedDependencies),
    };
}
//# sourceMappingURL=web-im-sync.js.map