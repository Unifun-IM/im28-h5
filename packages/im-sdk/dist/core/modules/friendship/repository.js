import { statement } from '../../db/database.js';
import { Repository } from '../../db/repository.js';
import { parseJsonColumn, readRequiredNumber, readRequiredString } from '../../db/row.js';
export class FriendshipRepository extends Repository {
    constructor(database) {
        super(database);
    }
    async upsert(friendship) {
        await this.execute(statement(`INSERT OR REPLACE INTO friendships (
          user_id,
          is_friend,
          updated_at,
          raw_json
        ) VALUES (?, ?, ?, ?)`, [
            friendship.userID,
            friendship.isFriend ? 1 : 0,
            Date.now(),
            JSON.stringify(friendship.payload ?? friendship),
        ]));
    }
    async listFriends() {
        const rows = await this.query(statement('SELECT * FROM friendships WHERE is_friend = 1 ORDER BY updated_at DESC'));
        return rows.map(mapFriendshipRow);
    }
    /** 按稳定用户 ID 读取单条好友关系缓存。 */
    async getByUserID(userID) {
        const rows = await this.query(statement('SELECT * FROM friendships WHERE user_id = ?', [userID]));
        return rows[0] ? mapFriendshipRow(rows[0]) : null;
    }
    /** 一次读取多个好友关系，供群成员展示避免逐成员查询。 */
    async getByUserIDs(userIDs) {
        /** normalizedUserIDs 去重并过滤空身份。 */
        const normalizedUserIDs = [...new Set(userIDs.map(userID => userID.trim()).filter(Boolean))];
        if (!normalizedUserIDs.length)
            return [];
        /** placeholders 只表达参数数量，不拼接身份值。 */
        const placeholders = normalizedUserIDs.map(() => '?').join(', ');
        /** rows 由调用方按 userID 建立展示索引。 */
        const rows = await this.query(statement(`SELECT * FROM friendships WHERE user_id IN (${placeholders})`, normalizedUserIDs));
        return rows.map(mapFriendshipRow);
    }
    async replaceAll(friendships) {
        await this.transaction(async (tx) => {
            await tx.execute(statement('DELETE FROM friendships'));
            await Promise.all(friendships.map(friendship => tx.execute(statement(`INSERT OR REPLACE INTO friendships (
                user_id,
                is_friend,
                updated_at,
                raw_json
              ) VALUES (?, ?, ?, ?)`, [
                friendship.userID,
                friendship.isFriend ? 1 : 0,
                Date.now(),
                JSON.stringify(friendship.payload ?? friendship),
            ]))));
        });
    }
    async deleteByUserID(userID) {
        await this.execute(statement('DELETE FROM friendships WHERE user_id = ?', [userID]));
    }
}
function mapFriendshipRow(row) {
    return {
        userID: readRequiredString(row, 'user_id'),
        isFriend: readRequiredNumber(row, 'is_friend') === 1,
        payload: {
            ...parseJsonColumn(row, 'raw_json', {}),
            cachedAt: readRequiredNumber(row, 'updated_at'),
        },
    };
}
//# sourceMappingURL=repository.js.map