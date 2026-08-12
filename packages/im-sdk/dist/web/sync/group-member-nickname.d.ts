import { type GatewayHTTPClient, type GroupMember } from '@im28/im-sdk/core';
import { type WebIMSyncContextDependencies } from './sync-context.js';
/** 当前账号群昵称 mutation 的最小依赖。 */
export interface IMGroupMemberNicknameDependencies extends WebIMSyncContextDependencies {
    readonly gatewayClient: GatewayHTTPClient;
}
/** 更新当前认证账号群昵称，并在远端成功后返回已写回成员记录。 */
export declare function updateSelfGroupNicknameRecord(dependencies: IMGroupMemberNicknameDependencies, groupID: string, nickname: string): Promise<GroupMember>;
//# sourceMappingURL=group-member-nickname.d.ts.map