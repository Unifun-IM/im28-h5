/** 标识 H5 应用正在消费的浏览器 SDK facade。 */
export const IM28_WEB_SDK_PACKAGE = '@im28/im-sdk/web';
/** 复用共享 SDK 的浏览器安全 Repository、Gateway client 和错误模型。 */
export { ConversationRepository, IMError, MessageRepository, createGatewayHTTPClient, createGatewayRealtimeClient, createIMClient, mapGatewayConversationToCore, mapGatewayMessageToCore, normalizeGatewayRealtimeEvents, parseGatewayRealtimePayload, } from '@im28/im-sdk/core';
/** 导出认证账号绑定的会话 cache/sync service。 */
export { createWebIMCallSync, createWebIMBlacklistSync, createWebIMContactSync, createWebIMFriendApplicationSync, createWebIMGroupApplicationSync, createWebIMJoinedGroupSync, createWebIMPeerProfileSync, createWebIMConversationSync, createWebIMMessageSync, createWebIMProfileSync, createWebIMRealtimeSync, createWebIMSync, WEB_IM_FILE_MAX_BYTES, WEB_IM_IMAGE_MAX_BYTES, WEB_IM_AUDIO_MAX_DURATION_SECONDS, WEB_IM_VIDEO_MAX_BYTES, } from '../../sync/index.js';
/** 导出浏览器 Gateway runtime 配置、认证会话与 lifecycle 基础。 */
export { WebIMRuntimeError, createBrowserGatewayFetch, createWebIMAuthSessionStore, createWebIMDeviceIdentityStore, createWebIMPlatformTermsClient, createWebIMRuntime, createWebIMUserSettings, createWebIMClientVersion, isWebIMUnregisteredAccountError, parseWebIMRuntimeConfig, transitionWebIMRuntimeState, WEB_IM_PLATFORM_TERM_KEYS, } from './runtime/index.js';
/** 导出浏览器 OSS multipart 上传 adapter。 */
export { createBrowserOSSUploadPort } from './media/index.js';
/** 导出 H5 Web IM storage foundation。 */
export { createWebIMAccountDatabaseLifecycle, createAccountDatabaseName, createBrowserSqlJsDatabaseWorker, createAccountDatabaseLeaseManager, createAccountDatabaseLockName, createIndexedDBSQLiteBinaryStore, createSqlJsIndexedDBDatabaseAdapter, createWorkerDatabaseAdapter, createWorkerDatabaseRuntime, WorkerDatabaseError, AccountDatabaseLeaseError, } from './storage/index.js';
//# sourceMappingURL=index.js.map