import { type Conversation, type GatewayHTTPClient } from '@im28/im-sdk/core';
import { type WebIMSyncContextDependencies } from '../sync-context.js';
import { type WebIMSyncMutationQueueDependencies } from '../sync-mutation-queue.js';
/** 平台中立的会话清空范围。 */
export type IMConversationClearScope = 'self' | 'both' | 'all_members';
/** 主动清空参数允许 caller 在模糊超时后复用 operation ID。 */
export interface IMConversationClearOptions {
    readonly conversationID: string;
    readonly scope: IMConversationClearScope;
    readonly operationID?: string;
}
/** RN、Web、Desktop 共用的会话清空 facade。 */
export interface IMConversationClearSync {
    /** Gateway 成功后按返回 cursor 原子收敛当前账号缓存。 */
    clear(options: IMConversationClearOptions): Promise<Conversation>;
    /** 应用 type 2102 控制通知；非清空事件返回 null。 */
    handleRealtime(payload: unknown): Promise<Conversation | null>;
}
/** 会话清空只依赖账号数据库、Gateway、队列、时钟与 ID 端口。 */
export interface IMConversationClearSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly createClientMessageID?: () => string;
    readonly now?: () => number;
    readonly canClearAllMembers?: (conversation: Conversation) => boolean | Promise<boolean>;
}
/** 群清空权限只消费共享成员 facade 已规范化的角色快照。 */
export interface IMConversationClearMemberPermission {
    readonly role: 'owner' | 'admin' | 'member';
    readonly roleLevel: number;
}
/** 统一 RN、Web、Desktop 的群历史全员清空权限判断。 */
export declare function canIMGroupMemberClearAllMessages(member: IMConversationClearMemberPermission | null | undefined): boolean;
/** 创建 RN、Web、Desktop 共用的会话清空业务 facade。 */
export declare function createIMConversationClearSync(dependencies: IMConversationClearSyncDependencies): IMConversationClearSync;
/** 同步判断 payload 是否包含会话清空控制事件，供 realtime 路由保留账号冻结时序。 */
export declare function isIMConversationClearRealtime(payload: unknown): boolean;
//# sourceMappingURL=conversation-clear-sync.d.ts.map