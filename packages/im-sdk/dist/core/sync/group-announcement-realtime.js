import { GroupRepository } from '@im28/im-sdk/core';
/** 从 canonical type1519 消息解析公告正文、版本和操作者。 */
export function parseIMGroupAnnouncementRealtime(message) {
    if (message.contentType !== 1519)
        return null;
    // records 只遍历 Gateway system body 的已知容器。
    const records = collectAnnouncementRecords(message.payload);
    // eventType 防止同 type 畸形 payload 改写群缓存。
    const eventType = readFirstString(records, ['event_type', 'eventType']);
    if (eventType && eventType !== 'group_announcement_changed')
        return null;
    // groupID 和 version 是跨消息、群缓存和已读状态的稳定身份。
    const groupID = readFirstString(records, ['group_id', 'groupID']);
    const announcementVersion = readFirstString(records, [
        'announcement_version',
        'announcementVersion',
    ]);
    // announcement 必须是事件明确提供的字符串，禁止回退 system.text。
    const announcement = readFirstStringValue(records, ['announcement']);
    if (!groupID || !announcementVersion || announcement === null)
        return null;
    return {
        groupID,
        announcement,
        announcementVersion,
        operatorUserID: readFirstString(records, ['operator_user_id', 'operatorUserID']),
    };
}
/** 顺序应用 type1519 公告补丁并返回实际更新的群快照。 */
export async function applyIMGroupAnnouncementRealtime(context, messages) {
    // repository 是当前账号 groups cache 的唯一写入 owner。
    const repository = new GroupRepository(context.database);
    // updated 仅包含成功命中已有群缓存的最终快照。
    const updated = [];
    for (const message of messages) {
        // patch 为畸形或非公告消息时不影响普通消息持久化。
        const patch = parseIMGroupAnnouncementRealtime(message);
        if (!patch)
            continue;
        // existing 缺失时由后续 groups.sync 恢复，不创建不完整群实体。
        const existing = await repository.getByID(patch.groupID);
        if (!existing)
            continue;
        // payload 保留群资料、排序和权限快照。
        const payload = readGroupPayload(existing);
        // permission 保留其他 capability 和现有已读版本。
        const permission = isRecord(payload.user_permission) ? payload.user_permission : {};
        // isOwnOperator 防止发布者收到回推后把自己的新公告标记未读。
        const isOwnOperator = patch.operatorUserID === context.userID;
        // alreadyRead 处理重复投递和先读后迟到事件。
        const alreadyRead = String(permission.announcement_read_version ?? '').trim() ===
            patch.announcementVersion;
        // next 是公告事件的 success-only 字段合并。
        const next = {
            ...existing,
            payload: {
                ...payload,
                group_id: existing.groupID,
                announcement: patch.announcement,
                announcement_version: patch.announcementVersion,
                user_permission: {
                    ...permission,
                    ...(isOwnOperator
                        ? { announcement_read_version: patch.announcementVersion }
                        : {}),
                    announcement_unread: !isOwnOperator && !alreadyRead,
                },
            },
        };
        await repository.upsert(next);
        updated.push(next);
    }
    return updated;
}
/** 收集公告 system payload 的有限嵌套记录。 */
function collectAnnouncementRecords(value) {
    // records 保持外到内顺序，extra 中业务字段仍可被读取。
    const records = [];
    // visited 防止兼容 payload 意外循环。
    const visited = new Set();
    /** visit 只访问 body/system/extra/payload 容器。 */
    const visit = (candidate) => {
        if (!isRecord(candidate) || visited.has(candidate))
            return;
        visited.add(candidate);
        records.push(candidate);
        visit(candidate.body);
        visit(candidate.system);
        visit(candidate.extra);
        visit(candidate.payload);
    };
    visit(value);
    return records;
}
/** 按字段优先级读取第一个非空字符串。 */
function readFirstString(records, keys) {
    return readFirstStringValue(records, keys)?.trim() ?? '';
}
/** 按字段优先级读取字符串并允许公告正文为空。 */
function readFirstStringValue(records, keys) {
    for (const key of keys) {
        for (const record of records) {
            if (typeof record[key] === 'string')
                return record[key];
        }
    }
    return null;
}
/** 从缓存群读取 raw payload。 */
function readGroupPayload(group) {
    return isRecord(group.payload) ? group.payload : group;
}
/** 判断未知值是否为可读取对象。 */
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
//# sourceMappingURL=group-announcement-realtime.js.map