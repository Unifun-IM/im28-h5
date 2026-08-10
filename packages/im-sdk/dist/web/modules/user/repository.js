import { statement } from '../../db/database.js';
import { Repository } from '../../db/repository.js';
import { parseJsonColumn, readOptionalString, readRequiredNumber, readRequiredString } from '../../db/row.js';
export class UserRepository extends Repository {
    constructor(database) {
        super(database);
    }
    async upsert(user) {
        await this.execute(statement(`INSERT OR REPLACE INTO users (
          user_id,
          nickname,
          face_url,
          updated_at,
          raw_json
        ) VALUES (?, ?, ?, ?, ?)`, [
            user.userID,
            user.nickname ?? null,
            user.faceURL ?? null,
            Date.now(),
            JSON.stringify(user.payload ?? user),
        ]));
    }
    async getByID(userID) {
        const rows = await this.query(statement('SELECT * FROM users WHERE user_id = ?', [userID]));
        return rows[0] ? mapUserRow(rows[0]) : null;
    }
    async deleteByUserID(userID) {
        await this.execute(statement('DELETE FROM users WHERE user_id = ?', [userID]));
    }
}
function mapUserRow(row) {
    const nickname = readOptionalString(row, 'nickname');
    const faceURL = readOptionalString(row, 'face_url');
    return {
        userID: readRequiredString(row, 'user_id'),
        ...(nickname !== undefined ? { nickname } : {}),
        ...(faceURL !== undefined ? { faceURL } : {}),
        payload: {
            ...parseJsonColumn(row, 'raw_json', {}),
            cachedAt: readRequiredNumber(row, 'updated_at'),
        },
    };
}
//# sourceMappingURL=repository.js.map