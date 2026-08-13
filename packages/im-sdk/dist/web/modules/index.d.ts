export { ConversationRepository } from './conversation/index.js';
export type { ConversationListOptions } from './conversation/index.js';
export { CustomEmojiRepository, normalizeCustomEmojiID, normalizeCustomEmojiURL, } from './custom-emoji/index.js';
export type { CustomEmoji } from './custom-emoji/index.js';
export { FriendshipRepository } from './friendship/index.js';
export { GroupMemberRepository, GroupRepository } from './group/index.js';
export { UserRepository } from './user/index.js';
export { ILLUSTRATED_PRESET_EMOJIS, ILLUSTRATED_PRESET_EMOJI_PACK_ID, MessageRepository, assertMessageStatusTransition, canTransitionMessageStatus, createIMComposerSubmissionPlan, decodePresetEmojiID, encodePresetEmojiID, findLatestUnreadMention, getIllustratedPresetEmoji, insertPresetEmojiAtSelection, isTerminalMessageStatus, normalizePresetEmojiEntities, normalizeMessageMentions, normalizeIMMessageLinkURL, projectPresetEmojiEntitiesToDisplayText, reconcilePresetEmojiEntitiesAfterTextChange, resolvePresetEmojiEntities, serializePresetEmojiEntities, shouldStageIMComposerMedia, splitIMMessageTextLinks, trimPresetEmojiDocument, } from './message/index.js';
export type { LatestUnreadMentionOptions, MessageHistoryOptions, MessageSearchOptions, PresetEmojiDescriptor, PresetEmojiDocument, PresetEmojiDocumentEditResult, PresetEmojiEntity, PresetEmojiSelection, SerializedPresetEmojiEntity, IMComposerSubmissionInput, IMComposerSubmissionPlan, IMComposerSubmissionStep, IMMessageTextLinkSegment, } from './message/index.js';
export { canTransitionAttachmentTaskStatus, createAttachmentTask, normalizeLocalPath, transitionAttachmentTask, } from './media/index.js';
export { IM28_GROUP_QR_SOURCE, IM28_USER_QR_SOURCE, buildIM28GroupQRCodePayload, buildIM28GroupQRCodeURL, buildIM28UserQRCodePayload, buildIM28UserQRCodeURL, parseIM28QRCodeTarget, } from './qr-code/index.js';
export type { IM28GroupQRCodeTarget, IM28QRCodeTarget, IM28UserQRCodeTarget, } from './qr-code/index.js';
export type { AttachmentKind, AttachmentTask, AttachmentTaskStatus, CreateAttachmentTaskParams, } from './media/index.js';
//# sourceMappingURL=index.d.ts.map