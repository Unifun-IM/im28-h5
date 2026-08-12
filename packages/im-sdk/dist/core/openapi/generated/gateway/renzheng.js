// @ts-ignore
/* eslint-disable */
import request from "../../request.js";
/** 校验 token POST /v1/auth/check-token */
export async function postV1AuthCheckToken(body, options) {
    return request("/v1/auth/check-token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 退出登录 校验 access token 与 X-Device-ID 后，仅撤销当前设备的 Token Family，不影响该用户其他设备。 POST /v1/auth/logout */
export async function postV1AuthLogout(body, options) {
    return request("/v1/auth/logout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 修改密码 校验当前密码并设置新密码。临时账号首次登录后，服务端只允许访问本接口；修改成功会撤销当前 session，客户端需使用新密码重新登录。 POST /v1/auth/password/reset */
export async function postV1AuthPasswordReset(body, options) {
    return request("/v1/auth/password/reset", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 刷新 token X-Device-ID 必须与原 Session 绑定值一致。成功后 access token 和 refresh token 同时轮换，旧 refresh token 立即失效。 POST /v1/auth/refresh-token */
export async function postV1AuthRefreshToken(body, options) {
    return request("/v1/auth/refresh-token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 用户注册 POST /v1/auth/register */
export async function postV1AuthRegister(body, options) {
    return request("/v1/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 用户登录 POST /v1/auth/user-login */
export async function postV1AuthUserLogin(body, options) {
    return request("/v1/auth/user-login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
//# sourceMappingURL=renzheng.js.map