import type { GatewayHTTPClient, Group, GroupMember } from '@im28/im-sdk/core';
import type { WebIMSyncContextDependencies } from '../sync-context.js';
import type { WebIMSyncMutationQueueDependencies } from '../sync-mutation-queue.js';
/** 发言频率只接受 Gateway 和 RN 当前共同支持的档位。 */
export type IMGroupSpeechFrequencySeconds = 30 | 60 | 180 | 300 | 600 | 1800 | 3600;
/** 群基础设置 patch 要求调用方只传本次明确修改的字段。 */
export interface IMUpdateGroupSettingsOptions {
    readonly groupID: string;
    readonly joinApprovalRequired?: boolean;
    readonly allowMemberInvite?: boolean;
    readonly allowMemberAddFriend?: boolean;
    readonly allowMemberNickname?: boolean;
    readonly speechFrequencyEnabled?: boolean;
    readonly speechFrequencySeconds?: IMGroupSpeechFrequencySeconds;
}
/** 群禁言 patch 保留全员和普通成员两个独立服务端开关。 */
export interface IMUpdateGroupMuteOptions {
    readonly groupID: string;
    readonly muteAll?: boolean;
    readonly muteMember?: boolean;
}
/** 单成员禁言使用稳定成员身份；空到期时间表示解除。 */
export interface IMUpdateGroupMemberMuteOptions {
    readonly groupID: string;
    readonly userID: string;
    readonly muteUntil: string;
}
/** 远端成功后的本地缓存状态用于显式呈现部分成功。 */
export type IMGroupSettingsMuteCacheState = 'local' | 'remote-only';
/** 群设置或群禁言提交返回合并后的群事实。 */
export interface IMGroupSettingsMutationResult {
    readonly group: Group;
    readonly cacheState: IMGroupSettingsMuteCacheState;
}
/** 成员禁言提交返回合并后的成员事实。 */
export interface IMGroupMemberMuteMutationResult {
    readonly member: GroupMember;
    readonly cacheState: IMGroupSettingsMuteCacheState;
}
/** 群设置与禁言 facade 复用认证、数据库、Gateway 和全局写队列。 */
export interface IMGroupManagementSyncDependencies extends WebIMSyncContextDependencies, WebIMSyncMutationQueueDependencies {
    readonly gatewayClient: GatewayHTTPClient;
}
/** 群设置与禁言的唯一中性业务入口。 */
export interface IMGroupManagementSync {
    updateSettings(options: IMUpdateGroupSettingsOptions): Promise<IMGroupSettingsMutationResult>;
    updateMute(options: IMUpdateGroupMuteOptions): Promise<IMGroupSettingsMutationResult>;
    updateMemberMute(options: IMUpdateGroupMemberMuteOptions): Promise<IMGroupMemberMuteMutationResult>;
}
//# sourceMappingURL=group-settings-mute-contracts.d.ts.map