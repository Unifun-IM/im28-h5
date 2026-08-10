// @ts-ignore
/* eslint-disable */
import request from "../../request.js";
/** 设置群管理员权限 仅群主可设置管理员是否允许发消息、修改群资料、手动禁言、移除成员、邀请好友加群、审核、清空群聊消息。 POST /v1/group/admin-permission/update */
export async function postV1GroupAdminPermissionUpdate(body, options) {
    return request("/v1/group/admin-permission/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 批量取消群管理员 仅群主可操作；目标管理员会变为普通成员；不能取消群主。 POST /v1/group/admin/cancel */
export async function postV1GroupAdminCancel(body, options) {
    return request("/v1/group/admin/cancel", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 分页获取群管理员 仅群内有效成员可调用。只返回角色为管理员的成员，不包含群主；按成为管理员时间升序排列，最早成为管理员的排在最前。 POST /v1/group/admin/list */
export async function postV1GroupAdminList(body, options) {
    return request("/v1/group/admin/list", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 批量设置群管理员 仅群主可操作；目标必须是群内正常成员；不能设置群主。 POST /v1/group/admin/set */
export async function postV1GroupAdminSet(body, options) {
    return request("/v1/group/admin/set", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 标记群公告已读 提交前端实际展示的公告版本，只执行标记已读操作。提交旧版本仍成功，已读版本不会回退。 POST /v1/group/announcement/read */
export async function postV1GroupAnnouncementRead(body, options) {
    return request("/v1/group/announcement/read", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 查询群公告已读状态 无副作用地查询当前公告版本、当前用户已读版本以及是否已读。 POST /v1/group/announcement/read-status */
export async function postV1GroupAnnouncementReadStatus(body, options) {
    return request("/v1/group/announcement/read-status", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 同意入群申请 群主或管理员同意申请/邀请后，申请人或被邀请人正式加入群聊。 POST /v1/group/application/accept */
export async function postV1GroupApplicationAccept(body, options) {
    return request("/v1/group/application/accept", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 申请加入群聊 用户主动申请入群；群开启入群审核时生成待审核申请，并通过 type=1503 的个人实时通知提醒群主和有审核权限的管理员；未开启时直接加入群聊并返回 accepted 申请记录。 POST /v1/group/application/apply */
export async function postV1GroupApplicationApply(body, options) {
    return request("/v1/group/application/apply", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 获取待审核入群申请 汇总当前用户作为群主，或作为已获审核权限管理员的全部群待处理主动入群申请。 POST /v1/group/application/audit/list */
export async function postV1GroupApplicationAuditList(body, options) {
    return request("/v1/group/application/audit/list", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 批量邀请用户入群 邀请不会直接入群，会为每个被邀请用户生成待群主或管理员审核的邀请记录。目标用户中任一人关闭 allow_group_invite 时整批失败，不创建任何申请，返回 code=100004，message 按请求顺序包含全部受限用户昵称。 POST /v1/group/application/invite */
export async function postV1GroupApplicationInvite(body, options) {
    return request("/v1/group/application/invite", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 获取入群申请列表 群主或管理员查看全量主动申请和邀请入群记录；普通用户只返回与自己相关的申请或邀请。 POST /v1/group/application/list */
export async function postV1GroupApplicationList(body, options) {
    return request("/v1/group/application/list", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 拒绝入群申请 群主或管理员拒绝主动申请或邀请入群记录。 POST /v1/group/application/reject */
export async function postV1GroupApplicationReject(body, options) {
    return request("/v1/group/application/reject", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 共同群聊 返回当前用户和目标用户共同加入的群列表。 POST /v1/group/common/list */
export async function postV1GroupCommonList(body, options) {
    return request("/v1/group/common/list", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 创建群 初始成员中任一用户关闭 allow_group_invite 时整批失败，不创建群，返回 code=100004，message 按请求顺序包含全部受限用户昵称。 POST /v1/group/create */
export async function postV1GroupsCreate(body, options) {
    return request("/v1/group/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 群主解散群 POST /v1/group/dismiss */
export async function postV1GroupsDismiss(body, options) {
    return request("/v1/group/dismiss", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 群成员获取完整群信息 只供存在群成员记录的用户使用，返回完整群设置和当前用户权限。 POST /v1/group/get */
export async function postV1GroupDetail(body, options) {
    return request("/v1/group/get", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 主动退群 群主退出时自动转让给最早成为管理员的活跃成员，没有管理员时返回 100008。clear_history=true 时，全局清除退出用户在该群退出前发送的历史消息，并通过 group_member_left 事件通知客户端清理本地历史。 POST /v1/group/leave */
export async function postV1GroupsLeave(body, options) {
    return request("/v1/group/leave", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 邀请成员入群 普通群最多 200 人，大群最多 30000 人；已在群内的成员会被忽略，达到上限返回 100026。目标用户中任一人关闭 allow_group_invite 时整批失败，返回 code=100004，message 按请求顺序包含全部受限用户昵称。 POST /v1/group/member/invite */
export async function postV1GroupMemberInvite(body, options) {
    return request("/v1/group/member/invite", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 分页获取群成员 POST /v1/group/member/list */
export async function postV1GroupMemberList(body, options) {
    return request("/v1/group/member/list", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 设置群成员禁言 传入 mute_until 设置单成员禁言到期时间；不传或空字符串表示取消单独禁言。 POST /v1/group/member/mute/update */
export async function postV1GroupMemberMuteUpdate(body, options) {
    return request("/v1/group/member/mute/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 修改我的群昵称 只能修改当前登录用户自己的群昵称；空字符串表示清除。普通成员受群设置 allow_member_nickname 控制。 POST /v1/group/member/nickname/update */
export async function postV1GroupMemberNicknameUpdate(body, options) {
    return request("/v1/group/member/nickname/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 批量移除群成员 POST /v1/group/member/remove */
export async function postV1GroupsMembersRemove(body, options) {
    return request("/v1/group/member/remove", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 设置群级禁言 支持全体禁言、普通成员禁言和群发言频率配置；未传字段保持原值。 POST /v1/group/mute/update */
export async function postV1GroupMuteUpdate(body, options) {
    return request("/v1/group/mute/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 我的群列表 返回当前用户加入的群列表。 POST /v1/group/my/list */
export async function postV1GroupMyList(body, options) {
    return request("/v1/group/my/list", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 群主转让 当前用户必须是群主；新群主必须是群内正常成员。转让成功后原群主变为普通成员。 POST /v1/group/owner/transfer */
export async function postV1GroupOwnerTransfer(body, options) {
    return request("/v1/group/owner/transfer", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 获取群公开信息 供陌生人查看群公开资料，同时返回当前用户成员状态和待处理申请状态。 POST /v1/group/public/get */
export async function postV1GroupPublicDetail(body, options) {
    return request("/v1/group/public/get", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 群搜索 只传 keyword；群 ID 精确匹配，群名称前缀匹配，最多返回 20 条公开摘要。 POST /v1/group/search */
export async function postV1GroupSearch(body, options) {
    return request("/v1/group/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 更新群设置 更新入群验证、禁言、发言频率、群内加好友、普通成员邀请和群昵称开关；未传字段保持原值。自动删除仍使用会话自动删除接口。 POST /v1/group/setting/update */
export async function postV1GroupSettingUpdate(body, options) {
    return request("/v1/group/setting/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
/** 更新群资料 群名称、头像、简介和公告分别写入独立群消息。名称使用 1520/group_name_changed，头像使用 1502/group_info_changed，简介使用 1521/group_description_changed，公告使用 1519/group_announcement_changed；各事件 extra 均包含 operator_user_id 和 operator_nickname，前端根据 type/event_type 和结构化字段生成文案，不依赖 system.text。一次请求修改多项时会产生多条消息。 POST /v1/group/update */
export async function postV1GroupsUpdate(body, options) {
    return request("/v1/group/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    });
}
//# sourceMappingURL=apIqunliao.js.map