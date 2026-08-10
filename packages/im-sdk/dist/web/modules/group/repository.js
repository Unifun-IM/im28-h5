import { statement } from '../../db/database.js';
import { Repository } from '../../db/repository.js';
import { parseJsonColumn, readOptionalNumber, readOptionalString, readRequiredString } from '../../db/row.js';
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
//# sourceMappingURL=repository.js.map