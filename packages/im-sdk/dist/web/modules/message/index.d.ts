export { MessageRepository } from './repository.js';
/** 导出跨端 Composer 附件与文本的提交顺序。 */
export { createIMComposerSubmissionPlan, shouldStageIMComposerMedia, } from './composer-submission.js';
/** 导出 Composer 提交计划的稳定契约。 */
export type { IMComposerSubmissionInput, IMComposerSubmissionPlan, IMComposerSubmissionStep, } from './composer-submission.js';
/** 导出未读 mention 的共享 SQLite 查询。 */
export { findLatestUnreadMention } from './unread-mention.js';
/** 导出消息提及归一化规则。 */
export { normalizeMessageMentions } from './mention.js';
export { assertMessageStatusTransition, canTransitionMessageStatus, isTerminalMessageStatus } from './status.js';
export { ILLUSTRATED_PRESET_EMOJIS, ILLUSTRATED_PRESET_EMOJI_PACK_ID, getIllustratedPresetEmoji, } from './illustrated-preset-emojis.js';
export { decodePresetEmojiID, encodePresetEmojiID, insertPresetEmojiAtSelection, normalizePresetEmojiEntities, projectPresetEmojiEntitiesToDisplayText, reconcilePresetEmojiEntitiesAfterTextChange, resolvePresetEmojiEntities, serializePresetEmojiEntities, trimPresetEmojiDocument, } from './preset-emoji.js';
export type { PresetEmojiDescriptor, PresetEmojiDocument, PresetEmojiDocumentEditResult, PresetEmojiEntity, PresetEmojiSelection, SerializedPresetEmojiEntity, } from './preset-emoji-types.js';
export type { MessageHistoryOptions, MessageSearchOptions } from './repository.js';
/** 导出未读 mention 查询边界。 */
export type { LatestUnreadMentionOptions } from './unread-mention.js';
//# sourceMappingURL=index.d.ts.map