import { GroupRepository, } from '@im28/im-sdk/core';
import { mapGatewayGroupToCore } from './joined-group-mappers.js';
import { createWebIMSyncError, requireWebIMSyncContext, } from '../sync-context.js';
/** RN 当前普通群至少需要选择的好友数。 */
export const IM_GROUP_CREATION_MIN_MEMBER_COUNT = 2;
/** RN 当前普通群除创建者外允许选择的好友上限。 */
export const IM_GROUP_CREATION_MAX_MEMBER_COUNT = 998;
/** 判断好友选择数量是否满足 RN 普通群创建范围。 */
export function canCreateIMGroupWithMemberCount(memberCount) {
    return Number.isInteger(memberCount) &&
        memberCount >= IM_GROUP_CREATION_MIN_MEMBER_COUNT &&
        memberCount <= IM_GROUP_CREATION_MAX_MEMBER_COUNT;
}
/** 创建绑定当前认证账号的群创建状态机。 */
export function createIMGroupCreationSync(dependencies) {
    /** operationQueue 与会话、消息和群快照写入保持同一顺序。 */
    const operationQueue = dependencies.mutationQueue;
    return {
        create: options => {
            /** operation 在真正执行时重新读取当前账号，避免切号后写错库。 */
            const operation = () => createGroupDirect(dependencies, options);
            return operationQueue ? operationQueue.enqueue(operation) : operation();
        },
    };
}
/** 完成一次且仅一次远端创建，并尝试原子写入群与会话。 */
async function createGroupDirect(dependencies, options) {
    /** context 冻结远端请求和本地事务共同使用的账号。 */
    const context = requireWebIMSyncContext(dependencies, 'Group creation');
    /** memberUserIDs 在网络前完成 trim、去重和本人拒绝。 */
    const memberUserIDs = normalizeGroupCreationMemberIDs(options.memberUserIDs, context.userID);
    /** groupName 复用 RN“创建者昵称的群聊”默认语义。 */
    const groupName = normalizeGroupCreationName(options);
    /** remote 是本次操作唯一 createGroup Gateway 调用。 */
    const remote = await dependencies.gatewayClient.createGroup({
        title: groupName,
        member_user_ids: memberUserIDs,
    });
    /** groupID 必须来自服务端，不允许客户端生成。 */
    const groupID = remote.group_id?.trim() ?? '';
    /** conversationID 必须来自服务端，不允许按群 ID 拼接。 */
    const conversationID = remote.conversation_id?.trim() ?? '';
    if (!groupID || !conversationID) {
        throw createWebIMSyncError('GROUP_CREATE_REMOTE_IDENTITY_INCOMPLETE', 'Gateway group creation must return stable group and conversation IDs.');
    }
    /** completedRemote 补齐创建响应可能省略但本次请求已确认的字段。 */
    const completedRemote = {
        ...remote,
        group_id: groupID,
        conversation_id: conversationID,
        title: remote.title?.trim() || groupName,
        owner_user_id: remote.owner_user_id?.trim() || context.userID,
        member_count: remote.member_count ?? memberUserIDs.length + 1,
        member: remote.member ?? {
            group_id: groupID,
            user_id: context.userID,
            role: 100,
            state: 'active',
        },
        user_permission: remote.user_permission ?? {
            role: 100,
            role_level: 100,
            state: 'active',
        },
    };
    /** group 复用加入群列表的唯一 Gateway 映射规则。 */
    const group = mapGatewayGroupToCore(completedRemote, 0);
    if (!group) {
        throw createWebIMSyncError('GROUP_CREATE_RESPONSE_INVALID', 'Gateway group creation returned an invalid group.');
    }
    /** now 统一群会话首次排序时间并允许确定性测试。 */
    const now = dependencies.now?.() ?? Date.now();
    /** conversation 只使用服务端确认身份和群资料构造本地初始记录。 */
    const conversation = {
        conversationID,
        type: 'group',
        targetID: groupID,
        name: group.name,
        ...(group.faceURL ? { faceURL: group.faceURL } : {}),
        unreadCount: 0,
        updatedAt: now,
        payload: {
            conversation_id: conversationID,
            type: 'group',
            group_id: groupID,
            group: completedRemote,
        },
    };
    try {
        await new GroupRepository(context.database).applyCreation(group, conversation);
        return { group, conversation, cacheState: 'local' };
    }
    catch {
        // Gateway 已成功时禁止重试远端创建；caller 必须锁定重复提交并刷新本地快照。
        return { group, conversation, cacheState: 'remote-only' };
    }
}
/** 规范化创建成员身份并拒绝空值、本人和超出 RN 数量范围。 */
function normalizeGroupCreationMemberIDs(values, currentUserID) {
    /** memberUserIDs 保留 caller 首见顺序并消除重复身份。 */
    const memberUserIDs = [...new Set(values.map(value => value.trim()).filter(Boolean))];
    if (memberUserIDs.includes(currentUserID)) {
        throw createWebIMSyncError('GROUP_CREATE_SELF_FORBIDDEN', 'Current user must not be included in group creation member IDs.');
    }
    if (!canCreateIMGroupWithMemberCount(memberUserIDs.length)) {
        throw createWebIMSyncError('GROUP_CREATE_MEMBER_COUNT_INVALID', `Group creation requires ${IM_GROUP_CREATION_MIN_MEMBER_COUNT} to ${IM_GROUP_CREATION_MAX_MEMBER_COUNT} selected friends.`);
    }
    return memberUserIDs;
}
/** 复用 RN 默认群名并限制异常空白输入。 */
function normalizeGroupCreationName(options) {
    /** explicitName 优先使用 caller 明确提供的群名。 */
    const explicitName = options.groupName?.trim() ?? '';
    if (explicitName)
        return Array.from(explicitName).slice(0, 100).join('');
    /** ownerDisplayName 仅用于默认展示文案，不作为身份凭据。 */
    const ownerDisplayName = options.ownerDisplayName?.trim() ?? '';
    return ownerDisplayName ? `${ownerDisplayName}的群聊` : '群聊';
}
//# sourceMappingURL=group-creation.js.map