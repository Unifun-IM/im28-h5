import { statement } from '../../db/database.js';
import { Repository } from '../../db/repository.js';
import { readRequiredNumber, readRequiredString, } from '../../db/row.js';
/** 账号 SQLite 内自定义表情全量快照的唯一 Repository。 */
export class CustomEmojiRepository extends Repository {
    /** 将 Repository 绑定到当前认证账号数据库。 */
    constructor(database) {
        super(database);
    }
    /** 按服务端添加时间倒序返回完整缓存。 */
    async list() {
        // rows 保持 added_at 与服务端倒序语义一致。
        const rows = await this.query(statement('SELECT * FROM custom_emojis ORDER BY added_at DESC, sort_order ASC'));
        return rows.map(mapCustomEmojiRow);
    }
    /** 仅在新快照已全部校验后原子替换旧缓存。 */
    async replaceAll(emojis) {
        await this.transaction(async (tx) => {
            await tx.execute(statement('DELETE FROM custom_emojis'));
            for (const [index, emoji] of emojis.entries()) {
                await tx.execute(statement(`INSERT INTO custom_emojis (
              emoji_id,
              url,
              added_at,
              sort_order,
              updated_at
            ) VALUES (?, ?, ?, ?, ?)`, [emoji.emojiID, emoji.url, emoji.addedAt, index, Date.now()]));
            }
        });
    }
    /** 仅在 Gateway 删除成功后原子移除指定账号成员关系。 */
    async deleteByIDs(emojiIDs) {
        if (!emojiIDs.length)
            return;
        // placeholders 只对应已规范化 ID，避免动态拼接用户输入。
        const placeholders = emojiIDs.map(() => '?').join(', ');
        await this.execute(statement(`DELETE FROM custom_emojis WHERE emoji_id IN (${placeholders})`, emojiIDs));
    }
}
/** 将 SQLite row 恢复为稳定领域模型。 */
function mapCustomEmojiRow(row) {
    return {
        emojiID: readRequiredString(row, 'emoji_id'),
        url: readRequiredString(row, 'url'),
        addedAt: readRequiredNumber(row, 'added_at'),
    };
}
//# sourceMappingURL=repository.js.map