import type { DatabaseAdapter } from '../../db/database.js';
import { Repository } from '../../db/repository.js';
import type { CustomEmoji } from './custom-emoji.js';
/** 账号 SQLite 内自定义表情全量快照的唯一 Repository。 */
export declare class CustomEmojiRepository extends Repository {
    /** 将 Repository 绑定到当前认证账号数据库。 */
    constructor(database: DatabaseAdapter);
    /** 按服务端添加时间倒序返回完整缓存。 */
    list(): Promise<readonly CustomEmoji[]>;
    /** 仅在新快照已全部校验后原子替换旧缓存。 */
    replaceAll(emojis: readonly CustomEmoji[]): Promise<void>;
    /** 仅在 Gateway 删除成功后原子移除指定账号成员关系。 */
    deleteByIDs(emojiIDs: readonly string[]): Promise<void>;
}
//# sourceMappingURL=repository.d.ts.map