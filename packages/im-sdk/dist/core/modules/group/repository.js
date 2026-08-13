import { statement } from '../../db/database.js';
import { Repository } from '../../db/repository.js';
import { parseJsonColumn, readOptionalNumber, readOptionalString, readRequiredString } from '../../db/row.js';
import { createConversationUpsertStatement } from '../conversation/repository.js';
export class GroupRepository extends Repository {
    constructor(database) {
        super(database);
    }
    async upsert(group) {
        await this.execute(statement(`INSERT OR REPLACE INTO groups (
          group_id,
          name,
          face_url,
          member_count,
          updated_at,
          raw_json
        ) VALUES (?, ?, ?, ?, ?, ?)`, [
            group.groupID,
            group.name,
            group.faceURL ?? null,
            group.memberCount ?? null,
            Date.now(),
            JSON.stringify(group.payload ?? group),
        ]));
    }
    async list() {
        const rows = await this.query(statement('SELECT * FROM groups ORDER BY updated_at DESC'));
        return rows.map(mapGroupRow);
    }
    async replaceAll(groups) {
        await this.transaction(async (tx) => {
            await tx.execute(statement('DELETE FROM groups'));
            await Promise.all(groups.map(group => tx.execute(statement(`INSERT OR REPLACE INTO groups (
                group_id,
                name,
                face_url,
                member_count,
                updated_at,
                raw_json
              ) VALUES (?, ?, ?, ?, ?, ?)`, [
                group.groupID,
                group.name,
                group.faceURL ?? null,
                group.memberCount ?? null,
                Date.now(),
                JSON.stringify(group.payload ?? group),
            ]))));
        });
    }
    async getByID(groupID) {
        const rows = await this.query(statement('SELECT * FROM groups WHERE group_id = ?', [groupID]));
        return rows[0] ? mapGroupRow(rows[0]) : null;
    }
    /** 原子保存新建群与服务端返回的真实群会话，避免页面看到半完成创建结果。 */
    async applyCreation(group, conversation) {
        if (conversation.type !== 'group' || conversation.targetID !== group.groupID) {
            throw new Error('Group creation transaction requires a matching group conversation.');
        }
        await this.transaction(async (tx) => {
            await tx.execute(createGroupUpsertStatement(group));
            await tx.execute(createConversationUpsertStatement(conversation));
        });
    }
    /** 原子收敛成员移除后的群资料和成员行，避免跨表半成功。 */
    async applyMemberRemoval(group, removedUserIDs) {
        if (!removedUserIDs.length) {
            throw new Error('Group member removal transaction requires at least one member ID.');
        }
        /** placeholders 只来自已校验且去重的稳定成员身份。 */
        const placeholders = removedUserIDs.map(() => '?').join(', ');
        await this.transaction(async (tx) => {
            await tx.execute(createGroupUpsertStatement(group));
            await tx.execute(statement(`DELETE FROM group_members
          WHERE group_id = ? AND user_id IN (${placeholders})`, [group.groupID, ...removedUserIDs]));
        });
    }
    /** 用权威全量成员快照原子替换成员行并校准群人数。 */
    async replaceMemberSnapshot(group, members) {
        /** nextGroup 将群人数绑定到同一份权威成员快照。 */
        const nextGroup = {
            ...group,
            memberCount: members.length,
            payload: {
                ...(group.payload ?? group),
                member_count: members.length,
            },
        };
        await this.transaction(async (tx) => {
            await tx.execute(createGroupUpsertStatement(nextGroup));
            await tx.execute(statement('DELETE FROM group_members WHERE group_id = ?', [group.groupID]));
            for (const member of members) {
                await tx.execute(createGroupMemberUpsertStatement(member));
            }
        });
    }
    /** 原子写回角色变更后的群资料和受影响成员，避免跨表出现半成功。 */
    async applyMemberRoleChanges(group, members) {
        if (!members.length) {
            throw new Error('Group member role transaction requires at least one member.');
        }
        await this.transaction(async (tx) => {
            await tx.execute(createGroupUpsertStatement(group));
            for (const member of members) {
                await tx.execute(createGroupMemberUpsertStatement(member));
            }
        });
    }
    /** 原子删除群生命周期结束后的群、成员、会话、消息与消息附件缓存。 */
    async removeLifecycleState(groupID) {
        /** normalizedGroupID 防止空身份扩大跨表删除范围。 */
        const normalizedGroupID = groupID.trim();
        if (!normalizedGroupID) {
            throw new Error('Group lifecycle cleanup requires a stable group ID.');
        }
        return this.transaction(async (tx) => {
            /** conversationRows 只选择当前群目标下的群会话，禁止误删同 ID 单聊。 */
            const conversationRows = await tx.query(statement("SELECT conversation_id FROM conversations WHERE type = 'group' AND target_id = ? ORDER BY updated_at ASC, conversation_id ASC", [normalizedGroupID]));
            /** conversationIDs 是本事务消息和会话删除的精确边界。 */
            const conversationIDs = conversationRows.map(row => readRequiredString(row, 'conversation_id'));
            for (const conversationID of conversationIDs) {
                await tx.execute(statement('DELETE FROM attachments WHERE message_id IN (SELECT client_msg_id FROM messages WHERE conversation_id = ?)', [conversationID]));
                await tx.execute(statement('DELETE FROM messages WHERE conversation_id = ?', [conversationID]));
            }
            await tx.execute(statement("DELETE FROM conversations WHERE type = 'group' AND target_id = ?", [normalizedGroupID]));
            await tx.execute(statement('DELETE FROM group_members WHERE group_id = ?', [normalizedGroupID]));
            await tx.execute(statement('DELETE FROM groups WHERE group_id = ?', [normalizedGroupID]));
            return conversationIDs;
        });
    }
}
export class GroupMemberRepository extends Repository {
    constructor(database) {
        super(database);
    }
    async replaceGroupMembers(groupID, members) {
        await this.transaction(async (tx) => {
            await tx.execute(statement('DELETE FROM group_members WHERE group_id = ?', [groupID]));
            await Promise.all(members.map(member => tx.execute(statement(`INSERT OR REPLACE INTO group_members (
                group_id,
                user_id,
                nickname,
                face_url,
                role_level,
                admin_since,
                updated_at,
                raw_json
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                member.groupID,
                member.userID,
                member.nickname ?? null,
                member.faceURL ?? null,
                member.roleLevel ?? null,
                member.adminSince ?? null,
                Date.now(),
                JSON.stringify(member.payload ?? member),
            ]))));
        });
    }
    async listByGroupID(groupID) {
        const rows = await this.query(statement('SELECT * FROM group_members WHERE group_id = ? ORDER BY updated_at DESC', [groupID]));
        return rows.map(mapGroupMemberRow);
    }
    /** 按群和稳定用户 ID 读取单个成员快照，供共享只读投影复用。 */
    async getByGroupAndUserID(groupID, userID) {
        /** rows 只允许命中当前群的精确复合身份。 */
        const rows = await this.query(statement('SELECT * FROM group_members WHERE group_id = ? AND user_id = ? LIMIT 1', [groupID, userID]));
        return rows[0] ? mapGroupMemberRow(rows[0]) : null;
    }
    /** 原子写回单个群成员，避免局部 mutation 覆盖同群其他成员。 */
    async upsert(member) {
        await this.execute(statement(`INSERT OR REPLACE INTO group_members (
          group_id,
          user_id,
          nickname,
          face_url,
          role_level,
          admin_since,
          updated_at,
          raw_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            member.groupID,
            member.userID,
            member.nickname ?? null,
            member.faceURL ?? null,
            member.roleLevel ?? null,
            member.adminSince ?? null,
            Date.now(),
            JSON.stringify(member.payload ?? member),
        ]));
    }
}
function mapGroupRow(row) {
    const faceURL = readOptionalString(row, 'face_url');
    const memberCount = readOptionalNumber(row, 'member_count');
    return {
        ...parseJsonColumn(row, 'raw_json', {}),
        groupID: readRequiredString(row, 'group_id'),
        name: readRequiredString(row, 'name'),
        ...(faceURL !== undefined ? { faceURL } : {}),
        ...(memberCount !== undefined ? { memberCount } : {}),
    };
}
function mapGroupMemberRow(row) {
    const nickname = readOptionalString(row, 'nickname');
    const faceURL = readOptionalString(row, 'face_url');
    const roleLevel = readOptionalNumber(row, 'role_level');
    const adminSince = readOptionalString(row, 'admin_since');
    return {
        ...parseJsonColumn(row, 'raw_json', {}),
        groupID: readRequiredString(row, 'group_id'),
        userID: readRequiredString(row, 'user_id'),
        ...(nickname !== undefined ? { nickname } : {}),
        ...(faceURL !== undefined ? { faceURL } : {}),
        ...(roleLevel !== undefined ? { roleLevel } : {}),
        ...(adminSince !== undefined ? { adminSince } : {}),
    };
}
/** 构造 groups 单行写入语句，供普通写入和跨表事务共用。 */
function createGroupUpsertStatement(group) {
    return statement(`INSERT OR REPLACE INTO groups (
      group_id,
      name,
      face_url,
      member_count,
      updated_at,
      raw_json
    ) VALUES (?, ?, ?, ?, ?, ?)`, [
        group.groupID,
        group.name,
        group.faceURL ?? null,
        group.memberCount ?? null,
        Date.now(),
        JSON.stringify(group.payload ?? group),
    ]);
}
/** 构造 group_members 单行写入语句，保证全量事务字段一致。 */
function createGroupMemberUpsertStatement(member) {
    return statement(`INSERT OR REPLACE INTO group_members (
      group_id,
      user_id,
      nickname,
      face_url,
      role_level,
      admin_since,
      updated_at,
      raw_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
        member.groupID,
        member.userID,
        member.nickname ?? null,
        member.faceURL ?? null,
        member.roleLevel ?? null,
        member.adminSince ?? null,
        Date.now(),
        JSON.stringify(member.payload ?? member),
    ]);
}
//# sourceMappingURL=repository.js.map