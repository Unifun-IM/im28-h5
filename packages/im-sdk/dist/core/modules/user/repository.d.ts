import type { User } from '../../core/types.js';
import type { DatabaseAdapter } from '../../db/database.js';
import { Repository } from '../../db/repository.js';
export declare class UserRepository extends Repository {
    constructor(database: DatabaseAdapter);
    upsert(user: User): Promise<void>;
    getByID(userID: string): Promise<User | null>;
    deleteByUserID(userID: string): Promise<void>;
}
//# sourceMappingURL=repository.d.ts.map