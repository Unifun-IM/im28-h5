import { type DatabaseAdapter, type Message, type MessageHistoryOptions } from '@im28/im-sdk/core';
import type { WebIMMessageSync, WebIMMessageSyncDependencies } from './message-sync-types.js';
/** 保留既有 facade 类型导出路径。 */
export type { WebIMMessageSync, WebIMMessageSyncDependencies, WebIMPullMessageHistoryOptions, WebIMPullMessageHistoryResult, } from './message-sync-types.js';
/** 从指定账号数据库读取 cache-only 历史窗口，不触发 Gateway 或写入。 */
export declare function getWebIMCachedMessageHistory(database: DatabaseAdapter, options: MessageHistoryOptions): Promise<readonly Message[]>;
/** 创建认证账号绑定的浏览器消息同步服务。 */
export declare function createWebIMMessageSync(dependencies: WebIMMessageSyncDependencies): WebIMMessageSync;
//# sourceMappingURL=message-sync.d.ts.map