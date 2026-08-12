import { GroupMemberRepository, } from '@im28/im-sdk/core';
import { createWebIMSyncError, requireWebIMSyncContext, } from './sync-context.js';
/** 更新当前认证账号群昵称，并在远端成功后返回已写回成员记录。 */
export async function updateSelfGroupNicknameRecord(dependencies, groupID, nickname) {
    /** context 固定当前账号身份，调用方不能指定其他成员。 */
    const context = requireWebIMSyncContext(dependencies, 'Group member nickname update');
    /** normalizedNickname 对齐 RN 非空和 24 字规则。 */
    const normalizedNickname = requireGroupNickname(nickname);
    /** repository 证明当前账号仍在目标群的已同步成员集合中。 */
    const repository = new GroupMemberRepository(context.database);
    /** existing 保留角色、头像和兼容 payload。 */
    const existing = await repository.getByGroupAndUserID(groupID, context.userID);
    if (!existing) {
        throw createWebIMSyncError('CURRENT_GROUP_MEMBER_NOT_FOUND', 'Group member nickname update requires the current cached member.');
    }
    /** remote 只在服务端确认成功后用于增强缓存 payload。 */
    const remote = await dependencies.gatewayClient.updateGroupMemberNickname({
        group_id: groupID,
        nickname: normalizedNickname,
    });
    /** remoteUserID 允许服务端省略当前身份，但拒绝其他成员。 */
    const remoteUserID = remote.user_id?.trim() ?? '';
    if (remoteUserID && remoteUserID !== context.userID) {
        throw createWebIMSyncError('GROUP_MEMBER_NICKNAME_IDENTITY_MISMATCH', 'Gateway returned a different group member identity.');
    }
    /** remoteRecord 兼容尚未进入正式 OpenAPI 类型的昵称和头像。 */
    const remoteRecord = remote;
    /** next 以请求值兜底旧 Gateway 省略 nickname 的成功响应。 */
    const next = {
        ...existing,
        groupID,
        userID: context.userID,
        nickname: remoteRecord.nickname?.trim() || normalizedNickname,
        ...(remoteRecord.face_url?.trim() ? { faceURL: remoteRecord.face_url.trim() } : {}),
        payload: {
            ...readMemberPayload(existing),
            ...remote,
            group_id: groupID,
            user_id: context.userID,
            nickname: remoteRecord.nickname?.trim() || normalizedNickname,
        },
    };
    await repository.upsert(next);
    return next;
}
/** 校验并规范当前账号群昵称。 */
function requireGroupNickname(value) {
    /** nickname 禁止空白值进入 Gateway。 */
    const nickname = value.trim();
    if (!nickname) {
        throw createWebIMSyncError('INVALID_GROUP_MEMBER_NICKNAME', 'Group member nickname cannot be empty.');
    }
    if (nickname.length > 24) {
        throw createWebIMSyncError('GROUP_MEMBER_NICKNAME_TOO_LONG', 'Group member nickname cannot exceed 24 characters.');
    }
    return nickname;
}
/** 将历史成员记录收窄为可安全合并的普通对象。 */
function readMemberPayload(value) {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : {};
}
//# sourceMappingURL=group-member-nickname.js.map