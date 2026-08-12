// @ts-ignore
/* eslint-disable */
import request from "../../request.js";
/** 拉黑用户 拉黑只是一种单向屏蔽状态，不删除好友关系；拉黑后双方仍可出现在好友列表，但会限制好友申请、打开新单聊和继续单聊发送等行为。 POST /v1/blacklist/add */
export async function postV1BlacklistAdd(body, options) {
    return request("/v1/blacklist/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 黑名单列表 POST /v1/blacklist/list */
export async function postV1BlacklistList(body, options) {
    return request("/v1/blacklist/list", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 解除拉黑 只移除当前用户对目标用户的拉黑状态，不额外创建、删除或恢复好友关系；好友关系保持原状。 POST /v1/blacklist/remove */
export async function postV1BlacklistRemove(body, options) {
    return request("/v1/blacklist/remove", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 同意好友申请 POST /v1/friend/application/accept */
export async function postV1FriendsApplicationsAccept(body, options) {
    return request("/v1/friend/application/accept", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 取消好友申请 POST /v1/friend/application/cancel */
export async function postV1FriendsApplicationsCancel(body, options) {
    return request("/v1/friend/application/cancel", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 好友申请列表 POST /v1/friend/application/list */
export async function postV1FriendApplicationList(body, options) {
    return request("/v1/friend/application/list", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 标记好友申请已读 POST /v1/friend/application/read */
export async function postV1FriendsApplicationsRead(body, options) {
    return request("/v1/friend/application/read", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 拒绝好友申请 POST /v1/friend/application/reject */
export async function postV1FriendsApplicationsReject(body, options) {
    return request("/v1/friend/application/reject", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 好友申请未读数 POST /v1/friend/application/unread-count */
export async function postV1FriendsApplicationsUnreadCount(body, options) {
    return request("/v1/friend/application/unread-count", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 发起好友申请 POST /v1/friend/apply */
export async function postV1FriendsApply(body, options) {
    return request("/v1/friend/apply", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 删除好友 双向解除好友关系，并按 clear_scope 清空聊天记录。会投递 friend_deleted 和 conversation_cleared 两类个人通知；没有既有单聊时只投递好友关系通知。 POST /v1/friend/delete */
export async function postV1FriendsDelete(body, options) {
    return request("/v1/friend/delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 好友详情 POST /v1/friend/detail */
export async function postV1FriendDetail(body, options) {
    return request("/v1/friend/detail", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 好友列表 POST /v1/friend/list */
export async function postV1FriendList(body, options) {
    return request("/v1/friend/list", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 修改好友资料 POST /v1/friend/profile/update */
export async function postV1FriendProfileUpdate(body, options) {
    return request("/v1/friend/profile/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 标记星标好友 设置或取消当前用户对该好友的星标标记。 POST /v1/friend/star/update */
export async function postV1FriendStarUpdate(body, options) {
    return request("/v1/friend/star/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
//# sourceMappingURL=tongxunlu.js.map