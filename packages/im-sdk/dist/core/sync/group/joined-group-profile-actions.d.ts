import type { GatewayHTTPClient, Group } from '@im28/im-sdk/core';
import type { WebIMSyncContextDependencies } from '../sync-context.js';
import type { WebIMSyncMutationQueueDependencies } from '../sync-mutation-queue.js';
import type { IMMediaUploadInput, IMMediaUploadPort } from '../message/message-media-send.js';
/** 群资料 actions 只依赖当前账号 context、共享队列、Gateway 与平台上传端口。 */
export interface IMJoinedGroupProfileActionDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly mediaUploadPort?: IMMediaUploadPort;
}
/** 将 core Group 投影成调用方群视图，避免 actions 反向依赖 Web DTO。 */
export type IMJoinedGroupProfileProjection<Result> = (group: Group, userID: string) => Result;
/** 更新群昵称并只在 Gateway 成功后收敛当前群缓存。 */
export declare function updateIMJoinedGroupName<Result>(dependencies: IMJoinedGroupProfileActionDependencies, groupID: string, name: string, project: IMJoinedGroupProfileProjection<Result>): Promise<Result>;
/** 上传群头像后在共享写队列内收敛远端群资料。 */
export declare function updateIMJoinedGroupAvatar<Result>(dependencies: IMJoinedGroupProfileActionDependencies, groupID: string, input: IMMediaUploadInput, project: IMJoinedGroupProfileProjection<Result>): Promise<Result>;
/** 更新群简介并只在 Gateway 精确成功后收敛当前群缓存。 */
export declare function updateIMJoinedGroupIntroduction<Result>(dependencies: IMJoinedGroupProfileActionDependencies, groupID: string, introduction: string, project: IMJoinedGroupProfileProjection<Result>): Promise<Result>;
//# sourceMappingURL=joined-group-profile-actions.d.ts.map