// @ts-ignore
/* eslint-disable */
import request from "../../request.js";
/** 添加别人发送的自定义表情 从 type=115 消息体取得 emoji_id，将对应底层资源加入当前用户列表。无需提交 URL，重复添加直接返回成功且不会改变原添加时间。 POST /v1/emoji/add */
export async function postV1EmojiAdd(body, options) {
    return request("/v1/emoji/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 批量删除我的自定义表情 删除当前用户与指定表情的关系，重复删除按成功处理。不会删除底层资源，也不会影响其他用户和历史消息中的表情。 POST /v1/emoji/batch-delete */
export async function postV1EmojiBatchDelete(body, options) {
    return request("/v1/emoji/batch-delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 从上传资源创建自定义表情 前端先通过通用上传凭证完成图片上传，再提交 object_keys。服务端为每个底层资源创建稳定 emoji_id，并自动加入当前用户列表；相同 object_key 重试不会重复创建。每次最多创建 20 个，用户最多保留 100 个。 POST /v1/emoji/create */
export async function postV1EmojiCreate(body, options) {
    return request("/v1/emoji/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 获取我的自定义表情 一次返回当前用户的全部自定义表情，不分页，固定按添加时间倒序排列。 POST /v1/emoji/list */
export async function postV1EmojiList(body, options) {
    return request("/v1/emoji/list", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
//# sourceMappingURL=zidingyibiaoqing.js.map