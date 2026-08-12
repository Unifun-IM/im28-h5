import { type GatewayGroup, type Group, type GroupRepository } from '@im28/im-sdk/core';
import type { WebIMJoinedGroup } from './joined-group-sync.js';
/** 将 Gateway group 转成共享 Group Repository 记录。 */
export declare function mapGatewayGroupToCore(group: GatewayGroup, order: number): Group | null;
/** 从共享 Group cache 恢复页面模型并按服务端顺序排序。 */
export declare function readJoinedGroupCache(repository: GroupRepository, currentUserID: string): Promise<readonly WebIMJoinedGroup[]>;
/** 将缓存记录映射为稳定 Web 群模型。 */
export declare function mapCoreGroupToWeb(group: Group, currentUserID: string): WebIMJoinedGroup;
//# sourceMappingURL=joined-group-mappers.d.ts.map