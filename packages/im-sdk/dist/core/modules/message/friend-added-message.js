/** 好友关系建立通知的稳定消息类型。 */
export const IM_FRIEND_ADDED_MESSAGE_TYPE = 1201;
/** RN 已发布的好友关系建立通知文案。 */
export const IM_FRIEND_ADDED_MESSAGE_TEXT = '你们已经成为好友，可以开始聊天了';
/** 将消息类型投影为跨端一致的好友关系通知文案。 */
export function getIMFriendAddedMessageText(contentType) {
    return contentType === IM_FRIEND_ADDED_MESSAGE_TYPE
        ? IM_FRIEND_ADDED_MESSAGE_TEXT
        : null;
}
//# sourceMappingURL=friend-added-message.js.map