/** 通知配置详情 返回当前用户通知配置；首次查询会自动创建默认配置，默认全部开启。 POST /v1/setting/notification/detail */
export declare function postV1SettingNotificationDetail(options?: Record<string, unknown>): Promise<GatewayOpenAPI.UserNotificationSettingEnvelope>;
/** 通知开关 按通知类型打开或关闭当前用户的通知配置。 POST /v1/setting/notification/switch */
export declare function postV1SettingNotificationSwitch(body: GatewayOpenAPI.UpdateUserNotificationSettingRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.UserNotificationSettingEnvelope>;
/** 权限配置详情 返回当前用户的好友验证、搜索、直接群邀请、性别展示和个人简介展示权限；首次查询会自动创建默认配置，五项默认全部开启。 POST /v1/setting/permission/detail */
export declare function postV1SettingPermissionDetail(options?: Record<string, unknown>): Promise<GatewayOpenAPI.UserPermissionSettingEnvelope>;
/** 权限开关 按权限类型打开或关闭当前用户的权限配置，保存后对应的好友申请、搜索、直接群邀请和资料展示逻辑立即生效。 POST /v1/setting/permission/switch */
export declare function postV1SettingPermissionSwitch(body: GatewayOpenAPI.UpdateUserPermissionSettingRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.UserPermissionSettingEnvelope>;
//# sourceMappingURL=apIshezhi.d.ts.map