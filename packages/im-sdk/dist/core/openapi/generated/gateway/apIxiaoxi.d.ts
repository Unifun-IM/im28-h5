/** 批量删除同一会话的消息 一次删除同一会话内最多 100 条消息，每条操作独立幂等并返回独立业务结果。scope=self 可对自己或他人发送的消息执行，仅当前用户隐藏；scope=all 时，单聊双方可删除任意一方消息，群聊普通成员只能删除自己的消息，群主可删除任意成员消息，具备清理消息权限的管理员可删除其他成员消息。实时推送合并为一个 message.update.batch，离线同步仍使用 /v1/message/update/pull。顶层返回系统错误时，客户端应保持 batch_id 和所有 client_msg_id 不变并原样重试整批请求。 POST /v1/message/batch-delete */
export declare function postV1MessageBatchDelete(body: GatewayOpenAPI.BatchDeleteMessageRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.BatchDeleteMessageEnvelope>;
/** 批量转发多条消息到一个会话 按 items 顺序把最多 100 条源消息分别复制到同一个目标会话，再发送可选的 comment 补充文字。每条成功转发都有独立的 msg_id、msg_seq、client_msg_id 和 forward_origin，comment 是不带 forward_origin 的普通文本消息。接收端实时推送为一个 message.batch 帧，messages[] 顺序为全部转发消息在前、comment 在最后。顶层成功不代表每条都成功，应检查 data.list[].code 和 data.comment.code；全部转发失败时 comment 不发送。 POST /v1/message/batch-forward */
export declare function postV1MessageBatchForward(body: GatewayOpenAPI.BatchForwardMessageRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.BatchForwardMessageEnvelope>;
/** 批量拉取多个会话消息 用于离线恢复，减少客户端对多个会话逐个拉消息造成的接口调用放大。 POST /v1/message/batch-pull */
export declare function postV1MessagesBatchPull(body: GatewayOpenAPI.BatchPullMessagesRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.BatchPullMessagesEnvelope>;
/** 批量发送消息 将同一份新消息发送给最多 50 个好友或群聊，也支持通过 source_msg_id 批量转发。前端传好友用户 ID 或群 ID，服务端负责解析会话；每个目标会话分别生成独立的消息 ID 和消息序号。顶层成功不代表所有目标成功，应检查逐目标结果。 POST /v1/message/batch-send */
export declare function postV1MessageBatchSend(body: GatewayOpenAPI.BatchSendMessageRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.BatchSendMessageEnvelope>;
/** 拉取单个会话消息 POST /v1/message/pull */
export declare function postV1MessagesPull(body: GatewayOpenAPI.PullMessagesRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.PullMessagesEnvelope>;
/** 发送消息 client_msg_id 由客户端生成，用于发送重试和幂等去重。转发时传 source_msg_id，服务端复制源内容并生成 forward_origin，不信任客户端填写的来源信息。 POST /v1/message/send */
export declare function postV1MessagesSend(body: GatewayOpenAPI.SendMessageRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.SendMessageEnvelope>;
/** 编辑或删除消息 edit、delete 必须且只能传一种。编辑原地更新目标消息，不产生新 msg_id/msg_seq；delete.scope=self 仅当前用户隐藏且可操作会话内任意消息；scope=all 全局删除，单聊双方均可操作任意一方消息，群聊可操作自己的消息，群主或具备清理消息权限的管理员还可删除其他成员消息。 POST /v1/message/update */
export declare function postV1MessagesUpdate(body: GatewayOpenAPI.UpdateMessageRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.UpdateMessageEnvelope>;
/** 拉取消息编辑和删除更新 使用独立 update_seq 同步消息编辑和删除，不影响 msg_seq 和未读数。 POST /v1/message/update/pull */
export declare function postV1MessageUpdatesPull(body: GatewayOpenAPI.PullMessageUpdatesRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.PullMessageUpdatesEnvelope>;
//# sourceMappingURL=apIxiaoxi.d.ts.map