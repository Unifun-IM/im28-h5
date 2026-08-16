import { type GatewayHTTPClient, type Group } from '@im28/im-sdk/core';
import { type WebIMSyncContext } from '../sync-context.js';
/** 群昵称局部更新只接受稳定群 ID 与非空名称。 */
export interface IMUpdateGroupNameOptions {
    readonly groupID: string;
    readonly name: string;
}
/** 群头像更新只接受平台上传完成后的远端 URL。 */
export interface IMUpdateGroupAvatarOptions {
    readonly groupID: string;
    readonly avatarURL: string;
}
/** 群简介更新保留 RN 既有 500 字上限和 trim 语义。 */
export interface IMUpdateGroupIntroductionOptions {
    readonly groupID: string;
    readonly introduction: string;
}
/** 群简介业务上限由 shared owner 统一公开给平台表单。 */
export declare const IM_GROUP_INTRODUCTION_MAX_LENGTH = 500;
/** 在 Gateway 成功后合并群昵称并保留已有缓存字段。 */
export declare function updateIMGroupName(context: WebIMSyncContext, options: IMUpdateGroupNameOptions, gatewayClient: GatewayHTTPClient): Promise<Group>;
/** 在 Gateway 成功后合并群头像并保留已有缓存字段。 */
export declare function updateIMGroupAvatar(context: WebIMSyncContext, options: IMUpdateGroupAvatarOptions, gatewayClient: GatewayHTTPClient): Promise<Group>;
/** 在 Gateway 成功后合并群简介并保留已有缓存字段。 */
export declare function updateIMGroupIntroduction(context: WebIMSyncContext, options: IMUpdateGroupIntroductionOptions, gatewayClient: GatewayHTTPClient): Promise<Group>;
/** 在平台上传或 Gateway mutation 前校验缓存群与当前账号权限。 */
export declare function requireIMGroupProfileUpdateAccess(context: WebIMSyncContext, groupID: string): Promise<Group>;
/** 解析当前账号群资料编辑权限，显式权限优先于角色回退。 */
export declare function canUpdateIMGroupProfile(payload: Record<string, unknown>): boolean;
//# sourceMappingURL=group-profile-update.d.ts.map