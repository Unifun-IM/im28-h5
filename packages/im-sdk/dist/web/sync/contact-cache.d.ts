import { type DatabaseAdapter, type GatewayFriend } from '@im28/im-sdk/core';
/** 完整好友分页成功后替换关系快照，并更新可复用的公开用户资料。 */
export declare function replaceWebIMContactCache(database: DatabaseAdapter, friends: readonly GatewayFriend[]): Promise<void>;
//# sourceMappingURL=contact-cache.d.ts.map