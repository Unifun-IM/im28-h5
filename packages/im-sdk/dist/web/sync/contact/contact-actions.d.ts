import { type Message, type GatewayFriend, type GatewayGroup, type GatewayHTTPClient } from '@im28/im-sdk/core';
import { type WebIMSyncContextDependencies } from '../sync-context.js';
import { type WebIMSyncMutationQueueDependencies } from '../sync-mutation-queue.js';
import { type IMShareGroupCardOptions, type IMShareGroupCardResult } from '../group/group-card-share.js';
export type { IMShareGroupCardOptions, IMShareGroupCardResult, } from '../group/group-card-share.js';
/** 删除好友时 Gateway 同步清理聊天记录的范围。 */
export type IMFriendDeleteScope = 'self' | 'both';
/** 删除好友参数允许 caller 在模糊超时后复用 operation ID。 */
export interface IMDeleteFriendOptions {
    readonly friendUserID: string;
    readonly clearScope: IMFriendDeleteScope;
    readonly operationID?: string;
}
/** 删除好友成功后的当前账号缓存收敛结果。 */
export interface IMDeleteFriendResult {
    readonly friendUserID: string;
    readonly conversationIDs: readonly string[];
}
/** 分享好友名片参数支持多目标和 RN 已有的可选附言。 */
export interface IMShareUserCardOptions {
    readonly cardUserID: string;
    readonly targetUserIDs: readonly string[];
    readonly message?: string;
}
/** 名片分享返回实际目标和已持久化的附言消息。 */
export interface IMShareUserCardResult {
    readonly cardUserID: string;
    readonly targetUserIDs: readonly string[];
    readonly noteMessages: readonly Message[];
}
/** 好友资料写动作返回跨端可直接投影的关系快照。 */
export interface IMContactFriendProfile {
    readonly userID: string;
    readonly remark: string;
    readonly nickname: string;
    readonly avatarURL: string;
    readonly isStarred: boolean;
    readonly raw: GatewayFriend;
}
/** 共同群聊读取返回平台中立的群资料。 */
export interface IMContactCommonGroup {
    readonly groupID: string;
    readonly conversationID: string;
    readonly name: string;
    readonly avatarURL: string;
    readonly introduction: string;
    readonly memberCount: number;
    readonly ownerUserID: string;
    readonly raw: GatewayGroup;
}
/** 共同群聊读取参数限制单页尺寸并支持服务端分页。 */
export interface IMListContactCommonGroupsOptions {
    readonly targetUserID: string;
    readonly pageSize?: number;
}
/** RN、Web、Desktop 共用的联系人写动作 facade。 */
export interface IMContactActionsSync {
    /** Gateway 成功后原子删除好友关系和对应单聊缓存。 */
    deleteFriend(options: IMDeleteFriendOptions): Promise<IMDeleteFriendResult>;
    /** 批量分享用户卡片，并按目标复用共享文本发送状态机发送附言。 */
    shareUserCard(options: IMShareUserCardOptions): Promise<IMShareUserCardResult>;
    /** 逐好友发送群名片，并复用共享单聊和消息状态机。 */
    shareGroupCard(options: IMShareGroupCardOptions): Promise<IMShareGroupCardResult>;
    /** 更新好友备注并只在 Gateway 成功后合并关系缓存。 */
    updateFriendRemark(friendUserID: string, remark: string): Promise<IMContactFriendProfile>;
    /** 更新星标并只在 Gateway 成功后合并关系缓存。 */
    updateFriendStar(friendUserID: string, isStarred: boolean): Promise<IMContactFriendProfile>;
    /** 加入或移出黑名单，身份校验由 shared owner 统一执行。 */
    setBlacklist(userID: string, blocked: boolean): Promise<void>;
    /** 分页读取共同群聊并增量更新已有 group cache。 */
    listCommonGroups(options: IMListContactCommonGroupsOptions): Promise<readonly IMContactCommonGroup[]>;
}
/** 联系人动作只依赖账号数据库、Gateway、共享队列和 operation ID 端口。 */
export interface IMContactActionsSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly createClientMessageID?: () => string;
}
/** 创建 RN、Web、Desktop 共用的联系人写动作 facade。 */
export declare function createIMContactActionsSync(dependencies: IMContactActionsSyncDependencies): IMContactActionsSync;
//# sourceMappingURL=contact-actions.d.ts.map