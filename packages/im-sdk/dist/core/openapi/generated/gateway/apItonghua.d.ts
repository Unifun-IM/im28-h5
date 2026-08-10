/** 接听通话 当前用户必须是通话参与者。成功后返回被叫入房凭证。 POST /v1/call/answer */
export declare function postV1CallAnswer(body: GatewayOpenAPI.AnswerCallRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.CallTokenEnvelope>;
/** 取消通话 主叫在被叫接听前取消通话。 POST /v1/call/cancel */
export declare function postV1CallCancel(body: GatewayOpenAPI.CallIDRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.CallEnvelope>;
/** 获取通话详情 当前用户必须是通话参与者。 POST /v1/call/detail */
export declare function postV1CallDetail(body: GatewayOpenAPI.CallIDRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.DetailCallEnvelope>;
/** 挂断通话 通话任一参与者结束 ringing 或 active 状态的通话。 POST /v1/call/hangup */
export declare function postV1CallHangup(body: GatewayOpenAPI.HangupCallRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.CallEnvelope>;
/** 获取通话记录 返回当前用户参与的最近通话，可按单聊会话及接听结果筛选。answer_status=answered 表示已接通；missed 仅表示当前用户作为被叫时未接，不传表示全部。 POST /v1/call/list */
export declare function postV1CallList(body: GatewayOpenAPI.ListCallRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.ListCallEnvelope>;
/** 查询当前待接来电 用户登录完成或 WebSocket 重连后调用。只返回当前用户作为被叫、状态仍为 ringing 的最新通话。 POST /v1/call/pending */
export declare function postV1CallPending(body: Record<string, any>, options?: Record<string, unknown>): Promise<GatewayOpenAPI.PendingCallEnvelope>;
/** 拒绝通话 被叫在 ringing 状态下拒绝通话。 POST /v1/call/reject */
export declare function postV1CallReject(body: GatewayOpenAPI.CallIDRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.CallEnvelope>;
/** 发起音视频通话 仅支持单聊会话。服务端创建通话记录和 LiveKit 房间，并返回主叫入房凭证。主叫或被叫存在 ringing/active 通话时返回 100025。主叫忙时不创建记录；被叫忙时记录 missed/callee_busy 和一条最终通话摘要，但不创建 LiveKit 房间或发送通话过程信令。 POST /v1/call/start */
export declare function postV1CallStart(body: GatewayOpenAPI.StartCallRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.CallTokenEnvelope>;
/** 刷新通话入房凭证 通话仍可加入且当前用户是参与者时，签发新的 LiveKit token。 POST /v1/call/token */
export declare function postV1CallToken(body: GatewayOpenAPI.CallIDRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.CallTokenEnvelope>;
/** LiveKit 通话事件回调 仅供 LiveKit Server 调用，不使用用户 Bearer Token。服务端验证 Authorization JWT 和原始请求体 SHA-256。 POST /v1/livekit/webhook */
export declare function postV1LiveKitWebhook(body: Record<string, any>, options?: Record<string, unknown>): Promise<any>;
/** 批量删除自己的通话记录 单次可删除 1 至 100 条已结束的通话记录。删除后仅当前用户的列表和详情不再展示这些记录，不影响对端用户，也不删除底层通话事实；重复删除按成功处理。任一通话不存在、当前用户不是参与人或通话尚未结束时整批失败，不会部分删除。 POST /v2/call/delete */
export declare function postV2CallDelete(body: GatewayOpenAPI.DeleteCallRecordsRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.ResponseBase>;
/** 获取新版通话详情 当前用户必须是通话参与者且未删除自己的记录。返回参与者、呼入呼出方向以及对端用户昵称和头像。 POST /v2/call/detail */
export declare function postV2CallDetail(body: GatewayOpenAPI.CallIDRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.DetailCallV2Envelope>;
/** 获取新版通话记录 返回当前用户参与的最近通话，可按单聊会话及接听结果筛选。answer_status=answered 表示已接通；missed 仅表示当前用户作为被叫时未接，不传表示全部。每条记录增加相对当前用户的 incoming/outgoing 方向、接听结果，并始终返回非当前用户一方的用户 ID、昵称和头像。V1 接口及响应结构保持不变。 POST /v2/call/list */
export declare function postV2CallList(body: GatewayOpenAPI.ListCallRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.ListCallV2Envelope>;
//# sourceMappingURL=apItonghua.d.ts.map