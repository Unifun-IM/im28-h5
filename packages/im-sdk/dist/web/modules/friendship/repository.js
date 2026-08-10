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