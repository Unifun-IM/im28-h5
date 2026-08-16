import { type DatabaseAdapter, type Message, type MessageHistoryOptions } from '@im28/im-sdk/core';
import type { WebIMMessageSync, WebIMMessageSyncDependencies } from './message-sync-types.js';
/** 保留既有 facade 类型导出路径。 */
export type { WebIMMessageSync, WebIMMessageSyncDependencies, WebIMPullMessageHistoryOptions, WebIMPullMessageHistoryResult, } from './message-sync-types.js';
/** 从指定账号数据库读取 cache-only 历史窗口，不触发 Gateway 或写入。 */
export declare function getWebIMCachedMessageHistory(database: DatabaseAdapter, options: MessageHistoryOptions): Promise<readonly Message[]>;
/** 创建认证账号绑定的跨端消息同步服务。 */
export declare function createIMMessageSync(dependencies: IMMessageSyncDependencies): IMMessageSync;
/** 平台中立的消息同步契约。 */
export type IMMessageSync = WebIMMessageSync;
/** 平台中立的消息同步依赖。 */
export type IMMessageSyncDependencies = WebIMMessageSyncDependencies;
/** 兼容已发布的 Web 命名；实现与 createIMMessageSync 相同。 */
export declare const createWebIMMessageSync: typeof createIMMessageSync;
//# sourceMappingURL=message-sync.d.ts.map