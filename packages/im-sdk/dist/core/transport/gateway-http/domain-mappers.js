import { IMError } from '../../core/errors.js';
import { normalizeConversationAutoDeleteSeconds } from '../../core/conversation-auto-delete.js';
import { normalizePresetEmojiEntities } from '../../modules/message/preset-emoji.js';
import { normalizeMessageMentions } from '../../modules/message/mention.js';
/** 将 Gateway message 映射为跨平台 core message。 */
export function mapGatewayMessageToCore(message, options) {
    // serverMsgID 只接受非空服务端标识。
    const serverMsgID = readString(message.msg_id);
    // clientMsgID 缺失时使用 server ID，保证本地 Repository 主键稳定。
    const clientMsgID = readString(message.client_msg_id) || serverMsgID;
    // conversationID 允许由包含该消息的会话补齐。
    const conversationID = readString(message.conversation_id) || readString(options.conversationID);
    // senderID 决定消息方向，不能由当前账号伪造补齐。
    const senderID = readString(message.sender_id);
    if (!clientMsgID || !conversationID || !senderID) {
        throw invalidGatewayEntity('message', {
            clientMsgID,
            conversationID,
            senderID,
        });
    }
    // direction 只比较稳定 user ID。
    const direction = senderID === options.currentUserID ? 'outgoing' : 'incoming';
    // status 结合显式 Gateway 状态和消息方向归一化。
    const status = mapMessageStatus(message.status, direction);
    // seq 超出 JS 安全整数时不写入数值索引，原值仍保留在 payload。
    const seq = readSafeInteger(message.msg_seq);
    // entity 区间只对文本正文有意义，未知或错误输入保守降级为 Unicode。
    const entities = normalizePresetEmojiEntities(message.entities, readGatewayMessageText(message.body));
    // mentions 使用顶层服务端身份，正文 targets 只作 payload 快照。
    const mentions = normalizeMessageMentions(message.mentions);
    // forwardOrigin 只接受 Gateway 顶层来源快照，不从正文或当前用户补造。
    const forwardOrigin = normalizeGatewayForwardOrigin(message.forward_origin);
    return {
        clientMsgID,
        ...(serverMsgID ? { serverMsgID } : {}),
        conversationID,
        senderID,
        direction,
        contentType: mapContentType(message.type),
        status,
        sendTime: readTimestamp(message.sent_at ?? message.updated_at),
        ...(seq === undefined ? {} : { seq }),
        ...(forwardOrigin ? { forwardOrigin } : {}),
        ...(entities.length ? { entities } : {}),
        ...(mentions.length ? { mentions } : {}),
        payload: message.body ?? null,
    };
}
/** 将 Gateway snake_case 来源快照收窄为平台中立模型。 */
function normalizeGatewayForwardOrigin(value) {
    if (!value)
        return undefined;
    // userID 是转发来源唯一可信身份，缺失时整份快照不可用。
    const userID = readString(value.user_id);
    if (!userID)
        return undefined;
    // type 保留服务端扩展值，当前规范值为 user。
    const type = readString(value.type);
    // name 与 avatarURL 是可选展示快照，不参与身份判断。
    const name = readString(value.name);
    const avatarURL = readString(value.avatar_url);
    return {
        userID,
        ...(type ? { type } : {}),
        ...(name ? { name } : {}),
        ...(avatarURL ? { avatarURL } : {}),
    };
}
/** 从 Gateway body 安全读取文本消息的 Unicode 正文。 */
function readGatewayMessageText(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body))
        return '';
    /** bodyRecord 隔离生成类型中的多种消息联合。 */
    const bodyRecord = body;
    /** textRecord 只接受文本消息对象。 */
    const textRecord = bodyRecord.text;
    if (!textRecord || typeof textRecord !== 'object' || Array.isArray(textRecord))
        return '';
    /** value 是 Gateway text.text 的未知输入。 */
    const value = textRecord.text;
    return typeof value === 'string' ? value : '';
}
/** 将 Gateway conversation 与 latest message 映射为 core entities。 */
export function mapGatewayConversationToCore(input, currentUserID) {
    // body 解包 Gateway direct/group wrapper，并保留显式会话类型。
    const body = unwrapConversation(input);
    // conversationID 是会话 Repository 的稳定主键。
    const conversationID = readString(body.conversation_id);
    // type 同时兼容规范字符串与旧 numeric envelope。
    const type = mapConversationType(body.type);
    // targetID 按会话类型读取 peer/group identity。
    const targetID = readConversationTargetID(body, type, conversationID);
    if (!conversationID || !targetID) {
        throw invalidGatewayEntity('conversation', {
            conversationID,
            targetID,
        });
    }
    // latestMessage 映射失败必须阻止本轮全量替换，避免半有效缓存。
    const latestMessage = body.last_message
        ? mapGatewayMessageToCore(body.last_message, {
            currentUserID,
            conversationID,
        })
        : undefined;
    // pinnedAt 同时作为 pin flag 和稳定排序字段。
    const pinnedAt = readTimestamp(body.pinned_at);
    // updatedAt 优先使用会话更新时间，再使用 latest message 时间。
    const updatedAt = readTimestamp(body.updated_at ?? body.created_at) ||
        latestMessage?.sendTime ||
        0;
    // name 按显式标题、对象资料、target ID 顺序回退。
    const name = readConversationName(body, type, targetID);
    // faceURL 按显式头像和对象资料回退。
    const faceURL = readString(body.avatar_url) ||
        readString(type === 'group' ? body.group?.avatar_url : body.user?.avatar_url);
    // autoDeleteSeconds 缺失时保持可选，存在时必须满足 Gateway 枚举。
    const autoDeleteSeconds = normalizeConversationAutoDeleteSeconds(body.auto_delete_seconds);
    if (body.auto_delete_seconds !== undefined &&
        autoDeleteSeconds === undefined) {
        throw invalidGatewayEntity('conversation', {
            conversationID,
            autoDeleteSeconds: String(body.auto_delete_seconds),
        });
    }
    // autoDeleteUpdatedBy 只接受非空服务端用户标识。
    const autoDeleteUpdatedBy = readString(body.auto_delete_updated_by);
    // autoDeleteUpdatedAt 使用与会话一致的 Gateway 时间归一化。
    const autoDeleteUpdatedAt = readTimestamp(body.auto_delete_updated_at);
    return {
        conversation: {
            conversationID,
            type,
            targetID,
            ...(name ? { name } : {}),
            ...(faceURL ? { faceURL } : {}),
            ...(latestMessage ? { latestMessageID: latestMessage.clientMsgID } : {}),
            ...(readString(body.last_read_seq)
                ? { lastReadSeq: readString(body.last_read_seq) }
                : {}),
            ...(readString(body.last_msg_seq)
                ? { lastMsgSeq: readString(body.last_msg_seq) }
                : {}),
            unreadCount: readBoundedCount(body.unread_count),
            isArchived: Boolean(body.archived ?? body.list_hidden),
            isPinned: pinnedAt > 0,
            pinnedAt,
            isMuted: Boolean(body.notification_muted),
            ...(autoDeleteSeconds !== undefined ? { autoDeleteSeconds } : {}),
            ...(autoDeleteUpdatedBy ? { autoDeleteUpdatedBy } : {}),
            ...(autoDeleteUpdatedAt > 0 ? { autoDeleteUpdatedAt } : {}),
            updatedAt,
            payload: input,
        },
        ...(latestMessage ? { latestMessage } : {}),
    };
}
/** 解包 direct/group conversation wrapper。 */
function unwrapConversation(input) {
    if (input.group_conversation) {
        return { ...input.group_conversation, type: 'group' };
    }
    if (input.direct_conversation) {
        return { ...input.direct_conversation, type: 'direct' };
    }
    return input;
}
/** 把 Gateway 会话枚举归一化为 core 类型。 */
function mapConversationType(type) {
    if (type === 'direct' || type === 1) {
        return 'single';
    }
    if (type === 'group' || type === 2 || type === 3) {
        return 'group';
    }
    return 'unknown';
}
/** 读取会话对象 identity，并只对已知 ID 前缀做派生。 */
function readConversationTargetID(conversation, type, conversationID) {
    // raw 承载尚未进入稳定 DTO 的兼容 identity 字段。
    const raw = conversation;
    if (type === 'group') {
        return (readString(conversation.group?.group_id) ||
            readString(raw.group_id) ||
            readString(raw.target_id) ||
            stripPrefix(conversationID, ['sg_', 'group_']));
    }
    if (type === 'single') {
        return (readString(conversation.user?.user_id) ||
            readString(raw.peer_user_id) ||
            readString(raw.target_user_id) ||
            readString(raw.friend_user_id) ||
            readString(raw.user_id) ||
            stripPrefix(conversationID, ['si_', 'single_', 'direct_']) ||
            conversationID);
    }
    return readString(raw.target_id);
}
/** 生成会话展示名的跨平台基础值。 */
function readConversationName(conversation, type, targetID) {
    if (type === 'group') {
        return (readString(conversation.title) ||
            readString(conversation.group?.title) ||
            targetID);
    }
    return (readString(conversation.title) ||
        readString(conversation.user?.nickname) ||
        readString(conversation.user?.account) ||
        readString(conversation.user?.user_id) ||
        targetID);
}
/** 把 Gateway 消息状态收敛到 Repository 状态机。 */
function mapMessageStatus(status, direction) {
    if (status === 'sending' || status === 1 || status === '1') {
        return 'sending';
    }
    if (status === 'failed' || status === 3 || status === '3') {
        return 'failed';
    }
    if (status === 'recalled') {
        return 'revoked';
    }
    if (status === 'deleted') {
        return 'deleted_local';
    }
    if (status === 'sent' || status === 2 || status === '2') {
        return 'sent';
    }
    return direction === 'incoming' ? 'received' : 'sent';
}
/** 将常见 Gateway 内容类型映射为 OpenIM numeric content type。 */
function mapContentType(type) {
    if (typeof type === 'number') {
        return type;
    }
    // numericType 支持 JSON 中以字符串返回的 content type。
    const numericType = Number(type);
    if (type && Number.isFinite(numericType)) {
        return numericType;
    }
    // namedTypes 仅覆盖首批 Web UI 可识别的稳定类型。
    const namedTypes = {
        text: 101,
        image: 102,
        audio: 103,
        video: 104,
        file: 105,
        mention: 106,
        custom: 110,
        quote: 114,
    };
    return type ? namedTypes[type] ?? 0 : 0;
}
/** 读取并裁剪可能来自 wire record 的字符串。 */
function readString(value) {
    return typeof value === 'string' ? value.trim() : '';
}
/** 将 uint64 count 限制到 JS 可安全表达范围。 */
function readBoundedCount(value) {
    // count 仅接受非负有限数字。
    const count = Number(value);
    if (!Number.isFinite(count) || count <= 0) {
        return 0;
    }
    return Math.min(Math.trunc(count), Number.MAX_SAFE_INTEGER);
}
/** 将 uint64 seq 转为安全整数，超界时交由 payload 保存原值。 */
function readSafeInteger(value) {
    // parsed 是 SQLite numeric seq 索引候选值。
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : undefined;
}
/** 将 ISO、秒或毫秒时间归一化为毫秒时间戳。 */
function readTimestamp(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value < 1_000_000_000_000 ? value * 1000 : value;
    }
    // text 兼容 Gateway 的 ISO 和 numeric string。
    const text = readString(value);
    if (!text) {
        return 0;
    }
    // numeric 只用于纯数字时间，避免 Date.parse 的实现差异。
    const numeric = Number(text);
    if (/^\d+(?:\.\d+)?$/.test(text) && Number.isFinite(numeric)) {
        return numeric < 1_000_000_000_000 ? numeric * 1000 : numeric;
    }
    // parsed 解析 Gateway ISO timestamp。
    const parsed = Date.parse(text);
    return Number.isFinite(parsed) ? parsed : 0;
}
/** 从稳定前缀会话 ID 中派生 target ID。 */
function stripPrefix(value, prefixes) {
    for (const prefix of prefixes) {
        if (value.startsWith(prefix)) {
            return value.slice(prefix.length);
        }
    }
    return '';
}
/** 创建字段不完整的 Gateway entity 同步错误。 */
function invalidGatewayEntity(entity, fields) {
    return new IMError({
        code: 'INVALID_GATEWAY_ENTITY',
        message: `Gateway ${entity} is missing required identity fields: ${JSON.stringify(fields)}.`,
        source: 'sync',
        retryable: false,
    });
}
//# sourceMappingURL=domain-mappers.js.map