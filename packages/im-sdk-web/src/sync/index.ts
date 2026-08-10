/** 创建认证账号绑定的通话记录 cache/sync 服务。 */
export { createWebIMCallSync } from './call-sync.js';
/** 创建认证账号绑定的通讯录读取 service。 */
export { createWebIMContactSync } from './contact-sync.js';
/** 创建受认证账号约束的会话 cache/sync 服务。 */
export { createWebIMConversationSync } from './conversation-sync.js';
/** 创建 runtime 对页面公开的聚合同步入口。 */
export { createWebIMSync } from './web-im-sync.js';
/** 创建消息 cache/history/send 服务。 */
export { createWebIMMessageSync } from './message-sync.js';
/** 创建受认证账号约束的当前资料读取 service。 */
export { createWebIMProfileSync } from './profile-sync.js';
/** 创建 runtime 唯一 realtime 持久化队列。 */
export { createWebIMRealtimeSync } from './realtime-sync.js';
/** 导出通话记录 facade contract。 */
export type {
  WebIMCallAnswerStatus,
  WebIMCallListOptions,
  WebIMCallListResult,
  WebIMCallSync,
  WebIMCallSyncDependencies,
} from './call-sync.js';
/** 导出通讯录 facade contract。 */
export type {
  WebIMContact,
  WebIMContactListOptions,
  WebIMContactSync,
  WebIMContactSyncDependencies,
} from './contact-sync.js';
/** 导出页面与 runtime 共享的会话同步 contract。 */
export type {
  WebIMConversationSync,
  WebIMConversationSyncDependencies,
  WebIMConversationListItem,
  WebIMConversationSyncOptions,
} from './conversation-sync.js';
/** 导出消息同步 contract。 */
export type {
  WebIMMessageSync,
  WebIMMessageSyncDependencies,
  WebIMPullMessageHistoryOptions,
  WebIMSendTextMessageOptions,
} from './message-sync.js';
/** 导出当前账号资料 facade contract。 */
export type {
  WebIMProfileSync,
  WebIMProfileSyncDependencies,
  WebIMProfileUpdate,
} from './profile-sync.js';
/** 导出 realtime event 持久化 contract。 */
export type {
  WebIMRealtimeSync,
  WebIMRealtimeSyncDependencies,
} from './realtime-sync.js';
/** 导出聚合同步 facade contract。 */
export type { WebIMSync, WebIMSyncDependencies } from './web-im-sync.js';
