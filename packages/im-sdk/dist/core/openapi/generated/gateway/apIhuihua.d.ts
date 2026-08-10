/** 确认消息送达 客户端收到消息后上报已送达的最大消息序号。 POST /v1/conversation/ack */
export declare function postV1ConversationAck(body: GatewayOpenAPI.AckConversationRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.ConversationCursorEnvelope>;
/** 设置会话归档 设置或取消当前用户视角下的会话归档；普通会话列表默认不返回归档会话，可通过归档列表单独查看。 POST /v1/conversation/archive */
export declare function postV1ConversationArchive(body: GatewayOpenAPI.ArchiveConversationRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.ConversationCursorEnvelope>;
/** 获取归档会话列表 获取当前用户已归档的会话列表，排序规则与普通会话列表一致。 POST /v1/conversation/archive/list */
export declare function postV1ConversationArchiveList(body: GatewayOpenAPI.ListConversationRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.ListConversationEnvelope>;
/** 设置消息自动删除 设置或关闭会话级消息自动删除，只影响设置后新发送的消息。单聊双方都可设置；群聊仅群主或管理员可设置。配置变化时写入并推送 type=1701、event_type=conversation_auto_delete_changed 的会话消息；system.extra 包含 operator_user_id、operator_nickname、auto_delete_seconds 和 enabled，前端据此生成展示文案。 POST /v1/conversation/auto-delete/update */
export declare function postV1ConversationAutoDeleteUpdate(body: GatewayOpenAPI.UpdateConversationAutoDeleteRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.DetailConversationEnvelope>;
/** 清空会话记录 清空历史可见范围，不删除会话关系；scope=self 仅自己，scope=both 单聊双方，scope=all_members 群主或有清空群聊消息权限的管理员清空所有群成员。单聊清空后暂时隐藏，群聊保留会话入口并清空最后一条消息和未读数。 POST /v1/conversation/clear */
export declare function postV1ConversationClear(body: GatewayOpenAPI.ClearConversationRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.ConversationCursorEnvelope>;
/** 获取会话详情 根据会话 ID 获取当前用户视角下的会话详情。 POST /v1/conversation/get */
export declare function postV1ConversationDetail(body: GatewayOpenAPI.DetailConversationRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.DetailConversationEnvelope>;
/** 获取会话列表 获取当前用户可见的未归档会话列表，置顶会话优先按 pinned_sort 倒排，其余按会话最新活跃时间排序。 POST /v1/conversation/list */
export declare function postV1ConversationList(body: GatewayOpenAPI.ListConversationRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.ListConversationEnvelope>;
/** 设置会话免打扰 设置或取消当前用户视角下的会话免打扰；不影响消息记录、未读数和 WebSocket 投递，只影响客户端提醒展示。 POST /v1/conversation/mute */
export declare function postV1ConversationMute(body: GatewayOpenAPI.MuteConversationRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.ConversationCursorEnvelope>;
/** 设置会话置顶 设置或取消当前用户视角下的会话置顶；新置顶默认进入置顶区顶部。 POST /v1/conversation/pin */
export declare function postV1ConversationPin(body: GatewayOpenAPI.PinConversationRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.ConversationCursorEnvelope>;
/** 调整置顶会话顺序 调整当前用户置顶区内的会话顺序；conversation_id 和相邻会话 ID 必须都是当前用户已置顶会话，后端根据相邻会话计算 pinned_sort。 POST /v1/conversation/pin-sort */
export declare function postV1ConversationPinSort(body: GatewayOpenAPI.SortPinnedConversationRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.ConversationCursorEnvelope>;
/** 标记会话已读 前端可传 read_seq 精确上报当前用户已读到的消息序号；不传或传 0 时保持旧逻辑，标记到服务端当前最新消息序号。 POST /v1/conversation/read */
export declare function postV1ConversationRead(body: GatewayOpenAPI.MarkReadRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.ConversationCursorEnvelope>;
/** 查看会话设置 查询当前用户对指定会话的设置，例如置顶、免打扰、手动未读和自动删除消息配置；不返回消息、用户或群资料。 POST /v1/conversation/setting/detail */
export declare function postV1ConversationSettingDetail(body: GatewayOpenAPI.DetailConversationSettingRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.DetailConversationSettingEnvelope>;
/** 同步会话变更 客户端离线后优先同步有变化的会话，再按消息序号差值批量拉取缺失消息。 POST /v1/conversation/sync */
export declare function postV1ConversationSync(body: GatewayOpenAPI.SyncConversationRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.SyncConversationEnvelope>;
/** 标记会话未读 设置或取消当前用户视角下的手动未读标记；不回退真实已读游标，不改变真实未读数。 POST /v1/conversation/unread-mark */
export declare function postV1ConversationUnreadMark(body: GatewayOpenAPI.MarkConversationUnreadRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.ConversationCursorEnvelope>;
/** 发起单聊 传入对方用户 ID，返回与该用户的单聊会话；如果双方还没有单聊会话，服务端会自动创建。 POST /v1/direct-conversation/open */
export declare function postV1DirectConversationOpen(body: GatewayOpenAPI.OpenDirectConversationRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.OpenDirectConversationEnvelope>;
/** 查询已读状态 查询指定用户在当前会话中的已读位置，常用于展示群聊已读情况。 POST /v1/read-state/get */
export declare function postV1ConversationReadState(body: GatewayOpenAPI.ConversationReadStateRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.ConversationReadStateEnvelope>;
//# sourceMappingURL=apIhuihua.d.ts.map