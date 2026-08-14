import { formatIMUserDisplayName, normalizeIMUserNickname, } from '../modules/user/display-name.js';
import { executeWebIMMessageSend, } from './message-send-state.js';
import { createWebIMSyncError } from './sync-context.js';
/** 校验名片身份并复用统一 optimistic、Gateway 与 SQLite 状态机。 */
export async function sendWebIMCardMessage(context, options, dependencies) {
    /** body 是本地 optimistic payload 与 Gateway 请求的唯一规范结构。 */
    const body = createWebIMCardBody(options.card);
    return executeWebIMMessageSend(context, {
        conversationID: options.conversationID,
        contentType: 108,
        payload: body,
    }, body, dependencies, undefined, undefined, options.onSending ? { onSending: options.onSending } : undefined);
}
/** 从平台中立名片构造 Gateway 规范 body，并冻结展示快照。 */
export function createWebIMCardBody(card) {
    if (card.type === 'user') {
        /** userID 是点击卡片进入资料页的稳定身份。 */
        const userID = card.userID.trim();
        if (!userID) {
            throw createWebIMSyncError('INVALID_USER_CARD_ID', 'User card sending requires a user ID.');
        }
        return {
            card: {
                type: 'user',
                user: {
                    user_id: userID,
                    nickname: normalizeIMUserNickname(card.nickname, userID) ||
                        formatIMUserDisplayName(userID),
                    avatar_url: card.avatarURL?.trim() ?? '',
                },
            },
        };
    }
    /** groupID 是点击卡片进入群资料的稳定身份。 */
    const groupID = card.groupID.trim();
    if (!groupID) {
        throw createWebIMSyncError('INVALID_GROUP_CARD_ID', 'Group card sending requires a group ID.');
    }
    return {
        card: {
            type: 'group',
            group: {
                group_id: groupID,
                title: card.groupName.trim() || groupID,
                avatar_url: card.avatarURL?.trim() ?? '',
            },
        },
    };
}
/** 从持久化 payload 严格恢复可重试的用户名片或群名片 body。 */
export function normalizeWebIMCardBody(payload) {
    if (!isRecord(payload) || !isRecord(payload.card)) {
        throw createWebIMSyncError('INVALID_RETRY_MESSAGE_PAYLOAD', 'The cached card message cannot be reconstructed.');
    }
    /** card 保存 Gateway type108 的规范结构。 */
    const card = payload.card;
    if (card.type === 'user' && isRecord(card.user)) {
        return createWebIMCardBody({
            type: 'user',
            userID: readString(card.user.user_id),
            nickname: readString(card.user.nickname),
            avatarURL: readString(card.user.avatar_url),
        });
    }
    if (card.type === 'group' && isRecord(card.group)) {
        return createWebIMCardBody({
            type: 'group',
            groupID: readString(card.group.group_id),
            groupName: readString(card.group.title),
            avatarURL: readString(card.group.avatar_url),
        });
    }
    throw createWebIMSyncError('INVALID_RETRY_MESSAGE_PAYLOAD', 'The cached card message cannot be reconstructed.');
}
/** 判断未知值是否为可安全读取字段的普通对象。 */
function isRecord(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
/** 从未知字段读取原始字符串，不执行隐式类型转换。 */
function readString(value) {
    return typeof value === 'string' ? value : '';
}
//# sourceMappingURL=message-card-send.js.map