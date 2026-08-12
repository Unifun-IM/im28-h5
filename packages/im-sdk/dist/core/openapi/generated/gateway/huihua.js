// @ts-ignore
/* eslint-disable */
import request from "../../request.js";
/** 确认消息送达 客户端收到消息后上报已送达的最大消息序号。设备 ID 由网关从当前已鉴权 Session 注入，请求体不能指定其他设备。 POST /v1/conversation/ack */
export async function postV1ConversationAck(body, options) {
    return request("/v1/conversation/ack", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 设置会话归档 设置或取消当前用户视角下的会话归档；普通会话列表默认不返回归档会话，可通过归档列表单独查看。 POST /v1/conversation/archive */
export async function postV1ConversationArchive(body, options) {
    return request("/v1/conversation/archive", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 获取归档会话列表 获取当前用户已归档的会话列表，排序规则与普通会话列表一致。 POST /v1/conversation/archive/list */
export async function postV1ConversationArchiveList(body, options) {
    return request("/v1/conversation/archive/list", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 设置消息自动删除 设置或关闭会话级消息自动删除，只影响设置后新发送的消息。单聊双方都可设置；群聊仅群主或管理员可设置。配置变化时写入并推送 type=1701、event_type=conversation_auto_delete_changed 的会话消息；system.extra 包含 operator_user_id、operator_nickname、auto_delete_seconds 和 enabled，前端据此生成展示文案。 POST /v1/conversation/auto-delete/update */
export async function postV1ConversationAutoDeleteUpdate(body, options) {
    return request("/v1/conversation/auto-delete/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 清空会话记录 清空历史可见范围，不删除会话关系；scope=self 仅自己，scope=both 单聊双方，scope=all_members 群主或有清空群聊消息权限的管理员清空所有群成员。单聊清空后暂时隐藏，群聊保留会话入口并清空最后一条消息和未读数。 POST /v1/conversation/clear */
export async function postV1ConversationClear(body, options) {
    return request("/v1/conversation/clear", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 获取会话详情 根据会话 ID 获取当前用户视角下的会话详情。 POST /v1/conversation/get */
export async function postV1ConversationDetail(body, options) {
    return request("/v1/conversation/get", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 获取会话列表 获取当前用户可见的未归档会话列表，置顶会话优先按 pinned_sort 倒排，其余按会话最新活跃时间排序。 POST /v1/conversation/list */
export async function postV1ConversationList(body, options) {
    return request("/v1/conversation/list", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 设置会话免打扰 设置或取消当前用户视角下的会话免打扰；不影响消息记录、未读数和 WebSocket 投递，只影响客户端提醒展示。 POST /v1/conversation/mute */
export async function postV1ConversationMute(body, options) {
    return request("/v1/conversation/mute", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 设置会话置顶 设置或取消当前用户视角下的会话置顶；新置顶默认进入置顶区顶部。 POST /v1/conversation/pin */
export async function postV1ConversationPin(body, options) {
    return request("/v1/conversation/pin", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 调整置顶会话顺序 调整当前用户置顶区内的会话顺序；conversation_id 和相邻会话 ID 必须都是当前用户已置顶会话，后端根据相邻会话计算 pinned_sort。 POST /v1/conversation/pin-sort */
export async function postV1ConversationPinSort(body, options) {
    return request("/v1/conversation/pin-sort", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 标记会话已读 前端可传 read_seq 精确上报当前用户已读到的消息序号；不传或传 0 时保持旧逻辑，标记到服务端当前最新消息序号。 POST /v1/conversation/read */
export async function postV1ConversationRead(body, options) {
    return request("/v1/conversation/read", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 查看会话设置 查询当前用户对指定会话的设置，例如置顶、免打扰、手动未读和自动删除消息配置；不返回消息、用户或群资料。 POST /v1/conversation/setting/detail */
export async function postV1ConversationSettingDetail(body, options) {
    return request("/v1/conversation/setting/detail", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 同步会话变更（待废弃） 旧版账号级会话同步接口，仅供已发布客户端迁移期间使用。新客户端必须改用 /v1/updates/get-difference，并持久化账号级 PTS。 POST /v1/conversation/sync */
export async function postV1ConversationSync(body, options) {
    return request("/v1/conversation/sync", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 标记会话未读 设置或取消当前用户视角下的手动未读标记；不回退真实已读游标，不改变真实未读数。 POST /v1/conversation/unread-mark */
export async function postV1ConversationUnreadMark(body, options) {
    return request("/v1/conversation/unread-mark", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 发起单聊 传入对方用户 ID，返回与该用户的单聊会话；如果双方还没有单聊会话，服务端会自动创建。 POST /v1/direct-conversation/open */
export async function postV1DirectConversationOpen(body, options) {
    return request("/v1/direct-conversation/open", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 查询已读状态 查询指定用户在当前会话中的已读位置，常用于展示群聊已读情况。 POST /v1/read-state/get */
export async function postV1ConversationReadState(body, options) {
    return request("/v1/read-state/get", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
//# sourceMappingURL=huihua.js.map