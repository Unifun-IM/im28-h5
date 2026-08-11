/** 创建认证账号绑定的通话记录 cache/sync 服务。 */
export { createWebIMCallSync } from './call-sync.js';
/** 创建认证账号绑定的黑名单读写 service。 */
export { createWebIMBlacklistSync } from './blacklist-sync.js';
/** 创建认证账号绑定的通讯录读取 service。 */
export { createWebIMContactSync } from './contact-sync.js';
/** 创建认证账号绑定的好友申请 service。 */
export { createWebIMFriendApplicationSync } from './friend-application-sync.js';
/** 创建认证账号绑定的群申请审核 service。 */
export { createWebIMGroupApplicationSync } from './group-application-sync.js';
/** 创建认证账号绑定的 cache-first 我的群聊 service。 */
export { createWebIMJoinedGroupSync } from './joined-group-sync.js';
/** 创建认证账号绑定的联系人资料与关系 action service。 */
export { createWebIMPeerProfileSync } from './peer-profile-sync.js';
/** 创建受认证账号约束的会话 cache/sync 服务。 */
export { createWebIMConversationSync } from './conversation-sync.js';
/** 创建认证账号绑定的自定义表情 cache/sync 服务。 */
export { createWebIMCustomEmojiSync } from './custom-emoji-sync.js';
/** 创建消息 cache/history/send 服务。 */
export { createWebIMMessageSync } from './message-sync.js';
/** 导出共享批量转发执行函数。 */
export { forwardWebIMMessages } from './message-forward.js';
/** 导出共享转发来源与隐藏发送人能力判断。 */
export { canForwardWebIMMessage } from './message-forward-state.js';
/** 导出共享主动消息删除执行函数。 */
export { deleteWebIMMessages } from './message-delete.js';
/** 导出共享主动文本编辑执行函数与能力判断。 */
export { canEditWebIMTextMessage, editWebIMTextMessage, } from './message-edit.js';
/** 导出 shared 失败消息重试能力判断。 */
export { WEB_IM_RETRYABLE_CONTENT_TYPES, canRetryWebIMMessage, } from './message-retry.js';
/** 创建受认证账号约束的当前资料读取 service。 */
export { createWebIMProfileSync } from './profile-sync.js';
/** 创建 runtime 唯一 realtime 持久化队列。 */
export { createWebIMRealtimeSync } from './realtime-sync.js';
/** 导出通话记录 facade contract。 */
export type { WebIMCallAnswerStatus, WebIMCallListOptions, WebIMCallListResult, WebIMCallSync, WebIMCallSyncDependencies, } from './call-sync.js';
/** 导出黑名单 facade contract。 */
export type { WebIMBlacklistListOptions, WebIMBlacklistSync, WebIMBlacklistSyncDependencies, WebIMBlacklistUser, } from './blacklist-sync.js';
/** 导出通讯录 facade contract。 */
export type { WebIMContact, WebIMContactListOptions, WebIMContactSearchUser, WebIMContactSync, WebIMContactSyncDependencies, } from './contact-sync.js';
/** 导出好友申请 facade contract。 */
export type { WebIMFriendApplication, WebIMFriendApplicationDirection, WebIMFriendApplicationListOptions, WebIMFriendApplicationSync, WebIMFriendApplicationSyncDependencies, } from './friend-application-sync.js';
/** 导出群申请审核 facade contract。 */
export type { WebIMGroupApplication, WebIMGroupApplicationListOptions, WebIMGroupApplicationSync, WebIMGroupApplicationSyncDependencies, WebIMGroupApplicationType, } from './group-application-sync.js';
/** 导出我的群聊 facade contract。 */
export type { WebIMJoinedGroup, WebIMJoinedGroupRole, WebIMJoinedGroupStatus, WebIMJoinedGroupSync, WebIMJoinedGroupSyncDependencies, WebIMJoinedGroupSyncOptions, } from './joined-group-sync.js';
/** 导出联系人资料 facade contract。 */
export type { WebIMPeerProfile, WebIMPeerProfileRelationship, WebIMPeerProfileSync, WebIMPeerProfileSyncDependencies, } from './peer-profile-sync.js';
/** 导出页面与 runtime 共享的会话同步 contract。 */
export type { WebIMConversationSync, WebIMConversationSyncDependencies, WebIMConversationListItem, WebIMConversationSyncOptions, } from './conversation-sync.js';
/** 导出自定义表情同步 contract。 */
export type { WebIMCustomEmojiSync, WebIMCustomEmojiSyncDependencies, } from './custom-emoji-sync.js';
/** 导出消息同步 contract。 */
export type { WebIMMessageSync, WebIMMessageSyncDependencies, WebIMPullMessageHistoryOptions, } from './message-sync.js';
/** 导出文本发送 contract。 */
export type { WebIMSendTextMessageOptions } from './message-text-send.js';
/** 导出批量转发 facade 与逐项结果 contract。 */
export type { WebIMForwardCommentResult, WebIMForwardItemResult, WebIMForwardMessagesDependencies, WebIMForwardMessagesOptions, WebIMForwardMessagesResult, } from './message-forward.js';
/** 导出主动消息删除 facade 与逐项结果 contract。 */
export type { WebIMDeleteMessageItemResult, WebIMDeleteMessagesDependencies, WebIMDeleteMessagesOptions, WebIMDeleteMessagesResult, WebIMMessageDeleteScope, } from './message-delete.js';
/** 导出主动文本编辑 facade contract。 */
export type { WebIMEditTextMessageDependencies, WebIMEditTextMessageOptions, } from './message-edit.js';
/** 导出 type114 引用发送 contract。 */
export type { WebIMSendQuoteMessageOptions } from './message-quote-send.js';
/** 导出失败消息重试 facade 参数。 */
export type { WebIMRetryMessageOptions } from './message-retry.js';
/** 导出 type 115 自定义表情发送 contract。 */
export type { WebIMSendCustomEmojiMessageOptions } from './message-custom-emoji-send.js';
/** 导出跨 runtime 媒体上传端口与消息发送 contract。 */
export type { IMMediaUploadInput, IMMediaUploadPort, IMMediaUploadResult, WebIMSendFileMessageOptions, WebIMSendImageMessageOptions, } from './message-media-send.js';
/** 导出跨 runtime 语音发送 contract。 */
export type { WebIMSendAudioMessageOptions } from './message-audio-send.js';
/** 导出与 RN 一致的语音时长上限。 */
export { WEB_IM_AUDIO_MAX_DURATION_SECONDS } from './message-audio-send.js';
/** 导出跨 runtime 一致的媒体文件大小限制。 */
export { WEB_IM_FILE_MAX_BYTES, WEB_IM_IMAGE_MAX_BYTES, } from './message-media-send.js';
/** 导出跨 runtime 视频发送 contract。 */
export type { WebIMSendVideoMessageOptions } from './message-video-send.js';
/** 导出与 RN 一致的视频文件大小限制。 */
export { WEB_IM_VIDEO_MAX_BYTES } from './message-video-send.js';
/** 导出当前账号资料 facade contract。 */
export type { WebIMProfileSync, WebIMProfileSyncDependencies, WebIMProfileUpdate, } from './profile-sync.js';
/** 导出 realtime event 持久化 contract。 */
export type { WebIMRealtimeSync, WebIMRealtimeSyncDependencies, } from './realtime-sync.js';
//# sourceMappingURL=index.d.ts.map