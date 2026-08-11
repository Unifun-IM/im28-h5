import { type DatabaseAdapter } from '@im28/im-sdk/core';
/** 按 RN 的备注、群昵称、用户昵称顺序解析群消息发送人名称。 */
export declare function resolveGroupSenderDisplayName(database: DatabaseAdapter, groupID: string, userID: string): Promise<string | undefined>;
//# sourceMappingURL=sender-display-name.d.ts.map