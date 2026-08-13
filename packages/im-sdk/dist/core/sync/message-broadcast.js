import { prepareWebIMAudioUpload, } from './message-audio-send.js';
import {} from '@im28/im-sdk/core';
import { prepareWebIMFileUpload, prepareWebIMImageUpload, } from './message-media-send.js';
import { uploadIMBroadcastMedia } from './message-broadcast-media.js';
import { prepareWebIMVideoUpload, } from './message-video-send.js';
import { createWebIMSyncError, requireWebIMSyncContext, } from './sync-context.js';
import { resolveIMBroadcastTargetResults, } from './message-broadcast-result.js';
/** Gateway 批量发送允许的最大目标数。 */
export const IM_BROADCAST_MAX_TARGETS = 50;
/** 创建绑定当前认证账号的文本群发状态机。 */
export function createIMMessageBroadcastSync(dependencies) {
    /** operationQueue 与消息、会话和 realtime 写入保持同一顺序。 */
    const operationQueue = dependencies.mutationQueue;
    return {
        sendText: options => {
            /** operation 在执行时读取账号，避免排队期间切号后写错库。 */
            const operation = () => sendBroadcastTextDirect(dependencies, options);
            return operationQueue ? operationQueue.enqueue(operation) : operation();
        },
        sendImage: options => sendBroadcastMedia(dependencies, options, prepareWebIMImageUpload(options), operationQueue),
        sendVideo: options => sendBroadcastMedia(dependencies, options, prepareWebIMVideoUpload(options), operationQueue),
        sendFile: options => sendBroadcastMedia(dependencies, options, prepareWebIMFileUpload(options), operationQueue),
        sendAudio: options => sendBroadcastMedia(dependencies, options, prepareWebIMAudioUpload(options), operationQueue),
    };
}
/** 执行一次 Gateway batch-send 并逐目标收敛明确成功消息。 */
async function sendBroadcastTextDirect(dependencies, options) {
    /** text 在网络前拒绝空白消息。 */
    const text = options.text.trim();
    if (!text) {
        throw createWebIMSyncError('BROADCAST_TEXT_EMPTY', 'Broadcast text must not be empty.');
    }
    /** prepared 在网络前冻结账号、目标和幂等身份。 */
    const prepared = prepareBroadcastRequest(dependencies, options);
    return sendBroadcastBodyDirect(dependencies, prepared, { text: { text } });
}
/** 上传一次媒体，再在共享短队列中执行唯一一次 batch-send。 */
async function sendBroadcastMedia(dependencies, options, definition, operationQueue) {
    /** prepared 在长上传前拒绝无效目标并冻结账号身份。 */
    const prepared = prepareBroadcastRequest(dependencies, options);
    /** body 上传发生在队列外，避免阻塞 realtime 与普通消息缓存写入。 */
    const body = await uploadIMBroadcastMedia(definition, dependencies);
    /** operation 只占用 batch-send 与成功缓存收敛的短时段。 */
    const operation = () => sendBroadcastBodyDirect(dependencies, prepared, body);
    return operationQueue ? operationQueue.enqueue(operation) : operation();
}
/** 冻结一次群发操作的账号、去重目标和稳定批次身份。 */
function prepareBroadcastRequest(dependencies, options) {
    /** context 是上传前已认证的账户数据库。 */
    const context = requireWebIMSyncContext(dependencies, 'Message broadcast');
    /** targets 在任何上传或网络请求前完成校验。 */
    const targets = normalizeBroadcastTargets(options.targets, dependencies);
    /** batchID 是整批请求的稳定幂等身份。 */
    const batchID = resolveBroadcastID(options.batchID, dependencies);
    return { context, targets, batchID };
}
/** 执行一次任意合法 Gateway body 的 batch-send 与逐目标缓存收敛。 */
async function sendBroadcastBodyDirect(dependencies, prepared, body) {
    /** currentContext 防止上传期间切号后向旧账户数据库写入新账户结果。 */
    const currentContext = requireWebIMSyncContext(dependencies, 'Message broadcast');
    if (currentContext.userID !== prepared.context.userID
        || currentContext.database !== prepared.context.database) {
        throw createWebIMSyncError('BROADCAST_ACCOUNT_CHANGED', 'The signed-in account changed during media broadcast.');
    }
    /** response 是本次操作唯一一次 batch-send 调用。 */
    const response = await dependencies.gatewayClient.batchSendMessage({
        batch_id: prepared.batchID,
        body,
        targets: prepared.targets.map(target => ({
            ...(target.kind === 'friend'
                ? { friend_user_id: target.targetID }
                : { group_id: target.targetID }),
            client_msg_id: target.clientMsgID,
        })),
    });
    /** results 保持用户选择顺序，并独立解释每个目标。 */
    const results = await resolveIMBroadcastTargetResults(prepared.context, dependencies.gatewayClient, prepared.targets, response.list ?? []);
    /** successCount 只统计逐目标 code=0，不信任顶层聚合数字。 */
    const successCount = results.filter(result => result.status === 'sent').length;
    /** failedCount 只统计服务端明确业务失败。 */
    const failedCount = results.filter(result => result.status === 'failed').length;
    /** unknownCount 显式暴露缺失或不可关联结果。 */
    const unknownCount = results.length - successCount - failedCount;
    return {
        batchID: prepared.batchID,
        successCount,
        failedCount,
        unknownCount,
        results,
    };
}
/** 规范化、去重并为每个群发目标分配稳定消息 ID。 */
function normalizeBroadcastTargets(values, dependencies) {
    /** targets 按首次出现顺序保存不同类型和身份。 */
    const targets = [];
    /** seen 防止同一好友或群在单批请求中重复发送。 */
    const seen = new Set();
    for (const value of values) {
        /** targetID 是 Gateway 唯一接受的目标身份。 */
        const targetID = value.targetID.trim();
        if (!targetID || (value.kind !== 'friend' && value.kind !== 'group')) {
            throw createWebIMSyncError('BROADCAST_TARGET_INVALID', 'Broadcast target identity is invalid.');
        }
        /** key 保留好友和群的独立身份域。 */
        const key = `${value.kind}:${targetID}`;
        if (seen.has(key))
            continue;
        seen.add(key);
        targets.push({
            kind: value.kind,
            targetID,
            clientMsgID: resolveBroadcastID(value.clientMsgID, dependencies),
        });
    }
    if (!targets.length) {
        throw createWebIMSyncError('BROADCAST_TARGET_REQUIRED', 'Select at least one broadcast target.');
    }
    if (targets.length > IM_BROADCAST_MAX_TARGETS) {
        throw createWebIMSyncError('BROADCAST_TARGET_LIMIT_EXCEEDED', `Broadcast supports at most ${IM_BROADCAST_MAX_TARGETS} targets.`);
    }
    return targets;
}
/** 解析 caller 提供或运行时生成的非空稳定幂等 ID。 */
function resolveBroadcastID(value, dependencies) {
    /** id 优先接受 caller 的显式重试身份。 */
    const id = (value ?? dependencies.createClientMessageID?.()
        ?? globalThis.crypto?.randomUUID?.())?.trim();
    if (!id) {
        throw createWebIMSyncError('BROADCAST_ID_UNAVAILABLE', 'Broadcast requires a stable client identity generator.');
    }
    return id;
}
//# sourceMappingURL=message-broadcast.js.map