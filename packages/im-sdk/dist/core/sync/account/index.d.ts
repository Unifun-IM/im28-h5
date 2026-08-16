/** 导出当前账号资料与联系方式 facade。 */
export { createIMProfileSync, createWebIMProfileSync } from './profile-sync.js';
/** 导出当前账号资料与联系方式契约。 */
export type { IMProfileSync, IMProfileSyncDependencies, WebIMProfileContactInput, WebIMProfileContactKind, WebIMProfileContactResult, WebIMProfileSync, WebIMProfileSyncDependencies, WebIMProfileUpdate, } from './profile-sync.js';
/** 导出跨端共用的用户在线状态 facade。 */
export { createIMUserPresenceSync } from './user-presence.js';
/** 导出跨端共用的用户在线状态契约。 */
export type { IMUserPresence, IMUserPresenceListener, IMUserPresenceObservation, IMUserPresenceSync, IMUserPresenceSyncDependencies, } from './user-presence.js';
/** 导出用户在线状态协议归一化规则。 */
export { normalizeIMUserPresence, normalizeIMUserPresenceIDs, normalizeIMUserPresencePayload, } from './user-presence-normalization.js';
//# sourceMappingURL=index.d.ts.map