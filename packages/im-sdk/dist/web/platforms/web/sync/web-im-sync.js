import { createIMCallRecordSync } from '../../../sync/call/index.js';
import { createIMCustomEmojiSync, } from '../../../sync/message/index.js';
import { createIMBlacklistSync, createIMContactSync, createIMDirectChatRelationshipSync, createIMFriendApplicationSync, createIMPeerProfileSync, } from '../../../sync/contact/index.js';
import { createIMGroupApplicationSync, createIMGroupLifecycleSync, createIMGroupManagementSync, createIMGroupMentionSync, createIMJoinedGroupSync, } from '../../../sync/group/index.js';
import { createIMProfileSync, createIMUserPresenceSync, } from '../../../sync/account/index.js';
import { createIMConversationSync, } from '../../../sync/conversation/index.js';
import { canIMGroupMemberClearAllMessages } from '../../../sync/conversation/index.js';
import { createIMMessageSync, } from '../../../sync/message/index.js';
import { createIMMessageBroadcastSync, } from '../../../sync/message/index.js';
import { createIMRealtimeSync, } from '../../../sync/realtime/index.js';
import { createIMSyncMutationQueue } from '../../../sync/sync-mutation-queue.js';
/** 创建联系人、会话与消息共享认证上下文的同步 facade。 */
export function createWebIMSync(dependencies) {
    // mutationQueue 让所有远端拉取和本地写入按调用顺序完整执行。
    const mutationQueue = createIMSyncMutationQueue();
    // sharedDependencies 仅增加队列 owner，不复制 Gateway 或账号状态。
    const sharedDependencies = { ...dependencies, mutationQueue };
    // contacts 是 blacklist 好友关系 enrichment 的唯一现有 owner。
    const contacts = createIMContactSync(sharedDependencies);
    /** blacklist 是列表页和单聊关系共用的唯一黑名单 owner。 */
    const blacklist = createIMBlacklistSync({
        gatewayClient: dependencies.gatewayClient,
        getCurrentUserID: dependencies.getCurrentUserID,
        listContacts: () => contacts.list(),
    });
    /** peerProfile 是资料页和单聊好友关系共用的唯一资料 owner。 */
    const peerProfile = createIMPeerProfileSync(sharedDependencies);
    /** directChatRelationship 只投影已有 owner，不新增 transport 或 cache。 */
    const directChatRelationship = createIMDirectChatRelationshipSync({
        getPeerRelationship: async (userID) => (await peerProfile.get(userID)).relationship,
        isBlockedByMe: userID => blacklist.has(userID),
    });
    // groupMentions 是群成员身份、权限和 type106 发送的唯一业务 owner。
    const groupMentions = createIMGroupMentionSync(sharedDependencies);
    /** groups 是已加入群 cache/sync 的唯一 owner，也为群搜索提供关系快照。 */
    const groups = createIMJoinedGroupSync(sharedDependencies);
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
    const messages = createIMMessageSync({
        ...sharedDependencies,
        groupMentionSync: groupMentions,
    });
    return {
        blacklist,
        directChatRelationship,
        calls: createIMCallRecordSync(sharedDependencies),
        contacts,
        conversations: createIMConversationSync({
            ...sharedDependencies,
            canClearAllMembers,
            useGatewayDifference: true,
        }),
        customEmojis: createIMCustomEmojiSync(sharedDependencies),
        friendApplications: createIMFriendApplicationSync(dependencies),
        groupApplications: createIMGroupApplicationSync({
            ...dependencies,
            listJoinedGroups: () => groups.sync(),
        }),
        groups,
        groupMentions,
        groupManagement: createIMGroupManagementSync(sharedDependencies),
        groupLifecycle: createIMGroupLifecycleSync(sharedDependencies),
        groupMembers: {
            listCached: groupID => groupMentions.listMembers(groupID),
            sync: (groupID, options) => groupMentions.syncMembers(groupID, options),
            updateSelfNickname: (groupID, nickname) => groupMentions.updateSelfNickname(groupID, nickname),
            inviteMembers: options => groupMentions.inviteMembers(options),
            removeMembers: options => groupMentions.removeMembers(options),
            setAdmins: options => groupMentions.setAdmins(options),
            cancelAdmins: options => groupMentions.cancelAdmins(options),
            transferOwner: options => groupMentions.transferOwner(options),
        },
        messages,
        messageBroadcast: createIMMessageBroadcastSync(sharedDependencies),
        peerProfile,
        presence: createIMUserPresenceSync({
            gatewayClient: dependencies.gatewayClient,
            getCurrentUserID: dependencies.getCurrentUserID,
            ...(dependencies.reportBackgroundError
                ? { reportListenerError: dependencies.reportBackgroundError }
                : {}),
        }),
        profile: createIMProfileSync(dependencies),
        realtime: createIMRealtimeSync(sharedDependencies),
    };
}
//# sourceMappingURL=web-im-sync.js.map