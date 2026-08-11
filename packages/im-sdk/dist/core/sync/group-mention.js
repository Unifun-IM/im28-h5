import { ConversationRepository, GroupMemberRepository, GroupRepository, normalizeMessageMentions, } from '@im28/im-sdk/core';
import { createWebIMGroupMemberSync, } from './group-member-sync.js';
import { sendWebIMMentionMessage, } from './message-mention-send.js';
import { createWebIMSyncMutationQueue, } from './sync-mutation-queue.js';
import { createWebIMSyncError, requireWebIMSyncContext, } from './sync-context.js';
/** 创建 RN、Web、Desktop 共用的群成员与提及 facade。 */
export function createIMGroupMentionSync(dependencies) {
    // mutationQueue 在组合根未提供时仍保证本 facade 内的写操作串行。
    const mutationQueue = dependencies.mutationQueue ?? createWebIMSyncMutationQueue();
    // sharedDependencies 让成员替换和提及发送消费同一队列。
    const sharedDependencies = { ...dependencies, mutationQueue };
    // memberSync 是群成员分页、映射和 success-only replace 的唯一 owner。
    const memberSync = createWebIMGroupMemberSync(sharedDependencies);
    return {
        listMembers: groupID => memberSync.listCached(groupID),
        syncMembers: (groupID, options) => memberSync.sync(groupID, options),
        send: options => mutationQueue.enqueue(() => sendGroupMention(sharedDependencies, options)),
    };
}
/** 校验群身份、成员目标与 all 权限后执行共享 type106 状态机。 */
async function sendGroupMention(dependencies, options) {
    // context 固定当前认证账号和 SQLite owner。
    const context = requireWebIMSyncContext(dependencies, 'Group mention send');
    // groupID 与 conversationID 都必须是调用方提供的稳定身份。
    const groupID = requireIdentity(options.groupID, 'INVALID_GROUP_ID');
    // conversationID 禁止 SDK 猜测 sg_ 前缀。
    const conversationID = requireIdentity(options.conversationID, 'INVALID_MENTION_CONVERSATION');
    // conversation 必须是当前账号缓存中指向该群的真实群会话。
    const conversation = await new ConversationRepository(context.database).getByID(conversationID);
    if (!conversation ||
        conversation.type !== 'group' ||
        conversation.targetID !== groupID) {
        throw createWebIMSyncError('MENTION_GROUP_CONVERSATION_MISMATCH', 'Mention target must be the cached conversation for the selected group.');
    }
    // group 保存服务端权限快照，缺失时拒绝发送而不是猜测。
    const group = await new GroupRepository(context.database).getByID(groupID);
    if (!group) {
        throw createWebIMSyncError('GROUP_NOT_FOUND', 'Mention sending requires an existing cached group.');
    }
    // members 是稳定用户身份和当前账号角色的唯一来源。
    const members = await new GroupMemberRepository(context.database).listByGroupID(groupID);
    // mentions 在权限检查前统一去重并拒绝未知结构。
    const mentions = normalizeMessageMentions(options.mentions);
    if (!mentions.length) {
        throw createWebIMSyncError('INVALID_MENTION_TARGETS', 'Mention sending requires at least one stable target.');
    }
    // memberIDs 用于拒绝已退群、跨群或页面伪造的用户目标。
    const memberIDs = new Set(members.map(member => member.userID));
    for (const mention of mentions) {
        if (mention.type === 'user' && (!mention.userID || !memberIDs.has(mention.userID))) {
            throw createWebIMSyncError('MENTION_MEMBER_NOT_FOUND', 'Mentioned user must exist in the cached group member snapshot.');
        }
    }
    // currentMember 决定服务端未显式返回权限时的角色回退。
    const currentMember = members.find(member => member.userID === context.userID);
    if (mentions.some(mention => mention.type === 'all') &&
        !canMentionAll(group, currentMember?.roleLevel)) {
        throw createWebIMSyncError('MENTION_ALL_FORBIDDEN', 'Current group member is not allowed to mention everyone.');
    }
    // sendOptions 只做中性 contract 到既有共享状态机的字段投影。
    const sendOptions = {
        conversationID,
        text: options.text,
        mentions,
        ...(options.clientMsgID ? { clientMsgID: options.clientMsgID } : {}),
        ...(options.entities?.length ? { entities: options.entities } : {}),
        ...(options.maxAttempts === undefined ? {} : { maxAttempts: options.maxAttempts }),
        ...(options.onSending ? { onSending: options.onSending } : {}),
        ...(options.waitBeforeRetry ? { waitBeforeRetry: options.waitBeforeRetry } : {}),
    };
    return sendWebIMMentionMessage(context, sendOptions, dependencies);
}
/** 解析服务端显式权限，缺失时按 RN 现有 owner/admin 角色回退。 */
function canMentionAll(group, roleLevel) {
    // payload 是 Gateway group 快照，可能同时包含 user_permission 与顶层字段。
    const payload = Object.keys(readRecord(group.payload)).length
        ? readRecord(group.payload)
        : readRecord(group);
    // permission 保存当前账号的细粒度能力。
    const permission = readRecord(payload.user_permission ?? payload.userPermission);
    // explicit 优先级与 RN getGroupPermissions 保持一致。
    const explicit = readBoolean(permission.canMentionAll ??
        permission.can_mention_all ??
        payload.canMentionAll ??
        payload.can_mention_all);
    if (explicit !== undefined)
        return explicit;
    // granted 兼容服务端 permissions 字符串数组。
    const granted = new Set(Array.isArray(permission.permissions)
        ? permission.permissions.map(value => String(value).trim())
        : []);
    if (granted.has('canMentionAll') || granted.has('can_mention_all'))
        return true;
    return roleLevel === 100 || roleLevel === 60;
}
/** 校验必填稳定身份并保留可识别错误码。 */
function requireIdentity(value, code) {
    // normalized 不允许空白身份进入 Repository 或 Gateway。
    const normalized = value.trim();
    if (!normalized)
        throw createWebIMSyncError(code, 'A stable identity is required.');
    return normalized;
}
/** 将未知值收窄为普通记录。 */
function readRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : {};
}
/** 只解析服务端明确布尔值，不把缺失权限误判为 false。 */
function readBoolean(value) {
    if (value === true || value === 1 || value === '1' || value === 'true')
        return true;
    if (value === false || value === 0 || value === '0' || value === 'false')
        return false;
    return undefined;
}
//# sourceMappingURL=group-mention.js.map