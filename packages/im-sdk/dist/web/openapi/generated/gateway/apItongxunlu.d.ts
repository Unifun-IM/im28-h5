/** 拉黑用户 拉黑只是一种单向屏蔽状态，不删除好友关系；拉黑后双方仍可出现在好友列表，但会限制好友申请、打开新单聊和继续单聊发送等行为。 POST /v1/blacklist/add */
export declare function postV1BlacklistAdd(body: GatewayOpenAPI.BlacklistRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.ResponseBase>;
/** 黑名单列表 POST /v1/blacklist/list */
export declare function postV1BlacklistList(body: GatewayOpenAPI.ListBlacklistRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.ListBlacklistEnvelope>;
/** 解除拉黑 只移除当前用户对目标用户的拉黑状态，不额外创建、删除或恢复好友关系；好友关系保持原状。 POST /v1/blacklist/remove */
export declare function postV1BlacklistRemove(body: GatewayOpenAPI.BlacklistRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.ResponseBase>;
/** 同意好友申请 POST /v1/friend/application/accept */
export declare function postV1FriendsApplicationsAccept(body: GatewayOpenAPI.HandleFriendApplicationRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.AcceptFriendApplicationEnvelope>;
/** 取消好友申请 POST /v1/friend/application/cancel */
export declare function postV1FriendsApplicationsCancel(body: GatewayOpenAPI.HandleFriendApplicationRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.FriendApplicationEnvelope>;
/** 好友申请列表 POST /v1/friend/application/list */
export declare function postV1FriendApplicationList(body: GatewayOpenAPI.ListFriendApplicationRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.ListFriendApplicationEnvelope>;
/** 标记好友申请已读 POST /v1/friend/application/read */
export declare function postV1FriendsApplicationsRead(body: GatewayOpenAPI.MarkFriendApplicationsReadRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.ResponseBase>;
/** 拒绝好友申请 POST /v1/friend/application/reject */
export declare function postV1FriendsApplicationsReject(body: GatewayOpenAPI.HandleFriendApplicationRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.FriendApplicationEnvelope>;
/** 好友申请未读数 POST /v1/friend/application/unread-count */
export declare function postV1FriendsApplicationsUnreadCount(body: GatewayOpenAPI.FriendApplicationUnreadCountRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.FriendApplicationUnreadCountEnvelope>;
/** 发起好友申请 POST /v1/friend/apply */
export declare function postV1FriendsApply(body: GatewayOpenAPI.ApplyFriendRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.AcceptFriendApplicationEnvelope>;
/** 删除好友 双向解除好友关系，并按 clear_scope 清空聊天记录。会投递 friend_deleted 和 conversation_cleared 两类个人通知；没有既有单聊时只投递好友关系通知。 POST /v1/friend/delete */
export declare function postV1FriendsDelete(body: GatewayOpenAPI.DeleteFriendRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.ResponseBase>;
/** 好友详情 POST /v1/friend/detail */
export declare function postV1FriendDetail(body: GatewayOpenAPI.DetailFriendRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.DetailFriendEnvelope>;
/** 好友列表 POST /v1/friend/list */
export declare function postV1FriendList(body: GatewayOpenAPI.ListFriendRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.ListFriendEnvelope>;
/** 修改好友资料 POST /v1/friend/profile/update */
export declare function postV1FriendProfileUpdate(body: GatewayOpenAPI.UpdateFriendProfileRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.DetailFriendEnvelope>;
/** 标记星标好友 设置或取消当前用户对该好友的星标标记。 POST /v1/friend/star/update */
export declare function postV1FriendStarUpdate(body: GatewayOpenAPI.UpdateFriendStarRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.DetailFriendEnvelope>;
//# sourceMappingURL=apItongxunlu.d.ts.map