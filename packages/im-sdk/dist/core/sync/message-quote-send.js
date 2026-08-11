import { completeWebIMMessageSend, failWebIMMessageSend, prepareWebIMMessageSend, } from './message-send-state.js';
import { createWebIMSyncError } from './sync-context.js';
/** 使用 RN type114 契约发送引用消息并持久化完整可重放 body。 */
export async function sendWebIMQuoteMessage(context, options, dependencies) {
    // body 在任何写入前完成来源身份和回复正文校验。
    const body = createWebIMQuoteBody(options.sourceMessage, options.text);
    // prepared 先写入完整 quote payload，确保失败和刷新后可重试。
    const prepared = await prepareWebIMMessageSend(context, {
        conversationID: options.conversationID,
        contentType: 114,
        payload: body,
    }, dependencies);
    try {
        options.onSending?.(prepared.localMessage);
        return await completeWebIMMessageSend(prepared, body, dependencies);
    }
    catch (cause) {
        return failWebIMMessageSend(prepared, cause);
    }
}
/** 从来源消息构造唯一合法的 Gateway quote body。 */
export function createWebIMQuoteBody(sourceMessage, replyText) {
    // sourceMessageID 优先采用服务端身份，回退本地稳定身份。
    const sourceMessageID = sourceMessage.serverMsgID?.trim() || sourceMessage.clientMsgID.trim();
    // text 是用户本次输入的回复正文。
    const text = replyText.trim();
    if (!sourceMessageID) {
        throw createWebIMSyncError('INVALID_QUOTE_SOURCE', 'Quote sending requires a source message ID.');
    }
    if (!text) {
        throw createWebIMSyncError('INVALID_QUOTE_REPLY', 'Quote sending requires non-empty reply text.');
    }
    return {
        quote: {
            msg_id: sourceMessageID,
            text: readWebIMMessageTextForQuote(sourceMessage),
            reply_text: text,
        },
    };
}
/** 严格恢复持久化 quote body，供 failed retry 复用。 */
export function normalizeWebIMQuoteBody(payload) {
    // quote 只接受普通对象，禁止数组或隐式类型转换。
    const quote = readRecord(readRecord(payload).quote);
    // msgID 是来源消息稳定身份。
    const msgID = readString(quote.msg_id);
    // replyText 是原失败消息的不可变回复正文。
    const replyText = readString(quote.reply_text);
    if (!msgID || !replyText) {
        throw createWebIMSyncError('INVALID_RETRY_MESSAGE_PAYLOAD', 'The cached quote message cannot be reconstructed.');
    }
    // sourceText 允许为空，但不接受非字符串字段。
    const sourceText = typeof quote.text === 'string' ? quote.text.trim() : '';
    return { quote: { msg_id: msgID, text: sourceText, reply_text: replyText } };
}
/** 按 RN 可见文本优先级生成来源快照。 */
function readWebIMMessageTextForQuote(message) {
    // payload 是 shared mapper 保存的 Gateway body。
    const payload = readRecord(message.payload);
    return (readNestedString(payload, 'text', 'text') ||
        readNestedString(payload, 'quote', 'reply_text') ||
        readNestedString(payload, 'mention', 'text') ||
        readNestedString(readRecord(payload.card), 'user', 'nickname') ||
        readNestedString(readRecord(payload.card), 'group', 'title'));
}
/** 从对象的二级字段读取去空白字符串。 */
function readNestedString(source, ownerKey, valueKey) {
    return readString(readRecord(source[ownerKey])[valueKey]);
}
/** 将未知值收窄为普通只读对象。 */
function readRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? value
        : {};
}
/** 将未知值收窄为去空白字符串。 */
function readString(value) {
    return typeof value === 'string' ? value.trim() : '';
}
//# sourceMappingURL=message-quote-send.js.map