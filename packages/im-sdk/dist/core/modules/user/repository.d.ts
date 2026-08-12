import type { User } from '../../core/types.js';
import type { DatabaseAdapter } from '../../db/database.js';
import { Repository } from '../../db/repository.js';
export declare class UserRepository extends Repository {
    /** 绑定当前账号数据库。 */
    constructor(database: DatabaseAdapter);
    /** 合并写入单个用户，缺失字段不得清空已有完整资料。 */
    upsert(user: User): Promise<void>;
    /** 原子合并写入一批用户，避免群成员资料出现半批更新。 */
    upsertMany(users: readonly User[]): Promise<void>;
    /** 按稳定身份读取单个用户。 */
    getByID(userID: string): Promise<User | null>;
    /** 一次读取多个稳定身份，供展示投影避免逐成员查询。 */
    getByIDs(userIDs: readonly string[]): Promise<readonly User[]>;
    /** 删除指定用户快照。 */
    deleteByUserID(userID: string): Promise<void>;
}
//# sourceMappingURL=repository.d.ts.map