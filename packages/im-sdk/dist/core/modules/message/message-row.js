import { parseJsonColumn, readOptionalNumber, readOptionalString, readRequiredNumber, readRequiredString, } from '../../db/row.js';
import { normalizeMessageMentions } from './mention.js';
import { normalizePresetEmojiEntities } from './preset-emoji.js';
/** 将 messages 表行恢复为平台中立消息，并统一校验 JSON 扩展字段。 */
export function mapStoredMessageRow(row) {
    /** serverMsgID 仅在服务端身份已落库时返回。 */
    const serverMsgID = readOptionalString(row, 'server_msg_id');
    /** seq 是可用于会话内排序和未读边界的安全整数。 */
    const seq = readOptionalNumber(row, 'seq');
    /** seqString 保留 Gateway uint64 的精确十进制身份。 */
    const seqString = readOptionalString(row, 'seq_text');
    /** localEx 保存编辑时间等本地扩展状态。 */
    const localEx = readOptionalString(row, 'local_extra_json');
    /** forwardSourceMsgID 保留普通转发失败行的服务端源身份。 */
    const forwardSourceMsgID = readOptionalString(row, 'forward_source_msg_id');
    /** forwardBatchID 关联同一次批量提交的 optimistic 行。 */
    const forwardBatchID = readOptionalString(row, 'forward_batch_id');
    /** payload 先解析一次，供正文与实体边界共同校验。 */
    const payload = parseJsonColumn(row, 'payload_json', null);
    /** entities 独立于 payload 保存，读取时仍需按 Unicode 正文验证区间。 */
    const entities = normalizePresetEmojiEntities(parseJsonColumn(row, 'entities_json', []), readPayloadText(payload));
    /** mentions 分列保存，避免服务端正文未回显 targets 时丢失提醒身份。 */
    const mentions = normalizeMessageMentions(parseJsonColumn(row, 'mentions_json', []));
    /** forwardOrigin 与正文分列读取，避免 body 兼容字段成为第二真相。 */
    const forwardOrigin = parseForwardOrigin(row);
    return {
        clientMsgID: readRequiredString(row, 'client_msg_id'),
        ...(serverMsgID !== undefined ? { serverMsgID } : {}),
        conversationID: readRequiredString(row, 'conversation_id'),
        senderID: readRequiredString(row, 'sender_id'),
        direction: readRequiredString(row, 'direction'),
        contentType: readRequiredNumber(row, 'content_type'),
        status: readRequiredString(row, 'status'),
        sendTime: readRequiredNumber(row, 'send_time'),
        ...(seq !== undefined ? { seq } : {}),
        ...(seqString !== undefined ? { seqString } : {}),
        ...(forwardOrigin ? { forwardOrigin } : {}),
        ...(forwardSourceMsgID ? { forwardSourceMsgID } : {}),
        ...(forwardBatchID ? { forwardBatchID } : {}),
        ...(localEx !== undefined ? { localEx } : {}),
        ...(entities.length ? { entities } : {}),
        ...(mentions.length ? { mentions } : {}),
        payload,
    };
}
/** 从 SQLite JSON 列恢复严格的转发来源快照。 */
function parseForwardOrigin(row) {
    /** value 只接受普通对象，畸形缓存按无来源降级。 */
    const value = parseJsonColumn(row, 'forward_origin_json', null);
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return undefined;
    /** record 用于逐字段收窄，不信任 JSON 的静态类型。 */
    const record = value;
    /** userID 是来源快照的最低有效身份。 */
    const userID = typeof record.userID === 'string' ? record.userID.trim() : '';
    if (!userID)
        return undefined;
    /** type 仅保留非空字符串。 */
    const type = typeof record.type === 'string' ? record.type.trim() : '';
    /** name 仅保留非空字符串。 */
    const name = typeof record.name === 'string' ? record.name.trim() : '';
    /** avatarURL 仅保留非空字符串。 */
    const avatarURL = typeof record.avatarURL === 'string' ? record.avatarURL.trim() : '';
    return {
        userID,
        ...(type ? { type } : {}),
        ...(name ? { name } : {}),
        ...(avatarURL ? { avatarURL } : {}),
    };
}
/** 从 core 文本 payload 安全读取 Unicode 正文。 */
function readPayloadText(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload))
        return '';
    /** textContainer 对应 Gateway body.text 对象。 */
    const textContainer = payload.text;
    if (!textContainer || typeof textContainer !== 'object' || Array.isArray(textContainer))
        return '';
    /** value 对应最终 UTF-16 正文。 */
    const value = textContainer.text;
    return typeof value === 'string' ? value : '';
}
//# sourceMappingURL=message-row.js.map