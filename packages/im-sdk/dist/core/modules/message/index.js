export { MessageRepository } from './repository.js';
/** 导出跨端一致的语音本地已播放与自动连播选择规则。 */
export { findNextIMUnplayedIncomingAudioMessage, getIMAudioMessageIdentity, isIMAudioMessagePlayedLocally, } from './audio-playback.js';
/** 导出跨端一致的初始未读边界规则。 */
export { getIMInitialUnreadNavigation, getIMVisibleUnreadReadSeq, } from './initial-unread-navigation.js';
/** 导出跨端一致的聊天历史游标与窗口合并规则。 */
export { getIMPreviousMessageHistoryCursor, mergeIMMessageHistoryWindow, } from './history-pagination.js';
/** 导出跨端一致的历史通话消息解析与 RN 文案。 */
export { formatIMCallMessageText, parseIMCallMessagePresentation, } from './call-message.js';
/** 导出跨端一致的群简介与发言频率系统文案解析。 */
export { parseIMGroupSystemMessagePresentation } from './group-system-message.js';
/** 导出好友关系建立通知的跨端类型与文案。 */
export { IM_FRIEND_ADDED_MESSAGE_TEXT, IM_FRIEND_ADDED_MESSAGE_TYPE, getIMFriendAddedMessageText, } from './friend-added-message.js';
/** 导出跨端 Composer 附件与文本的提交顺序。 */
export { createIMComposerSubmissionPlan, shouldStageIMComposerMedia, } from './composer-submission.js';
/** 导出未读 mention 的共享 SQLite 查询。 */
export { findLatestUnreadMention } from './unread-mention.js';
/** 导出消息提及归一化规则。 */
export { normalizeMessageMentions } from './mention.js';
export { assertMessageStatusTransition, canTransitionMessageStatus, isTerminalMessageStatus } from './status.js';
export { ILLUSTRATED_PRESET_EMOJIS, ILLUSTRATED_PRESET_EMOJI_PACK_ID, getIllustratedPresetEmoji, } from './illustrated-preset-emojis.js';
export { decodePresetEmojiID, encodePresetEmojiID, insertPresetEmojiAtSelection, normalizePresetEmojiEntities, projectPresetEmojiEntitiesToDisplayText, reconcilePresetEmojiEntitiesAfterTextChange, resolvePresetEmojiEntities, serializePresetEmojiEntities, trimPresetEmojiDocument, } from './preset-emoji.js';
/** 导出跨端一致的消息正文链接识别与打开地址规范化。 */
export { normalizeIMMessageLinkURL, splitIMMessageTextLinks, } from './text-link.js';
//# sourceMappingURL=index.js.map