import type { Friendship } from '../../core/types.js';
import type { DatabaseAdapter } from '../../db/database.js';
import { Repository } from '../../db/repository.js';
export declare class FriendshipRepository extends Repository {
    constructor(database: DatabaseAdapter);
    upsert(friendship: Friendship): Promise<void>;
    listFriends(): Promise<readonly Friendship[]>;
    replaceAll(friendships: readonly Friendship[]): Promise<void>;
    deleteByUserID(userID: string): Promise<void>;
}
//# sourceMappingURL=repository.d.ts.map