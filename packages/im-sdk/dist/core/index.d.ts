export declare const IM_SDK_PACKAGE: "@im28/im-sdk";
export type IMRuntimeTarget = 'rn' | 'web' | 'desktop';
export interface IMSdkPackageInfo {
    readonly name: typeof IM_SDK_PACKAGE;
    readonly runtimeTargets: readonly IMRuntimeTarget[];
}
export declare const imSdkPackageInfo: IMSdkPackageInfo;
export { createIMClient } from './core/client.js';
export { createEventBus } from './core/events.js';
export { getSchemaVersion, getTargetSchemaVersion, runMigrations, SDK_MIGRATIONS, statement, } from './db/index.js';
export { IMError, toIMError } from './core/errors.js';
export { fail, ok } from './core/result.js';
export { ConversationRepository, FriendshipRepository, GroupMemberRepository, GroupRepository, MessageRepository, UserRepository, assertMessageStatusTransition, canTransitionAttachmentTaskStatus, canTransitionMessageStatus, createAttachmentTask, isTerminalMessageStatus, normalizeLocalPath, transitionAttachmentTask, } from './modules/index.js';
export { createGatewayHTTPClient, mapGatewayConversationToCore, mapGatewayMessageToCore, } from './transport/gateway-http/index.js';
export { createGatewayRealtimeClient, normalizeGatewayRealtimeEvents, parseGatewayRealtimePayload, } from './transport/gateway-ws/index.js';
export { setGatewayRequestLogging } from './openapi/request.js';
export type * from './transport/gateway-http/index.js';
export type * from './transport/gateway-ws/index.js';
export type { IMClient, IMClientOptions } from './core/client.js';
export type { IMEventBus, IMEventEmitter, IMEventHandler, IMEventMap, IMEventName, Unsubscribe, } from './core/events.js';
export type { DatabaseAdapter, DatabaseExecuteResult, DatabaseExecutor, DatabaseMigration, DatabaseParams, DatabaseRow, DatabaseStatement, DatabaseTransaction, DatabaseValue, } from './db/index.js';
export type { AttachmentKind, AttachmentTask, AttachmentTaskStatus, ConversationListOptions, CreateAttachmentTaskParams, MessageHistoryOptions, } from './modules/index.js';
export type { FriendApplicationListParams, ChangeGroupMuteParams, CreateGroupParams, GroupApplicationListParams, GroupMemberListParams, IMTransport, MessageHistoryParams, MessageHistoryResult, SendFileMessageParams, SendImageMessageParams, SendSoundMessageParams, SetConversationDraftParams, SearchGroupMembersParams, OperateGroupMembersParams, UpdateGroupInfoParams, SendTextMessageParams, SendVideoMessageParams, TransportInitParams, } from './transport/types.js';
export type { IMErrorOptions, IMErrorSource } from './core/errors.js';
export type { IMFailure, IMResult, IMSuccess } from './core/result.js';
export type { Attachment, ConnectionState, Conversation, ConversationType, FriendApplication, Friendship, Group, GroupApplication, GroupMember, IMClientConfig, IMProxyConfig, LoginParams, Message, MessageDirection, MessageStatus, SessionState, User, } from './core/types.js';
//# sourceMappingURL=index.d.ts.map