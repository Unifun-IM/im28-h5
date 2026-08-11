import type { Message } from '../../core/types.js';
import type { DatabaseStatement } from '../../db/database.js';
/** 生成单条消息 upsert 语句，供单写和事务批写复用。 */
export declare function createMessageUpsertStatement(message: Message): DatabaseStatement;
//# sourceMappingURL=message-upsert.d.ts.map