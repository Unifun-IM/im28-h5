import type { Conversation, Group, GroupMember } from '../../core/types.js';
import type { DatabaseAdapter } from '../../db/database.js';
import { Repository } from '../../db/repository.js';
export declare class GroupRepository extends Repository {
    constructor(database: DatabaseAdapter);
    upsert(group: Group): Promise<void>;
    list(): Promise<readonly Group[]>;
    replaceAll(groups: readonly Group[]): Promise<void>;
    getByID(groupID: string): Promise<Group | null>;
    /** 原子保存新建群与服务端返回的真实群会话，避免页面看到半完成创建结果。 */
    applyCreation(group: Group, conversation: Conversation): Promise<void>;
    /** 原子收敛成员移除后的群资料和成员行，避免跨表半成功。 */
    applyMemberRemoval(group: Group, removedUserIDs: readonly string[]): Promise<void>;
    /** 用权威全量成员快照原子替换成员行并校准群人数。 */
    replaceMemberSnapshot(group: Group, members: readonly GroupMember[]): Promise<void>;
    /** 原子写回角色变更后的群资料和受影响成员，避免跨表出现半成功。 */
    applyMemberRoleChanges(group: Group, members: readonly GroupMember[]): Promise<void>;
    /** 原子删除群生命周期结束后的群、成员、会话、消息与消息附件缓存。 */
    removeLifecycleState(groupID: string): Promise<readonly string[]>;
}
export declare class GroupMemberRepository extends Repository {
    constructor(database: DatabaseAdapter);
    replaceGroupMembers(groupID: string, members: readonly GroupMember[]): Promise<void>;
    listByGroupID(groupID: string): Promise<readonly GroupMember[]>;
    /** 按群和稳定用户 ID 读取单个成员快照，供共享只读投影复用。 */
    getByGroupAndUserID(groupID: string, userID: string): Promise<GroupMember | null>;
    /** 原子写回单个群成员，避免局部 mutation 覆盖同群其他成员。 */
    upsert(member: GroupMember): Promise<void>;
}
//# sourceMappingURL=repository.d.ts.map