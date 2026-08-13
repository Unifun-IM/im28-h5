import { type GatewayHTTPClient } from '@im28/im-sdk/core';
import type { IMGroupManagementSync, IMGroupManagementSyncDependencies, IMGroupMemberMuteMutationResult, IMGroupSettingsMutationResult, IMUpdateGroupMemberMuteOptions, IMUpdateGroupMuteOptions, IMUpdateGroupSettingsOptions } from './group-settings-mute-contracts.js';
import { type WebIMSyncContext } from './sync-context.js';
export type { IMGroupManagementSync, IMGroupManagementSyncDependencies, IMGroupMemberMuteMutationResult, IMGroupSettingsMutationResult, IMGroupSettingsMuteCacheState, IMGroupSpeechFrequencySeconds, IMUpdateGroupMemberMuteOptions, IMUpdateGroupMuteOptions, IMUpdateGroupSettingsOptions, } from './group-settings-mute-contracts.js';
/** 创建跨 RN、Web、Desktop 可复用的群设置与禁言 facade。 */
export declare function createIMGroupManagementSync(dependencies: IMGroupManagementSyncDependencies): IMGroupManagementSync;
/** 校验群主设置权限并执行一次群设置写入。 */
export declare function updateIMGroupSettings(context: WebIMSyncContext, options: IMUpdateGroupSettingsOptions, gatewayClient: GatewayHTTPClient): Promise<IMGroupSettingsMutationResult>;
/** 校验群禁言权限并执行一次群禁言写入。 */
export declare function updateIMGroupMute(context: WebIMSyncContext, options: IMUpdateGroupMuteOptions, gatewayClient: GatewayHTTPClient): Promise<IMGroupSettingsMutationResult>;
/** 校验目标普通成员和禁言时间后执行一次成员禁言写入。 */
export declare function updateIMGroupMemberMute(context: WebIMSyncContext, options: IMUpdateGroupMemberMuteOptions, gatewayClient: GatewayHTTPClient): Promise<IMGroupMemberMuteMutationResult>;
//# sourceMappingURL=group-settings-mute.d.ts.map