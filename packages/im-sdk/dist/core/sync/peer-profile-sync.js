import { ConversationRepository, MessageRepository, mapGatewayConversationToCore, } from '@im28/im-sdk/core';
import { createWebIMSyncError, requireWebIMSyncContext, } from './sync-context.js';
import { createWebIMSyncMutationQueue, } from './sync-mutation-queue.js';
/** 好友申请缺省验证消息与 RN 保持一致。 */
const DEFAULT_FRIEND_APPLICATION_MESSAGE = '你好，我想添加你为好友';
/** 创建联系人资料、单聊创建和好友申请 facade。 */
export function createWebIMPeerProfileSync(dependencies) {
    return new WebIMPeerProfileSyncImpl(dependencies);
}
/** 联系人资料 service 编排共享 Gateway 与 Repository。 */
class WebIMPeerProfileSyncImpl {
    // dependencies 动态绑定认证账号、数据库和共享 transport。
    dependencies;
    // mutationQueue 串行化会话持久化和好友申请 mutation。
    mutationQueue;
    /** 保存 runtime owners，不复制 token、transport 或数据库状态。 */
    constructor(dependencies) {
        this.dependencies = dependencies;
        this.mutationQueue =
            dependencies.mutationQueue ?? createWebIMSyncMutationQueue();
    }
    /** 读取用户详情，并在好友关系成立时补充好友备注和星标。 */
    async get(userID) {
        // context 在网络前同时验证认证和账号数据库生命周期。
        const context = requireWebIMSyncContext(this.dependencies, 'Peer profile');
        // normalizedUserID 阻止空路由参数进入 Gateway。
        const normalizedUserID = requirePeerUserID(userID);
        // detail 是用户资料与服务端好友关系的远端真相。
        const detail = await this.dependencies.gatewayClient.getUserDetail({
            user_id: normalizedUserID,
        });
        // relationship 明确区分本人、好友和陌生人。
        const relationship = normalizedUserID === context.userID
            ? 'self'
            : detail.is_friend === true
                ? 'friend'
                : 'stranger';
        // friend 只在服务端确认好友后读取，避免用异常兜底伪造关系。
        const friend = relationship === 'friend'
            ? await this.dependencies.gatewayClient.getFriend({
                friend_user_id: normalizedUserID,
            })
            : undefined;
        return normalizePeerProfile(detail.user, friend, relationship);
    }
    /** 创建真实单聊、映射 core entity 并写入当前账号 SQLite。 */
    async openConversation(userID) {
        // context 在排队前固定本轮账号和数据库 owner。
        const context = requireWebIMSyncContext(this.dependencies, 'Peer conversation');
        // normalizedUserID 是 Gateway direct conversation 的唯一目标。
        const normalizedUserID = requirePeerUserID(userID);
        if (normalizedUserID === context.userID) {
            throw createWebIMSyncError('PEER_PROFILE_SELF_CONVERSATION_UNAVAILABLE', 'A direct conversation cannot target the current user.');
        }
        return this.mutationQueue.enqueue(async () => {
            // remoteConversation 必须来自真实 open operation。
            const remoteConversation = await this.dependencies.gatewayClient.openDirectConversation({
                peer_user_id: normalizedUserID,
            });
            // mapping 复用共享 Gateway-to-core 唯一映射 owner。
            const mapping = mapGatewayConversationToCore(remoteConversation, context.userID);
            if (mapping.latestMessage) {
                // messageRepository 先保存会话引用的 latest message。
                const messageRepository = new MessageRepository(context.database);
                await messageRepository.upsert(mapping.latestMessage);
            }
            // conversationRepository 让聊天页可从同一账号 cache 恢复。
            const conversationRepository = new ConversationRepository(context.database);
            await conversationRepository.upsert(mapping.conversation);
            return mapping.conversation;
        });
    }
    /** 提交真实好友申请，失败时不产生本地成功状态。 */
    async applyFriend(userID, message = '') {
        // context 只用于认证和 self guard，不写入好友关系 cache。
        const context = requireWebIMSyncContext(this.dependencies, 'Friend application');
        // normalizedUserID 防止空目标或本人申请。
        const normalizedUserID = requirePeerUserID(userID);
        if (normalizedUserID === context.userID) {
            throw createWebIMSyncError('PEER_PROFILE_SELF_APPLICATION_UNAVAILABLE', 'A friend application cannot target the current user.');
        }
        // normalizedMessage 对齐 RN trim、缺省文案和 80 字符约束。
        const normalizedMessage = message.trim() || DEFAULT_FRIEND_APPLICATION_MESSAGE;
        if (Array.from(normalizedMessage).length > 80) {
            throw createWebIMSyncError('PEER_PROFILE_APPLICATION_MESSAGE_TOO_LONG', 'Friend application message cannot exceed 80 characters.');
        }
        await this.mutationQueue.enqueue(async () => {
            await this.dependencies.gatewayClient.applyFriend({
                target_id: normalizedUserID,
                message: normalizedMessage,
                source_type: 'user_id',
            });
        });
    }
}
/** 拒绝缺失的联系人路由参数。 */
function requirePeerUserID(userID) {
    // normalizedUserID 统一路由和 SDK caller 的首尾空白。
    const normalizedUserID = userID.trim();
    if (!normalizedUserID) {
        throw createWebIMSyncError('PEER_PROFILE_USER_ID_REQUIRED', 'Peer profile requires a user ID.');
    }
    return normalizedUserID;
}
/** 将 Gateway user/friend 合并为稳定页面模型。 */
function normalizePeerProfile(user, friend, relationship) {
    // userID 是页面路由和后续 action 的稳定主键。
    const userID = user.user_id?.trim() ?? '';
    if (!userID) {
        throw createWebIMSyncError('PEER_PROFILE_USER_MISSING', 'Gateway peer profile is missing a user ID.');
    }
    // remark 优先使用好友 alias，并兼容共享 Gateway remark 字段。
    const remark = friend?.alias?.trim() || friend?.remark?.trim() || '';
    // nickname 保留公开昵称供 RN 二级名称显示。
    const nickname = user.nickname?.trim() ?? '';
    // displayName 按 RN remark、nickname、account、phone、ID 回退。
    const displayName = remark || nickname || user.account?.trim() ||
        user.phone?.trim() || userID;
    return {
        userID,
        displayName,
        nickname,
        remark,
        avatarURL: user.avatar_url?.trim() ?? '',
        gender: user.gender === 1 || user.gender === 2 ? user.gender : 0,
        bio: user.bio?.trim() ?? '',
        relationship,
        isStarred: friend?.is_starred === true,
        addedAt: friend?.created_at?.trim() ?? '',
    };
}
//# sourceMappingURL=peer-profile-sync.js.map