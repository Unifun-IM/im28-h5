import type { DatabaseAdapter, GatewayCall } from '@im28/im-sdk/core';
import type { WebIMCallListOptions, WebIMCallListResult } from './call-sync.js';
/** 确保 Web app-owned 通话缓存表和索引存在。 */
export declare function ensureCallSchema(database: DatabaseAdapter): Promise<void>;
/** 用完整远端 snapshot 原子替换本地通话记录。 */
export declare function replaceCachedCalls(database: DatabaseAdapter, calls: readonly GatewayCall[]): Promise<void>;
/** 删除服务端已确认隐藏的本地通话记录。 */
export declare function removeCachedCalls(database: DatabaseAdapter, callIDs: readonly string[]): Promise<void>;
/** 查询缓存列表并复用同一筛选条件统计总数。 */
export declare function queryCachedCalls(database: DatabaseAdapter, options: WebIMCallListOptions): Promise<WebIMCallListResult>;
/** 按稳定服务端 ID 读取单条缓存通话记录。 */
export declare function queryCachedCall(database: DatabaseAdapter, callID: string): Promise<GatewayCall | null>;
/** 写入单条远端已确认或详情补齐后的通话记录。 */
export declare function saveCachedCall(database: DatabaseAdapter, call: GatewayCall): Promise<void>;
/** 在一个事务内写入同批实时或平台补齐后的通话记录。 */
export declare function saveCachedCalls(database: DatabaseAdapter, calls: readonly GatewayCall[]): Promise<void>;
//# sourceMappingURL=call-record-store.d.ts.map