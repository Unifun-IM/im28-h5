import type { Friendship } from '../../core/types.js';
import type { DatabaseAdapter } from '../../db/database.js';
import { Repository } from '../../db/repository.js';
export declare class FriendshipRepository extends Repository {
    constructor(database: DatabaseAdapter);
    upsert(friendship: Friendship): Promise<void>;
    listFriends(): Promise<readonly Friendship[]>;
    /** 按稳定用户 ID 读取单条好友关系缓存。 */
    getByUserID(userID: string): Promise<Friendship | null>;
    /** 一次读取多个好友关系，供群成员展示避免逐成员查询。 */
    getByUserIDs(userIDs: readonly string[]): Promise<readonly Friendship[]>;
    replaceAll(friendships: readonly Friendship[]): Promise<void>;
    deleteByUserID(userID: string): Promise<void>;
}
//# sourceMappingURL=repository.d.ts.map