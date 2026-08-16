import { deliverWebIMForwardBatch } from './message-forward-delivery.js';
import { prepareWebIMForwardBatch } from './message-forward-state.js';
/** 执行真实来源重读、optimistic 落库、Gateway 投递与逐行收敛。 */
export async function forwardWebIMMessages(context, options, dependencies) {
    // prepared 在网络前完成全量校验和原子 optimistic 写入。
    const prepared = await prepareWebIMForwardBatch(context, options, dependencies);
    try {
        // sendingMessages 只包含已经持久化的目标会话实体。
        const sendingMessages = collectPreparedMessages(prepared);
        options.onSending?.(sendingMessages);
        // result 保留每条和 comment 的独立成败。
        const result = await deliverWebIMForwardBatch(prepared, dependencies.gatewayClient);
        // finalMessages 在一个事务中覆盖同一批 optimistic 行。
        const finalMessages = collectResultMessages(result);
        await prepared.messageRepository.upsertMany(finalMessages);
        return result;
    }
    catch (cause) {
        // failedMessages 只改变当前 batch 新生成的本地行。
        const failedMessages = collectPreparedMessages(prepared).map(message => ({
            ...message,
            status: 'failed',
        }));
        try {
            await prepared.messageRepository.upsertMany(failedMessages);
        }
        catch (statusCause) {
            throw new AggregateError([cause, statusCause], 'Forward send and failed-state persistence both failed.');
        }
        throw cause;
    }
}
/** 按转发项在前、comment 在后的顺序收集 optimistic 行。 */
function collectPreparedMessages(prepared) {
    // itemMessages 与 Gateway message.batch 顺序一致。
    const itemMessages = prepared.items.map(item => item.localMessage);
    return prepared.commentMessage
        ? [...itemMessages, prepared.commentMessage]
        : itemMessages;
}
/** 从逐项结果收集需要事务回写的最终消息行。 */
function collectResultMessages(result) {
    // itemMessages 保留来源选择顺序。
    const itemMessages = result.list.map(item => item.message);
    return result.comment ? [...itemMessages, result.comment.message] : itemMessages;
}
//# sourceMappingURL=message-forward.js.map