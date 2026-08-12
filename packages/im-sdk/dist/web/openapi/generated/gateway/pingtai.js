// @ts-ignore
/* eslint-disable */
import request from "../../request.js";
/** 检查客户端版本 客户端启动时检查是否需要更新；未登录也可调用。 POST /v1/platform/client-version/check */
export async function postV1PlatformClientVersionCheck(body, options) {
    return request("/v1/platform/client-version/check", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 获取平台条款 按业务键获取已启用的平台条款；未登录也可调用。 POST /v1/platform/term/get */
export async function postV1PlatformTermGet(body, options) {
    return request("/v1/platform/term/get", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
//# sourceMappingURL=pingtai.js.map