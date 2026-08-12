// @ts-ignore
/* eslint-disable */
import request from "../../request.js";
/** 通知配置详情 返回当前用户通知配置；首次查询会自动创建默认配置，默认全部开启。 POST /v1/setting/notification/detail */
export async function postV1SettingNotificationDetail(options) {
    return request("/v1/setting/notification/detail", {
        method: "POST",
        ...(options || {}),
    });
}
/** 通知开关 按通知类型打开或关闭当前用户的通知配置。 POST /v1/setting/notification/switch */
export async function postV1SettingNotificationSwitch(body, options) {
    return request("/v1/setting/notification/switch", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 权限配置详情 返回当前用户的好友验证、搜索、直接群邀请、性别展示和个人简介展示权限；首次查询会自动创建默认配置，五项默认全部开启。 POST /v1/setting/permission/detail */
export async function postV1SettingPermissionDetail(options) {
    return request("/v1/setting/permission/detail", {
        method: "POST",
        ...(options || {}),
    });
}
/** 权限开关 按权限类型打开或关闭当前用户的权限配置，保存后对应的好友申请、搜索、直接群邀请和资料展示逻辑立即生效。 POST /v1/setting/permission/switch */
export async function postV1SettingPermissionSwitch(body, options) {
    return request("/v1/setting/permission/switch", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
//# sourceMappingURL=shezhi.js.map