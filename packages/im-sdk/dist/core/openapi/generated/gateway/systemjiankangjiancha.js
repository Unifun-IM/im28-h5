// @ts-ignore
/* eslint-disable */
import request from "../../request.js";
/** 存活检查 GET /healthz */
export async function getHealthz(options) {
    return request("/healthz", {
        method: "GET",
        ...(options || {}),
    });
}
/** 就绪检查 GET /readyz */
export async function getReadyz(options) {
    return request("/readyz", {
        method: "GET",
        ...(options || {}),
    });
}
//# sourceMappingURL=systemjiankangjiancha.js.map