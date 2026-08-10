import { WebIMRuntimeError } from './runtime-error.js';
/** 创建不会复制 endpoint 或响应 DTO 的 Web 用户设置 facade。 */
export function createWebIMUserSettings(dependencies) {
    /** 在发起设置请求前拒绝匿名 runtime。 */
    const requireAuthenticatedUser = () => {
        if (!dependencies.getCurrentUserID()) {
            throw new WebIMRuntimeError('USER_SETTINGS_AUTH_REQUIRED', 'User settings require an authenticated Web IM session.');
        }
    };
    return {
        /** 读取当前账号的服务端通知偏好。 */
        async getNotification() {
            requireAuthenticatedUser();
            return dependencies.gatewayClient.getNotificationSetting();
        },
        /** 更新一个通知开关并返回服务端完整偏好。 */
        async updateNotification(request) {
            requireAuthenticatedUser();
            return dependencies.gatewayClient.updateNotificationSetting(request);
        },
        /** 读取当前账号的服务端权限配置。 */
        async getPermission() {
            requireAuthenticatedUser();
            return dependencies.gatewayClient.getPermissionSetting();
        },
        /** 更新一个权限开关并返回服务端完整配置。 */
        async updatePermission(request) {
            requireAuthenticatedUser();
            return dependencies.gatewayClient.updatePermissionSetting(request);
        },
    };
}
//# sourceMappingURL=web-im-user-settings.js.map