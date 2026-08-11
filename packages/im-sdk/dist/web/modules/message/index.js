export { MessageRepository } from './repository.js';
/** 导出未读 mention 的共享 SQLite 查询。 */
export { findLatestUnreadMention } from './unread-mention.js';
/** 导出消息提及归一化规则。 */
export { normalizeMessageMentions } from './mention.js';
export { assertMessageStatusTransition, canTransitionMessageStatus, isTerminalMessageStatus } from './status.js';
export { ILLUSTRATED_PRESET_EMOJIS, ILLUSTRATED_PRESET_EMOJI_PACK_ID, getIllustratedPresetEmoji, } from './illustrated-preset-emojis.js';
export { decodePresetEmojiID, encodePresetEmojiID, insertPresetEmojiAtSelection, normalizePresetEmojiEntities, projectPresetEmojiEntitiesToDisplayText, reconcilePresetEmojiEntitiesAfterTextChange, resolvePresetEmojiEntities, serializePresetEmojiEntities, trimPresetEmojiDocument, } from './preset-emoji.js';
//# sourceMappingURL=index.js.map