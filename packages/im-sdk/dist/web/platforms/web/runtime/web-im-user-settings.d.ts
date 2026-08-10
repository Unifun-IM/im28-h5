import type { GatewayHTTPClient, GatewayNotificationType, GatewayPermissionType, GatewayUserNotificationSetting, GatewayUserPermissionSetting } from '@im28/im-sdk/core';
/** 通知设置写操作保持共享 Gateway 的 type/enabled 合同。 */
export interface WebIMUpdateNotificationSettingRequest {
    readonly type: GatewayNotificationType;
    readonly enabled: boolean;
}
/** 权限设置写操作保持共享 Gateway 的 type/enabled 合同。 */
export interface WebIMUpdatePermissionSettingRequest {
    readonly type: GatewayPermissionType;
    readonly enabled: boolean;
}
/** 页面可使用的认证用户设置 facade。 */
export interface WebIMUserSettings {
    getNotification(): Promise<GatewayUserNotificationSetting>;
    updateNotification(request: WebIMUpdateNotificationSettingRequest): Promise<GatewayUserNotificationSetting>;
    getPermission(): Promise<GatewayUserPermissionSetting>;
    updatePermission(request: WebIMUpdatePermissionSettingRequest): Promise<GatewayUserPermissionSetting>;
}
/** 用户设置 facade 只依赖共享 Gateway client 和动态认证身份。 */
export interface WebIMUserSettingsDependencies {
    readonly gatewayClient: GatewayHTTPClient;
    readonly getCurrentUserID: () => string | null;
}
/** 创建不会复制 endpoint 或响应 DTO 的 Web 用户设置 facade。 */
export declare function createWebIMUserSettings(dependencies: WebIMUserSettingsDependencies): WebIMUserSettings;
//# sourceMappingURL=web-im-user-settings.d.ts.map