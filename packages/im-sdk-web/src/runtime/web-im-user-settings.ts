import type {
  GatewayHTTPClient,
  GatewayNotificationType,
  GatewayUserNotificationSetting,
} from '@im28/im-sdk/web';

import { WebIMRuntimeError } from './runtime-error.js';

/** 通知设置写操作保持共享 Gateway 的 type/enabled 合同。 */
export interface WebIMUpdateNotificationSettingRequest {
  readonly type: GatewayNotificationType;
  readonly enabled: boolean;
}

/** 页面可使用的认证用户设置 facade。 */
export interface WebIMUserSettings {
  getNotification(): Promise<GatewayUserNotificationSetting>;
  updateNotification(
    request: WebIMUpdateNotificationSettingRequest,
  ): Promise<GatewayUserNotificationSetting>;
}

/** 用户设置 facade 只依赖共享 Gateway client 和动态认证身份。 */
export interface WebIMUserSettingsDependencies {
  readonly gatewayClient: GatewayHTTPClient;
  readonly getCurrentUserID: () => string | null;
}

/** 创建不会复制 endpoint 或响应 DTO 的 Web 用户设置 facade。 */
export function createWebIMUserSettings(
  dependencies: WebIMUserSettingsDependencies,
): WebIMUserSettings {
  /** 在发起设置请求前拒绝匿名 runtime。 */
  const requireAuthenticatedUser = (): void => {
    if (!dependencies.getCurrentUserID()) {
      throw new WebIMRuntimeError(
        'USER_SETTINGS_AUTH_REQUIRED',
        'User settings require an authenticated Web IM session.',
      );
    }
  };

  return {
    /** 读取当前账号的服务端通知偏好。 */
    async getNotification(): Promise<GatewayUserNotificationSetting> {
      requireAuthenticatedUser();
      return dependencies.gatewayClient.getNotificationSetting();
    },
    /** 更新一个通知开关并返回服务端完整偏好。 */
    async updateNotification(
      request: WebIMUpdateNotificationSettingRequest,
    ): Promise<GatewayUserNotificationSetting> {
      requireAuthenticatedUser();
      return dependencies.gatewayClient.updateNotificationSetting(request);
    },
  };
}
