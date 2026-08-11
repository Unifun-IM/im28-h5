export const IM_SDK_PACKAGE = '@im28/im-sdk';
export const imSdkPackageInfo = {
    name: IM_SDK_PACKAGE,
    runtimeTargets: ['rn', 'web', 'desktop'],
};
export { createIMClient } from './core/client.js';
export { createEventBus } from './core/events.js';
export { getSchemaVersion, getTargetSchemaVersion, runMigrations, SDK_MIGRATIONS, statement, } from './db/index.js';
export { IMError, toIMError } from './core/errors.js';
export { fail, ok } from './core/result.js';
export { ConversationRepository, CustomEmojiRepository, FriendshipRepository, GroupMemberRepository, GroupRepository, ILLUSTRATED_PRESET_EMOJIS, ILLUSTRATED_PRESET_EMOJI_PACK_ID, MessageRepository, UserRepository, assertMessageStatusTransition, canTransitionAttachmentTaskStatus, canTransitionMessageStatus, createAttachmentTask, decodePresetEmojiID, encodePresetEmojiID, getIllustratedPresetEmoji, insertPresetEmojiAtSelection, isTerminalMessageStatus, normalizeLocalPath, normalizeCustomEmojiID, normalizeCustomEmojiURL, normalizePresetEmojiEntities, projectPresetEmojiEntitiesToDisplayText, reconcilePresetEmojiEntitiesAfterTextChange, resolvePresetEmojiEntities, serializePresetEmojiEntities, transitionAttachmentTask, trimPresetEmojiDocument, } from './modules/index.js';
export { createGatewayHTTPClient, mapGatewayCustomEmojiToCore, mapGatewayConversationToCore, mapGatewayMessageToCore, } from './transport/gateway-http/index.js';
export { createGatewayRealtimeClient, normalizeGatewayRealtimeEvents, parseGatewayRealtimePayload, } from './transport/gateway-ws/index.js';
export { setGatewayRequestLogging } from './openapi/request.js';
//# sourceMappingURL=index.js.map