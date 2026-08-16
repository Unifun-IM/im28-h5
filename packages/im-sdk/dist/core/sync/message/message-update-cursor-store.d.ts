import type { DatabaseExecutor } from '@im28/im-sdk/core';
/** 读取指定会话最后成功应用的 message update cursor。 */
export declare function readMessageUpdateCursor(database: DatabaseExecutor, conversationID: string): Promise<string>;
/** 在 update 成功应用后推进当前会话 cursor。 */
export declare function writeMessageUpdateCursor(database: DatabaseExecutor, conversationID: string, cursor: string): Promise<void>;
//# sourceMappingURL=message-update-cursor-store.d.ts.map