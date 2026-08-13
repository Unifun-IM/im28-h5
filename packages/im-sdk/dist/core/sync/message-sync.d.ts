import type { WebIMMessageSync, WebIMMessageSyncDependencies } from './message-sync-types.js';
/** 保留既有 facade 类型导出路径。 */
export type { WebIMMessageSync, WebIMMessageSyncDependencies, WebIMPullMessageHistoryOptions, WebIMPullMessageHistoryResult, } from './message-sync-types.js';
/** 创建认证账号绑定的浏览器消息同步服务。 */
export declare function createWebIMMessageSync(dependencies: WebIMMessageSyncDependencies): WebIMMessageSync;
//# sourceMappingURL=message-sync.d.ts.map