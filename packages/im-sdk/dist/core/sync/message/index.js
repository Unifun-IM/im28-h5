/** 导出跨端共用的消息缓存、历史与发送 facade。 */
export { createIMMessageSync, createWebIMMessageSync, getWebIMCachedMessageHistory, } from './message-sync.js';
/** 导出当前账号消息搜索 facade。 */
export { createIMMessageSearchSync } from './message-search.js';
/** 导出自定义表情缓存与 mutation facade。 */
export { createIMCustomEmojiSync, createWebIMCustomEmojiSync } from './custom-emoji-sync.js';
/** 导出群聊 mention 发送能力。 */
export { sendWebIMMentionMessage } from './message-mention-send.js';
/** 导出跨端共用的消息群发 facade 与目标上限。 */
export { createIMMessageBroadcastSync, IM_BROADCAST_MAX_TARGETS, } from './message-broadcast.js';
/** 导出批量转发执行能力。 */
export { forwardWebIMMessages } from './message-forward.js';
/** 导出多目标转发 owner、目标上限与身份归一化能力。 */
export { forwardWebIMMessagesToTargets, IM_FORWARD_MAX_TARGETS, normalizeForwardConversationIDs, } from './message-forward-targets.js';
/** 导出消息转发能力判断。 */
export { canForwardWebIMMessage } from './message-forward-state.js';
/** 导出主动消息删除能力。 */
export { deleteWebIMMessages } from './message-delete.js';
/** 导出主动文本编辑能力与判断规则。 */
export { canEditWebIMTextMessage, editWebIMTextMessage, } from './message-edit.js';
/** 导出跨端共用的消息 mutation facade。 */
export { createIMMessageMutationSync } from './message-mutations.js';
/** 导出失败消息重试判断、已注册类型和输入契约。 */
export { WEB_IM_RETRYABLE_CONTENT_TYPES, canRetryWebIMMessage, } from './message-retry.js';
/** 导出与 RN 一致的媒体文件大小限制。 */
export { WEB_IM_FILE_MAX_BYTES, WEB_IM_IMAGE_MAX_BYTES, } from './message-media-send.js';
/** 导出语音时长上限。 */
export { WEB_IM_AUDIO_MAX_DURATION_SECONDS } from './message-audio-send.js';
/** 导出视频文件大小限制。 */
export { WEB_IM_VIDEO_MAX_BYTES } from './message-video-send.js';
//# sourceMappingURL=index.js.map