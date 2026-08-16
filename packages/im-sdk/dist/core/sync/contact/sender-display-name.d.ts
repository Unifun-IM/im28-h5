import { type DatabaseAdapter } from '@im28/im-sdk/core';
/** 跨端群成员名称投影的最小字段契约。 */
export interface IMGroupMemberDisplayNameSource {
    readonly userID?: string;
    readonly remark?: string;
    readonly groupNickname?: string;
    readonly nickname?: string;
}
/** 按 RN 的备注、群昵称、公开昵称和匿名身份顺序解析群成员可见名称。 */
export declare function resolveIMGroupMemberDisplayName(source: IMGroupMemberDisplayNameSource, fallback?: string): string;
/** 按 RN 的备注、群昵称、用户昵称顺序解析群消息发送人名称。 */
export declare function resolveGroupSenderDisplayName(database: DatabaseAdapter, groupID: string, userID: string): Promise<string | undefined>;
//# sourceMappingURL=sender-display-name.d.ts.map