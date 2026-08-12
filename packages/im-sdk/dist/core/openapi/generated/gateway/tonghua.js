// @ts-ignore
/* eslint-disable */
import request from "../../request.js";
/** 接听通话 当前用户必须是通话参与者。成功后返回被叫入房凭证；接听设备由当前已鉴权 Session 确定。 POST /v1/call/answer */
export async function postV1CallAnswer(body, options) {
    return request("/v1/call/answer", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 取消通话 主叫在被叫接听前取消通话。 POST /v1/call/cancel */
export async function postV1CallCancel(body, options) {
    return request("/v1/call/cancel", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 批量删除自己的通话记录 单次可删除 1 至 100 条已结束的通话记录。删除后仅当前用户的列表和详情不再展示这些记录，不影响对端用户，也不删除底层通话事实；重复删除按成功处理。任一通话不存在、当前用户不是参与人或通话尚未结束时整批失败，不会部分删除。 POST /v1/call/delete */
export async function postV1CallDelete(body, options) {
    return request("/v1/call/delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 获取通话详情 当前用户必须是通话参与者且未删除自己的记录。返回参与者、呼入呼出方向以及对端用户昵称和头像。 POST /v1/call/detail */
export async function postV1CallDetail(body, options) {
    return request("/v1/call/detail", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 挂断通话 通话任一参与者结束 ringing 或 active 状态的通话。 POST /v1/call/hangup */
export async function postV1CallHangup(body, options) {
    return request("/v1/call/hangup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 获取通话记录 返回当前用户参与的最近通话，可按单聊会话及接听结果筛选。answer_status=answered 表示已接通；missed 仅表示当前用户作为被叫时未接，不传表示全部。每条记录包含相对当前用户的 incoming/outgoing 方向、接听结果，并始终返回非当前用户一方的用户 ID、昵称和头像。 POST /v1/call/list */
export async function postV1CallList(body, options) {
    return request("/v1/call/list", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 查询当前待接来电 用户登录完成或 WebSocket 重连后调用。只返回当前用户作为被叫、状态仍为 ringing 的最新通话。 POST /v1/call/pending */
export async function postV1CallPending(body, options) {
    return request("/v1/call/pending", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 拒绝通话 被叫在 ringing 状态下拒绝通话。 POST /v1/call/reject */
export async function postV1CallReject(body, options) {
    return request("/v1/call/reject", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 发起音视频通话 仅支持单聊会话。服务端创建通话记录和 LiveKit 房间，并返回主叫入房凭证。主叫或被叫存在 ringing/active 通话时返回 100025。主叫忙时不创建记录；被叫忙时记录 missed/callee_busy 和一条最终通话摘要，但不创建 LiveKit 房间或发送通话过程信令。 POST /v1/call/start */
export async function postV1CallStart(body, options) {
    return request("/v1/call/start", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 刷新通话入房凭证 通话仍可加入且当前用户是参与者时，签发新的 LiveKit token。 POST /v1/call/token */
export async function postV1CallToken(body, options) {
    return request("/v1/call/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
//# sourceMappingURL=tonghua.js.map