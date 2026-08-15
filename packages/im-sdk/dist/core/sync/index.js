/** 创建跨端共用的通话记录 cache/sync 服务，并保留 Web 兼容名称。 */
export { canCreateIMGroupWithMemberCount, createIMGroupCreationSync, IM_GROUP_CREATION_MAX_MEMBER_COUNT, IM_GROUP_CREATION_MIN_MEMBER_COUNT, } from './group-creation.js';
export { createIMCallRecordSync, createWebIMCallSync, mapIMCallTerminalSignalToRecord, } from './call-sync.js';
/** 创建 RN、Web 与 Desktop 共用的通话控制 facade。 */
export { createIMCallControlSync, normalizeIMCallServerURL } from './call-control.js';
/** 解析 RN、Web、Desktop 共用的单聊对端稳定身份。 */
export { resolveDirectConversationPeerUserID } from './direct-conversation-peer.js';
/** 创建认证账号绑定的黑名单读写 service。 */
export { createWebIMBlacklistSync } from './blacklist-sync.js';
/** 创建不复制资料或黑名单 owner 的单聊关系组合 facade。 */
export { createIMDirectChatRelationshipSync } from './direct-chat-relationship-sync.js';
/** 判断 realtime 通知是否要求重新读取好友与黑名单关系事实。 */
export { isIMRelationshipRealtimeEvent, isIMVerificationRealtimeEvent, } from './relationship-realtime.js';
/** 创建认证账号绑定的通讯录读取 service。 */
export { createWebIMContactSync } from './contact-sync.js';
/** 创建 RN、Web、Desktop 共用的联系人写动作 facade。 */
export { createIMContactActionsSync } from './contact-actions.js';
/** 创建认证账号绑定的好友申请 service。 */
export { createWebIMFriendApplicationSync } from './friend-application-sync.js';
/** 导出跨端统一的好友来源码、推断和展示规则。 */
export { formatIMFriendSourceType, IM_FRIEND_SOURCE_TYPE_EMAIL, IM_FRIEND_SOURCE_TYPE_GROUP, IM_FRIEND_SOURCE_TYPE_PHONE, IM_FRIEND_SOURCE_TYPE_USER_ID, inferIMFriendSourceTypeFromKeyword, } from './friend-source.js';
/** 创建认证账号绑定的群申请审核 service。 */
export { createWebIMGroupApplicationSync } from './group-application-sync.js';
/** 导出 RN、Web、Desktop 共用的群管理权限投影。 */
export { resolveIMGroupManagementPermissions } from './group-management-permissions.js';
/** 导出群管理员和群主变更的共享单次写入核心。 */
export { cancelIMGroupAdmins, filterIMGroupAdminCandidates, filterIMGroupOwnerTransferCandidates, IM_GROUP_ADMIN_LIMIT, setIMGroupAdmins, transferIMGroupOwner, } from './group-admin-owner.js';
/** 导出群设置与禁言的共享业务入口。 */
export { createIMGroupManagementSync, updateIMGroupMemberMute, updateIMGroupMute, updateIMGroupSettings, } from './group-settings-mute.js';
/** 导出群退出与解散的共享破坏性生命周期入口。 */
export { createIMGroupLifecycleSync, dismissIMGroup, leaveIMGroup, selectIMEarliestGroupAdmin, } from './group-lifecycle.js';
/** 创建认证账号绑定的 cache-first 我的群聊 service。 */
export { createWebIMJoinedGroupSync } from './joined-group-sync.js';
/** 导出跨端统一的群模式归一化与普通群判定。 */
export { isIMNormalGroupMode, normalizeIMGroupMode } from './group-mode.js';
/** 导出跨端共用的群公告发布、已读版本和权限合同。 */
export { buildIMGroupAnnouncementMessageText, canUpdateIMGroupAnnouncement, getIMGroupAnnouncementReadStatus, IM_GROUP_ANNOUNCEMENT_MAX_LENGTH, markIMGroupAnnouncementRead, publishIMGroupAnnouncement, } from './group-announcement.js';
/** 导出 type1519 跨端公告缓存收敛 helper。 */
export { applyIMGroupAnnouncementRealtime, parseIMGroupAnnouncementRealtime, } from './group-announcement-realtime.js';
/** 导出共享群资料权限和群昵称 success-only mutation。 */
export { canUpdateIMGroupProfile, IM_GROUP_INTRODUCTION_MAX_LENGTH, updateIMGroupAvatar, updateIMGroupIntroduction, updateIMGroupName, } from './group-profile-update.js';
/** 创建群成员 cache-first 同步服务。 */
export { createWebIMGroupMemberSync } from './group-member-sync.js';
/** 创建 RN、Web、Desktop 共用的群成员与提及 facade。 */
export { createIMGroupMentionSync } from './group-mention.js';
/** 导出群邀请候选过滤与单次写入核心。 */
export { filterIMInvitableGroupContacts, inviteIMGroupMembers, } from './group-member-invitation.js';
/** 导出群成员移除的候选过滤与单次写入核心。 */
export { filterIMRemovableGroupMembers, removeIMGroupMembers, } from './group-member-removal.js';
/** 导出 RN、Web、Desktop 共用的群成员名称优先级投影。 */
export { resolveIMGroupMemberDisplayName } from './sender-display-name.js';
/** 创建认证账号绑定的联系人资料与关系 action service。 */
export { createWebIMPeerProfileSync } from './peer-profile-sync.js';
/** 创建 RN、Web 与 Desktop 共用的用户在线状态 facade。 */
export { createIMUserPresenceSync, } from './user-presence.js';
/** 导出跨端共用的用户在线状态协议归一化规则。 */
export { normalizeIMUserPresence, normalizeIMUserPresenceIDs, normalizeIMUserPresencePayload, } from './user-presence-normalization.js';
/** 创建受认证账号约束的会话 cache/sync 服务。 */
export { createWebIMConversationSync } from './conversation-sync.js';
/** 创建跨端共用的账号内会话草稿持久化 facade。 */
export { createIMConversationDraftSync, readIMConversationDraftDocument, } from './conversation-draft.js';
/** 导出按群身份打开规范会话的共享能力。 */
export { openIMGroupConversation } from './group-conversation-open.js';
/** 导出新 Gateway Difference 原子同步 owner，供受控平台组合。 */
export { syncIMGatewayDifference } from './gateway-difference-sync.js';
/** 创建跨端共用的归档会话全分页与快照收敛 facade。 */
export { createIMConversationArchiveSync } from './conversation-archive-sync.js';
/** 创建跨端共用的会话列表动作 facade。 */
export { createIMConversationListActionsSync } from './conversation-list-actions.js';
/** 创建 RN、Web、Desktop 共用的会话历史清空 facade 与权限判断。 */
export { canIMGroupMemberClearAllMessages, createIMConversationClearSync, isIMConversationClearRealtime, } from './conversation-clear-sync.js';
/** 导出 RN/Web/Desktop 共用的中性会话设置 facade。 */
export { createIMConversationSettingsSync } from './conversation-settings.js';
/** 创建认证账号绑定的自定义表情 cache/sync 服务。 */
export { createWebIMCustomEmojiSync } from './custom-emoji-sync.js';
/** 创建消息 cache/history/send 服务。 */
export { createWebIMMessageSync } from './message-sync.js';
/** 创建 RN、Web、Desktop 共用的当前账号消息搜索 facade。 */
export { createIMMessageSearchSync } from './message-search.js';
/** 导出共享群聊提及发送函数。 */
export { sendWebIMMentionMessage } from './message-mention-send.js';
/** 创建 RN、Web 与 Desktop 共用的消息群发 facade。 */
export { createIMMessageBroadcastSync, IM_BROADCAST_MAX_TARGETS, } from './message-broadcast.js';
/** 导出共享批量转发执行函数。 */
export { forwardWebIMMessages } from './message-forward.js';
/** 导出多目标转发 shared owner 与目标上限。 */
export { forwardWebIMMessagesToTargets, IM_FORWARD_MAX_TARGETS, normalizeForwardConversationIDs, } from './message-forward-targets.js';
/** 导出共享转发来源与隐藏发送人能力判断。 */
export { canForwardWebIMMessage } from './message-forward-state.js';
/** 导出共享主动消息删除执行函数。 */
export { deleteWebIMMessages } from './message-delete.js';
/** 导出共享主动文本编辑执行函数与能力判断。 */
export { canEditWebIMTextMessage, editWebIMTextMessage, } from './message-edit.js';
/** 创建 RN、Web 与 Desktop 共用的主动消息 mutation facade。 */
export { createIMMessageMutationSync } from './message-mutations.js';
/** 导出 shared 失败消息重试能力判断。 */
export { WEB_IM_RETRYABLE_CONTENT_TYPES, canRetryWebIMMessage, } from './message-retry.js';
/** 创建受认证账号约束的当前资料读取 service。 */
export { createWebIMProfileSync } from './profile-sync.js';
/** 创建 runtime 唯一 realtime 持久化队列。 */
export { createWebIMRealtimeSync } from './realtime-sync.js';
/** 创建 RN、Web、Desktop 共用的 realtime 消息缓存收敛 facade。 */
export { createIMRealtimeMessageSync } from './realtime-message-sync.js';
/** 归一化 RN、Web、Desktop 共用的 realtime 消息包装。 */
export { normalizeIMRealtimeMessages } from './realtime-message-normalization.js';
/** 判断 realtime 包装是否要求执行缺口恢复。 */
export { hasDegradedMarker } from './realtime-event-data.js';
/** 归一化 RN、Web、Desktop 共用的通话终结消息包装。 */
export { normalizeIMCallTerminalSignals } from './call-terminal-signal.js';
/** 归一化 RN、Web、Desktop 共用的 RTC 全过程通知包装。 */
export { IM_CALL_REALTIME_SIGNAL_KEYS, normalizeIMCallRealtimeSignals, parseIMCallRealtimeSignal, } from './call-realtime-signal.js';
/** 导出来电生命周期的共享状态迁移与 pending 恢复。 */
export { createIMIncomingCallLifecycleState, dismissIMIncomingCall, reconcileIMPendingIncomingCall, reduceIMIncomingCallSignals, resetIMIncomingCallLifecycleState, } from './incoming-call-lifecycle.js';
/** 导出与 RN 一致的语音时长上限。 */
export { WEB_IM_AUDIO_MAX_DURATION_SECONDS } from './message-audio-send.js';
/** 导出跨 runtime 一致的媒体文件大小限制。 */
export { WEB_IM_FILE_MAX_BYTES, WEB_IM_IMAGE_MAX_BYTES, } from './message-media-send.js';
/** 导出与 RN 一致的视频文件大小限制。 */
export { WEB_IM_VIDEO_MAX_BYTES } from './message-video-send.js';
//# sourceMappingURL=index.js.map