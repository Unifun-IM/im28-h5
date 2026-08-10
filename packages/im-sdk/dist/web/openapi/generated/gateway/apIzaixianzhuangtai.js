// @ts-ignore
/* eslint-disable */
import request from "../../request.js";
/** 批量查询用户在线状态 最多查询 100 个用户；在线状态来自 Push Gateway 的分片 Redis Presence 读模型。 POST /v1/presence/list */
export async function postV1PresenceList(body, options) {
    return request("/v1/presence/list", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
//# sourceMappingURL=apIzaixianzhuangtai.js.map