import type { Group, GroupMember } from '../../core/types.js';
import type { DatabaseAdapter } from '../../db/database.js';
import { Repository } from '../../db/repository.js';
export declare class GroupRepository extends Repository {
    constructor(database: DatabaseAdapter);
    upsert(group: Group): Promise<void>;
    list(): Promise<readonly Group[]>;
    replaceAll(groups: readonly Group[]): Promise<void>;
    getByID(groupID: string): Promise<Group | null>;
}
export declare class GroupMemberRepository extends Repository {
    constructor(database: DatabaseAdapter);
    replaceGroupMembers(groupID: string, members: readonly GroupMember[]): Promise<void>;
    listByGroupID(groupID: string): Promise<readonly GroupMember[]>;
    /** 按群和稳定用户 ID 读取单个成员快照，供共享只读投影复用。 */
    getByGroupAndUserID(groupID: string, userID: string): Promise<GroupMember | null>;
}
//# sourceMappingURL=repository.d.ts.map