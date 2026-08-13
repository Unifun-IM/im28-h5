export const IM_SDK_PACKAGE = '@im28/im-sdk';
export const imSdkPackageInfo = {
    name: IM_SDK_PACKAGE,
    runtimeTargets: ['rn', 'web', 'desktop'],
};
export { createIMClient } from './core/client.js';
export { CONVERSATION_AUTO_DELETE_SECONDS, normalizeConversationAutoDeleteSeconds, } from './core/conversation-auto-delete.js';
export { createEventBus } from './core/events.js';
export { getSchemaVersion, getTargetSchemaVersion, runMigrations, SDK_MIGRATIONS, statement, } from './db/index.js';
export { IMError, toIMError } from './core/errors.js';
export { fail, ok } from './core/result.js';
export { ConversationRepository, CustomEmojiRepository, FriendshipRepository, GroupMemberRepository, GroupRepository, ILLUSTRATED_PRESET_EMOJIS, ILLUSTRATED_PRESET_EMOJI_PACK_ID, MessageRepository, UserRepository, assertMessageStatusTransition, canTransitionAttachmentTaskStatus, canTransitionMessageStatus, createIMComposerSubmissionPlan, findNextIMUnplayedIncomingAudioMessage, createAttachmentTask, decodePresetEmojiID, encodePresetEmojiID, findLatestUnreadMention, getIllustratedPresetEmoji, getIMAudioMessageIdentity, getIMInitialUnreadNavigation, getIMVisibleUnreadReadSeq, getIMPreviousMessageHistoryCursor, insertPresetEmojiAtSelection, isTerminalMessageStatus, isIMAudioMessagePlayedLocally, normalizeLocalPath, normalizeCustomEmojiID, normalizeCustomEmojiURL, normalizePresetEmojiEntities, normalizeMessageMentions, normalizeIMMessageLinkURL, projectPresetEmojiEntitiesToDisplayText, reconcilePresetEmojiEntitiesAfterTextChange, resolvePresetEmojiEntities, serializePresetEmojiEntities, shouldStageIMComposerMedia, splitIMMessageTextLinks, mergeIMMessageHistoryWindow, transitionAttachmentTask, trimPresetEmojiDocument, buildIM28GroupQRCodePayload, buildIM28GroupQRCodeURL, buildIM28UserQRCodePayload, buildIM28UserQRCodeURL, parseIM28QRCodeTarget, IM28_GROUP_QR_SOURCE, IM28_USER_QR_SOURCE, } from './modules/index.js';
export { createGatewayHTTPClient, mapGatewayCustomEmojiToCore, mapGatewayConversationToCore, mapGatewayMessageToCore, } from './transport/gateway-http/index.js';
export { createGatewayRealtimeClient, normalizeGatewayRealtimeEvents, parseGatewayRealtimePayload, } from './transport/gateway-ws/index.js';
export { setGatewayRequestLogging } from './openapi/request.js';
//# sourceMappingURL=index.js.map