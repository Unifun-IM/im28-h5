import type { Message } from '../../core/types.js';
import type { DatabaseRow } from '../../db/database.js';
/** 将 messages 表行恢复为平台中立消息，并统一校验 JSON 扩展字段。 */
export declare function mapStoredMessageRow(row: DatabaseRow): Message;
//# sourceMappingURL=message-row.d.ts.map