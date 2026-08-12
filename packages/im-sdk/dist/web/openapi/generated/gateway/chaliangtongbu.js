// @ts-ignore
/* eslint-disable */
import request from "../../request.js";
/** 获取会话差量 使用会话级 `pts=msg_seq`、`qts=update_seq` 同时补拉新消息以及编辑、删除更新。

`users` 是本批消息涉及的发送者和转发来源用户资料，可通过 `sender_id` 或 `forward_origin.user_id` 关联。`messages_more` 和 `updates_more` 分别表示消息流、更新流是否还有下一页；任一为 true 时 `has_more=true`，继续使用响应中的 `state.pts/state.qts` 请求。

客户端必须在同一个本地事务中应用 `new_messages`、`message_updates` 并保存新游标。
 POST /v1/updates/get-conversation-difference */
export async function postV1UpdatesGetConversationDifference(body, options) {
    return request("/v1/updates/get-conversation-difference", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 获取账号差量 按账号级 `pts` 拉取变化的会话状态。

`has_more=true` 时返回 `intermediate_state` 和 `next_page_token`，下一页必须把两者成对传回，不能混用不同同步轮次的值。token 内部固定本轮起始游标，因此同一 `pts` 下多个会话跨页时不会漏数据。

最后一页返回 `state` 且不再返回 `intermediate_state`。客户端应在同一个本地事务中应用本页 `updates` 并保存对应 state，整轮完成后持久化最终 `state.pts`。
 POST /v1/updates/get-difference */
export async function postV1UpdatesGetDifference(body, options) {
    return request("/v1/updates/get-difference", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
//# sourceMappingURL=chaliangtongbu.js.map