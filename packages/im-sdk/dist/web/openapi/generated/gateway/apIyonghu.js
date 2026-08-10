// @ts-ignore
/* eslint-disable */
import request from "../../request.js";
/** 分享名片 给多个用户分别发送一条名片消息；若单聊会话不存在会自动创建。接收目标不能是当前用户，也不能是名片用户。 POST /v1/message/card/share */
export async function postV1MessageCardShare(body, options) {
    return request("/v1/message/card/share", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 设置账号密码 当前用户首次设置账号和密码；如果当前用户已有账号或密码，直接返回资源已存在。 POST /v1/user/account-password/set */
export async function postV1UserAccountPasswordSet(body, options) {
    return request("/v1/user/account-password/set", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 批量获取用户资料 POST /v1/user/batch-detail */
export async function postV1UserBatchDetail(body, options) {
    return request("/v1/user/batch-detail", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 绑定手机号或邮箱 账号登录后如果用户没有绑定手机号或邮箱，前端引导调用本接口补绑；请求使用 `type + account`，验证码当前阶段固定为 `666666`。 POST /v1/user/contact/bind */
export async function postV1UsersContactBind(body, options) {
    return request("/v1/user/contact/bind", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 当前用户详情 使用当前登录 token 获取自己的用户资料；请求体不需要传 user_id。 POST /v1/user/current/detail */
export async function postV1UserCurrentDetail(options) {
    return request("/v1/user/current/detail", {
        method: "POST",
        ...(options || {}),
    });
}
/** 用户详情 按用户 ID 查询用户资料，并返回当前登录用户与目标用户是否为好友关系。 POST /v1/user/detail */
export async function postV1UserDetail(body, options) {
    return request("/v1/user/detail", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 修改邮箱 验证新邮箱后替换当前用户邮箱。邮箱验证码在开发阶段固定为 `666666`。 POST /v1/user/email/update */
export async function postV1UserEmailUpdate(body, options) {
    return request("/v1/user/email/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 修改手机号 验证新手机号后替换当前用户手机号。当前仅支持 +86，大陆手机号验证码在开发阶段固定为 `666666`。 POST /v1/user/phone/update */
export async function postV1UserPhoneUpdate(body, options) {
    return request("/v1/user/phone/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 用户搜索 POST /v1/user/search */
export async function postV1UserSearch(body, options) {
    return request("/v1/user/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 修改用户资料 当前支持修改昵称和头像 URL；当前用户 ID 由 token 解析，请求体不需要传 user_id。 POST /v1/user/update-profile */
export async function postV1UsersUpdateProfile(body, options) {
    return request("/v1/user/update-profile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
//# sourceMappingURL=apIyonghu.js.map