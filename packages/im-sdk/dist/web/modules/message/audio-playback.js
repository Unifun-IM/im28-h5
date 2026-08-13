/** RN 已发布的语音播放本地扩展字段。 */
const IM_AUDIO_PLAYED_LOCAL_EX_KEY = 'im28SoundMessagePlayed';
/** 返回消息可用于播放偏好的稳定身份，服务端 ID 优先。 */
export function getIMAudioMessageIdentity(message) {
    return message.serverMsgID?.trim() || message.clientMsgID.trim();
}
/** 判断消息 localEx 是否带有 RN 兼容的本地已播放标记。 */
export function isIMAudioMessagePlayedLocally(message) {
    if (!message.localEx?.trim())
        return false;
    try {
        /** parsed 只接受普通对象，损坏历史扩展按未播放处理。 */
        const parsed = JSON.parse(message.localEx);
        return Boolean(parsed &&
            typeof parsed === 'object' &&
            !Array.isArray(parsed) &&
            parsed[IM_AUDIO_PLAYED_LOCAL_EX_KEY] === true);
    }
    catch {
        return false;
    }
}
/** 按消息阅读顺序查找当前语音后的下一条未播放 incoming 语音。 */
export function findNextIMUnplayedIncomingAudioMessage(options) {
    /** currentID 拒绝空播放身份，避免从列表起点意外连播。 */
    const currentID = options.currentMessageID.trim();
    if (!currentID)
        return null;
    /** currentIndex 同时兼容客户端与服务端消息身份。 */
    const currentIndex = options.messages.findIndex(message => hasIMAudioMessageIdentity(message, currentID));
    if (currentIndex < 0)
        return null;
    for (const message of options.messages.slice(currentIndex + 1)) {
        /** messageID 用于拒绝无稳定身份的历史消息。 */
        const messageID = getIMAudioMessageIdentity(message);
        if (messageID &&
            message.contentType === 103 &&
            message.direction === 'incoming' &&
            !hasPlayedIMAudioIdentity(message, options.playedMessageIDs) &&
            !isIMAudioMessagePlayedLocally(message) &&
            options.isPlayable(message)) {
            return message;
        }
    }
    return null;
}
/** 判断指定身份是否属于消息的客户端或服务端 ID。 */
function hasIMAudioMessageIdentity(message, messageID) {
    return message.clientMsgID.trim() === messageID || message.serverMsgID?.trim() === messageID;
}
/** 判断任一稳定消息身份是否已存在于当前平台偏好。 */
function hasPlayedIMAudioIdentity(message, playedMessageIDs) {
    return playedMessageIDs.has(message.clientMsgID.trim()) ||
        Boolean(message.serverMsgID?.trim() && playedMessageIDs.has(message.serverMsgID.trim()));
}
//# sourceMappingURL=audio-playback.js.map