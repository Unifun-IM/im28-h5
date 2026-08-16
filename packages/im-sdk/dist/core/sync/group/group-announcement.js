import { GroupRepository, IMError, } from '@im28/im-sdk/core';
import { createWebIMSyncError } from '../sync-context.js';
/** 群公告正文沿用 RN 既有 1000 字上限。 */
export const IM_GROUP_ANNOUNCEMENT_MAX_LENGTH = 1000;
/** 发布公告时先持久化 Gateway 公告，再发送 RN 约定的公告文本消息。 */
export async function publishIMGroupAnnouncement(context, options, gatewayClient, messagePort) {
    // normalized 冻结两个远端动作共同使用的目标和正文。
    const normalized = normalizeGroupAnnouncementOptions(options);
    // group 只在 Gateway 精确成功后写入当前账号 groups cache。
    const group = await updateIMGroupAnnouncement(context, normalized.groupID, normalized.announcement, gatewayClient);
    // onGroupUpdated 让平台在消息发送前保留既有资料事件投影顺序。
    await messagePort.onGroupUpdated?.(group);
    try {
        // message 使用各端既有消息状态机，避免公告逻辑复制发送实现。
        const message = await messagePort.sendText({
            conversationID: normalized.conversationID,
            text: buildIMGroupAnnouncementMessageText(normalized.announcement),
        });
        return { group, message };
    }
    catch (cause) {
        // 公告已更新时不得伪装整体回滚，错误明确暴露部分成功。
        throw new IMError({
            code: 'GROUP_ANNOUNCEMENT_MESSAGE_FAILED',
            message: 'Group announcement was updated, but its chat message failed to send.',
            source: 'sync',
            retryable: true,
            cause,
        });
    }
}
/** 查询当前公告版本并按服务端布尔值更新本地已读快照。 */
export async function getIMGroupAnnouncementReadStatus(context, groupID, gatewayClient) {
    // existing 证明目标群属于当前账号缓存。
    const existing = await requireCachedGroup(context, groupID, 'read status');
    // result 是无副作用的权威版本状态。
    const result = await gatewayClient.getGroupAnnouncementReadStatus({
        group_id: existing.groupID,
    });
    if (typeof result.is_read !== 'boolean') {
        throw createWebIMSyncError('GROUP_ANNOUNCEMENT_READ_STATUS_INVALID', 'Gateway group announcement read status is incomplete.');
    }
    // status 保留 uint64 字符串；空公告允许空版本。
    const status = {
        announcementVersion: result.announcement_version?.trim() ?? '',
        announcementReadVersion: result.announcement_read_version?.trim() ?? '',
        isRead: result.is_read,
    };
    await persistGroupAnnouncementReadStatus(context, existing, status);
    return status;
}
/** 标记用户实际看到的版本后再查询权威状态，避免旧版本清除新公告未读。 */
export async function markIMGroupAnnouncementRead(context, groupID, announcementVersion, gatewayClient) {
    // existing 校验当前账号拥有目标群缓存。
    const existing = await requireCachedGroup(context, groupID, 'read mark');
    // version 只能来自页面真实展示的非空公告版本。
    const version = announcementVersion.trim();
    if (!version) {
        throw createWebIMSyncError('INVALID_GROUP_ANNOUNCEMENT_VERSION', 'Group announcement read mark requires the displayed version.');
    }
    await gatewayClient.markGroupAnnouncementRead({
        group_id: existing.groupID,
        announcement_version: version,
    });
    // Gateway mark 仅返回统一成功 envelope，必须复查当前版本状态。
    return getIMGroupAnnouncementReadStatus(context, existing.groupID, gatewayClient);
}
/** 更新公告内容、版本和发布者已读快照并保留其他群字段。 */
async function updateIMGroupAnnouncement(context, groupID, announcement, gatewayClient) {
    // existing 同时承担缓存存在和公告专属权限预检。
    const existing = await requireIMGroupAnnouncementUpdateAccess(context, groupID);
    // remote 只提交公告字段，禁止覆盖名称、头像或简介。
    const remote = await gatewayClient.updateGroup({
        group_id: existing.groupID,
        announcement,
    });
    // version 是公告已读和 realtime 收敛所需的稳定身份。
    const version = remote.announcement_version?.trim() ?? '';
    if (remote.group_id?.trim() !== existing.groupID ||
        remote.announcement?.trim() !== announcement ||
        !version) {
        throw createWebIMSyncError('GROUP_ANNOUNCEMENT_RESPONSE_MISMATCH', 'Gateway group announcement update returned mismatched data.');
    }
    // payload 只覆盖服务端确认的公告字段并标记发布者已读当前版本。
    const payload = {
        ...readGroupPayload(existing),
        ...remote,
        group_id: existing.groupID,
        announcement,
        announcement_version: version,
        user_permission: {
            ...readUserPermission(existing),
            announcement_read_version: version,
            announcement_unread: false,
        },
    };
    // next 保留列表序号、角色和未返回的群资料。
    const next = {
        ...existing,
        ...(remote.title?.trim() ? { name: remote.title.trim() } : {}),
        ...(remote.avatar_url?.trim() ? { faceURL: remote.avatar_url.trim() } : {}),
        ...(typeof remote.member_count === 'number'
            ? { memberCount: Math.max(0, Math.trunc(remote.member_count)) }
            : {}),
        payload,
    };
    await new GroupRepository(context.database).upsert(next);
    return next;
}
/** 公告更新权限优先使用显式 capability，旧快照仅群主可编辑。 */
export async function requireIMGroupAnnouncementUpdateAccess(context, groupID) {
    // existing 在远端调用前冻结当前账号群快照。
    const existing = await requireCachedGroup(context, groupID, 'update');
    if (!canUpdateIMGroupAnnouncement(readGroupPayload(existing))) {
        throw createWebIMSyncError('GROUP_ANNOUNCEMENT_PERMISSION_DENIED', 'Only an authorized group owner or administrator can update announcements.');
    }
    return existing;
}
/** 判断当前账号是否具备公告编辑权限。 */
export function canUpdateIMGroupAnnouncement(payload) {
    // permission 保留 Gateway 的显式管理员能力授权。
    const permission = isRecord(payload.user_permission) ? payload.user_permission : {};
    if (typeof permission.can_edit_announcement === 'boolean') {
        return permission.can_edit_announcement;
    }
    // role 对齐 RN 旧快照的 owner-only 回退。
    const member = isRecord(payload.member) ? payload.member : {};
    const role = member.role ?? permission.role_level ?? permission.role;
    return role === 100 || String(role ?? '').trim().toLowerCase() === 'owner';
}
/** 构造 RN 既有群公告文本消息正文。 */
export function buildIMGroupAnnouncementMessageText(announcement) {
    return `群公告\n${announcement.trim()}`;
}
/** 统一公告发布输入并在任何远端 I/O 前失败。 */
function normalizeGroupAnnouncementOptions(options) {
    // groupID 和 conversationID 分别绑定群资料与消息目标。
    const groupID = options.groupID.trim();
    const conversationID = options.conversationID.trim();
    // announcement 沿用 RN trim、非空和 1000 字约束。
    const announcement = options.announcement.trim();
    if (!groupID || !conversationID) {
        throw createWebIMSyncError('INVALID_GROUP_ANNOUNCEMENT_TARGET', 'Group announcement publication requires group and conversation IDs.');
    }
    if (!announcement) {
        throw createWebIMSyncError('INVALID_GROUP_ANNOUNCEMENT', 'Group announcement cannot be empty.');
    }
    if (announcement.length > IM_GROUP_ANNOUNCEMENT_MAX_LENGTH) {
        throw createWebIMSyncError('GROUP_ANNOUNCEMENT_TOO_LONG', `Group announcement cannot exceed ${IM_GROUP_ANNOUNCEMENT_MAX_LENGTH} characters.`);
    }
    return { groupID, conversationID, announcement };
}
/** 读取当前账号缓存群并拒绝空目标或错账号目标。 */
async function requireCachedGroup(context, groupID, operation) {
    // normalizedGroupID 禁止空 ID 进入 Repository 或 Gateway。
    const normalizedGroupID = groupID.trim();
    if (!normalizedGroupID) {
        throw createWebIMSyncError('INVALID_GROUP_ID', `Group announcement ${operation} requires a group ID.`);
    }
    // existing 是失败时保持不变的当前账号权威缓存。
    const existing = await new GroupRepository(context.database).getByID(normalizedGroupID);
    if (!existing) {
        throw createWebIMSyncError('GROUP_NOT_CACHED', `Group announcement ${operation} requires a cached group.`);
    }
    return existing;
}
/** 将服务端权威版本状态合并进当前群 payload。 */
async function persistGroupAnnouncementReadStatus(context, existing, status) {
    // payload 保留群资料和其他当前账号权限字段。
    const payload = {
        ...readGroupPayload(existing),
        announcement_version: status.announcementVersion,
        user_permission: {
            ...readUserPermission(existing),
            announcement_read_version: status.announcementReadVersion,
            announcement_unread: !status.isRead,
        },
    };
    await new GroupRepository(context.database).upsert({ ...existing, payload });
}
/** 从缓存群提取原始 Gateway payload。 */
function readGroupPayload(group) {
    return isRecord(group.payload) ? group.payload : group;
}
/** 从缓存群提取当前账号群权限快照。 */
function readUserPermission(group) {
    // payload 是 groups raw_json 的唯一业务来源。
    const payload = readGroupPayload(group);
    return isRecord(payload.user_permission) ? payload.user_permission : {};
}
/** 判断未知值是否为可读取记录。 */
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
//# sourceMappingURL=group-announcement.js.map