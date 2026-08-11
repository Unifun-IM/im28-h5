/** 消息删除范围与 Gateway scope 保持一致。 */
export type WebIMMessageDeleteScope = 'self' | 'all';
/** 删除入口只接收当前账号缓存中的稳定消息身份。 */
export interface WebIMDeleteMessagesOptions {
    readonly conversationID: string;
    readonly clientMsgIDs: readonly string[];
    readonly scope: WebIMMessageDeleteScope;
}
/** 单条删除结果明确区分成功和可见失败。 */
export interface WebIMDeleteMessageItemResult {
    readonly clientMsgID: string;
    readonly serverMsgID?: string;
    readonly deleted: boolean;
    readonly error?: string;
}
/** 批量删除结果保留逐项状态，不提供模糊整批成功标记。 */
export interface WebIMDeleteMessagesResult {
    readonly deletedClientMsgIDs: readonly string[];
    readonly failedCount: number;
    readonly list: readonly WebIMDeleteMessageItemResult[];
}
//# sourceMappingURL=message-delete-types.d.ts.map