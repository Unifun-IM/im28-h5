import { type Conversation, type GatewayHTTPClient, type Group } from '@im28/im-sdk/core';
import { type WebIMSyncContextDependencies } from './sync-context.js';
import type { WebIMSyncMutationQueueDependencies } from './sync-mutation-queue.js';
/** RN 当前普通群至少需要选择的好友数。 */
export declare const IM_GROUP_CREATION_MIN_MEMBER_COUNT = 2;
/** RN 当前普通群除创建者外允许选择的好友上限。 */
export declare const IM_GROUP_CREATION_MAX_MEMBER_COUNT = 998;
/** 创建群只接收稳定成员身份和可选显示名称，不接收平台 UI 对象。 */
export interface IMGroupCreationOptions {
    readonly memberUserIDs: readonly string[];
    readonly ownerDisplayName?: string;
    readonly groupName?: string;
}
/** 创建群结果显式区分服务端成功与本地事务完成。 */
export interface IMGroupCreationResult {
    readonly group: Group;
    readonly conversation: Conversation;
    readonly cacheState: 'local' | 'remote-only';
}
/** 平台中立创建群能力统一校验、Gateway 调用和缓存收敛。 */
export interface IMGroupCreationSync {
    create(options: IMGroupCreationOptions): Promise<IMGroupCreationResult>;
}
/** 创建群能力复用当前账号、Gateway 和共享写队列。 */
export interface IMGroupCreationSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly now?: () => number;
}
/** 判断好友选择数量是否满足 RN 普通群创建范围。 */
export declare function canCreateIMGroupWithMemberCount(memberCount: number): boolean;
/** 创建绑定当前认证账号的群创建状态机。 */
export declare function createIMGroupCreationSync(dependencies: IMGroupCreationSyncDependencies): IMGroupCreationSync;
//# sourceMappingURL=group-creation.d.ts.map