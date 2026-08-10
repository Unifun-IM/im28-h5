import { MessageRepository, mapGatewayMessageToCore, } from '@im28/im-sdk/core';
import { readMessageUpdateCursor, writeMessageUpdateCursor, } from './message-update-cursor-store.js';
import { readString } from './realtime-event-data.js';
import { collectRealtimeMessageUpdates, } from './realtime-message-update-data.js';
import { recoverRealtimeMessageUpdates } from './realtime-message-update-recovery.js';
import { createWebIMSyncError, } from './sync-context.js';
/** 创建无独立队列的 message update 持久化 handler。 */
export function createRealtimeMessageUpdateSync(dependencies) {
    /** 在主 realtime 队列内处理单个 normalized update event。 */
    return async (event, context) => {
        // eventUpdates 必须全部具备 conversation/type/target identity。
        const eventUpdates = collectRealtimeMessageUpdates(event.data ?? event.raw);
        if (!eventUpdates.length) {
            throw createWebIMSyncError('INVALID_REALTIME_MESSAGE_UPDATE', 'Realtime message update has no stable operation identity.');
        }
        // groups 让每个 conversation 独立读取和推进 update cursor。
        const groups = groupUpdatesByConversation(eventUpdates);
        for (const [conversationID, updates] of groups) {
            await convergeConversationUpdates(dependencies.gatewayClient, context, conversationID, updates);
        }
        return true;
    };
}
/** 恢复缺口、应用更新并在每个成功 operation 后推进 cursor。 */
async function convergeConversationUpdates(gatewayClient, context, conversationID, eventUpdates) {
    // storedCursor 是当前会话已确认成功的 update 水位。
    let storedCursor = await readMessageUpdateCursor(context.database, conversationID);
    // recovery 在需要时补齐服务端窗口，并返回去重排序结果。
    const recovery = await recoverRealtimeMessageUpdates(gatewayClient, conversationID, storedCursor, eventUpdates);
    // repository 负责 edit upsert 与 delete 状态转换。
    const repository = new MessageRepository(context.database);
    for (const parsed of recovery.updates) {
        if (parsed.updateSeq && BigInt(parsed.updateSeq) <= BigInt(storedCursor)) {
            continue;
        }
        await applyMessageUpdate(repository, context, parsed);
        if (parsed.updateSeq) {
            await writeMessageUpdateCursor(context.database, conversationID, parsed.updateSeq);
            storedCursor = parsed.updateSeq;
        }
    }
    if (recovery.finalCursor &&
        BigInt(recovery.finalCursor) > BigInt(storedCursor)) {
        await writeMessageUpdateCursor(context.database, conversationID, recovery.finalCursor);
    }
}
/** 应用 edited 或 deleted，未知状态必须拒绝。 */
async function applyMessageUpdate(repository, context, parsed) {
    // update 已由 parser 归一为 canonical DTO。
    const update = parsed.update;
    if (update.type === 'deleted') {
        await applyDeletedUpdate(repository, update);
        return;
    }
    if (update.type !== 'edited' || !update.message) {
        throw createWebIMSyncError('INVALID_EDITED_MESSAGE_UPDATE', 'Edited message update requires a complete target message.');
    }
    // mapped 使用 shared canonical DTO -> core mapper。
    const mapped = mapGatewayMessageToCore(update.message, {
        currentUserID: context.userID,
        conversationID: update.conversation_id,
    });
    // existing 优先按 target server ID，再按 mapped identities 查找。
    const existing = await findUpdateTarget(repository, update, mapped);
    if (existing && !shouldApplyEditedMessage(existing, parsed))
        return;
    // editedMessage 保留本地 identity/order/status，只替换服务端内容。
    const editedMessage = existing
        ? {
            ...mapped,
            clientMsgID: existing.clientMsgID,
            ...(existing.serverMsgID
                ? { serverMsgID: existing.serverMsgID }
                : {}),
            status: existing.status,
            sendTime: existing.sendTime,
            ...(existing.seq === undefined ? {} : { seq: existing.seq }),
            localEx: createEditedLocalExtra(existing.localEx, parsed),
        }
        : {
            ...mapped,
            localEx: createEditedLocalExtra(mapped.localEx, parsed),
        };
    await repository.upsert(editedMessage);
}
/** 将 delete/self 或 delete/all 都收敛为当前用户本地隐藏。 */
async function applyDeletedUpdate(repository, update) {
    // target 优先按 Gateway target server ID 查找。
    const target = await findUpdateTarget(repository, update);
    if (target)
        await repository.markLocalDeleted(target.clientMsgID);
}
/** 按 server/client identity 查找 update 目标。 */
async function findUpdateTarget(repository, update, mapped) {
    // serverMsgID 是 update.target_msg_id 的规范含义。
    const serverMsgID = readString(update.target_msg_id);
    if (serverMsgID) {
        // byServer 覆盖收到的消息和发送回显。
        const byServer = await repository.getByServerMsgID(serverMsgID);
        if (byServer)
            return byServer;
    }
    // clientMsgID 从完整 update.message 或 mapper 结果回退。
    const clientMsgID = readString(update.message?.client_msg_id) ?? mapped?.clientMsgID;
    return clientMsgID
        ? repository.getByClientMsgID(clientMsgID)
        : null;
}
/** 为 edit 保存可审计时间与无损 update cursor。 */
function createEditedLocalExtra(current, parsed) {
    // existing 仅接受对象 JSON，损坏值不向新记录传播。
    let existing = {};
    try {
        // candidate 是解析后的未知 JSON。
        const candidate = current ? JSON.parse(current) : null;
        if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
            existing = candidate;
        }
    }
    catch {
        existing = {};
    }
    // editedAt 优先使用服务端 operation/message 更新时间。
    const editedAt = readEditedAt(parsed);
    return JSON.stringify({
        ...existing,
        editedAt: editedAt || Date.now(),
        ...(parsed.updateSeq ? { messageUpdateSeq: parsed.updateSeq } : {}),
    });
}
/** 阻止 cursorless 旧编辑覆盖已持久化的新版本。 */
function shouldApplyEditedMessage(existing, parsed) {
    // incomingEditedAt 缺失时无法比较，只保留幂等 upsert 行为。
    const incomingEditedAt = readEditedAt(parsed);
    if (!incomingEditedAt || !existing.localEx)
        return true;
    try {
        // metadata 只读取本 owner 写入的 editedAt 数值。
        const metadata = JSON.parse(existing.localEx);
        // existingEditedAt 缺失时允许首次可排序编辑。
        const existingEditedAt = Number(metadata.editedAt);
        return !Number.isFinite(existingEditedAt) || incomingEditedAt >= existingEditedAt;
    }
    catch {
        return true;
    }
}
/** 读取 update operation 或目标消息的服务端编辑时间。 */
function readEditedAt(parsed) {
    // messageUpdatedAt 兼容完整 Gateway target message 的更新时间。
    const messageUpdatedAt = readString(parsed.update.message?.updated_at);
    // value 优先 operation occurred_at，再使用 message updated_at。
    const value = readString(parsed.update.occurred_at) ?? messageUpdatedAt;
    if (!value)
        return 0;
    // timestamp 只接受有效 RFC3339 解析结果。
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) ? timestamp : 0;
}
/** 按 conversation ID 聚合 updates。 */
function groupUpdatesByConversation(updates) {
    // groups 保留会话首见顺序。
    const groups = new Map();
    for (const update of updates) {
        // conversationID 已由 parser 验证。
        const conversationID = readString(update.update.conversation_id);
        // group 是当前会话 update 批次。
        const group = groups.get(conversationID) ?? [];
        group.push(update);
        groups.set(conversationID, group);
    }
    return groups;
}
//# sourceMappingURL=realtime-message-update-sync.js.map