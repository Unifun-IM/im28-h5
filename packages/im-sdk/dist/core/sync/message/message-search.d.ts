import { type Message, type MessageSearchOptions } from '@im28/im-sdk/core';
import { type WebIMSyncContextDependencies } from '../sync-context.js';
/** RN、Web、Desktop 共用的当前账号消息搜索入口。 */
export interface IMMessageSearchSync {
    search(options: MessageSearchOptions): Promise<readonly Message[]>;
}
/** 消息搜索只依赖认证账号与已迁移数据库。 */
export interface IMMessageSearchSyncDependencies extends WebIMSyncContextDependencies {
}
/** 创建绑定当前 runtime 账号数据库的中性消息搜索 facade。 */
export declare function createIMMessageSearchSync(dependencies: IMMessageSearchSyncDependencies): IMMessageSearchSync;
//# sourceMappingURL=message-search.d.ts.map