/** 导出跨端共用的群创建 facade 与人数约束。 */
export { canCreateIMGroupWithMemberCount, createIMGroupCreationSync, IM_GROUP_CREATION_MAX_MEMBER_COUNT, IM_GROUP_CREATION_MIN_MEMBER_COUNT, } from './group-creation.js';
/** 导出群申请审核 facade。 */
export { createIMGroupApplicationSync, createWebIMGroupApplicationSync, } from './group-application-sync.js';
/** 导出群管理权限投影。 */
export { resolveIMGroupManagementPermissions } from './group-management-permissions.js';
/** 导出群管理员与群主变更能力。 */
export { cancelIMGroupAdmins, filterIMGroupAdminCandidates, filterIMGroupOwnerTransferCandidates, IM_GROUP_ADMIN_LIMIT, setIMGroupAdmins, transferIMGroupOwner, } from './group-admin-owner.js';
/** 导出群设置与禁言 facade。 */
export { createIMGroupManagementSync, updateIMGroupMemberMute, updateIMGroupMute, updateIMGroupSettings, } from './group-settings-mute.js';
/** 导出群退出与解散 facade。 */
export { createIMGroupLifecycleSync, dismissIMGroup, leaveIMGroup, selectIMEarliestGroupAdmin, } from './group-lifecycle.js';
/** 导出当前账号的群列表 facade。 */
export { createIMJoinedGroupSync, createWebIMJoinedGroupSync } from './joined-group-sync.js';
/** 导出群模式归一化能力。 */
export { isIMNormalGroupMode, normalizeIMGroupMode } from './group-mode.js';
/** 导出群公告发布、已读与权限能力。 */
export { buildIMGroupAnnouncementMessageText, canUpdateIMGroupAnnouncement, getIMGroupAnnouncementReadStatus, IM_GROUP_ANNOUNCEMENT_MAX_LENGTH, markIMGroupAnnouncementRead, publishIMGroupAnnouncement, } from './group-announcement.js';
/** 导出群公告实时收敛能力。 */
export { applyIMGroupAnnouncementRealtime, parseIMGroupAnnouncementRealtime, } from './group-announcement-realtime.js';
/** 导出群资料更新能力。 */
export { canUpdateIMGroupProfile, IM_GROUP_INTRODUCTION_MAX_LENGTH, updateIMGroupAvatar, updateIMGroupIntroduction, updateIMGroupName, } from './group-profile-update.js';
/** 导出群成员同步 facade。 */
export { createIMGroupMemberSync, createWebIMGroupMemberSync } from './group-member-sync.js';
/** 导出群成员与提及 facade。 */
export { createIMGroupMentionSync } from './group-mention.js';
/** 导出群成员邀请能力。 */
export { filterIMInvitableGroupContacts, inviteIMGroupMembers, } from './group-member-invitation.js';
/** 导出群成员移除能力。 */
export { filterIMRemovableGroupMembers, removeIMGroupMembers, } from './group-member-removal.js';
/** 导出按群身份打开规范会话的能力。 */
export { openIMGroupConversation } from './group-conversation-open.js';
//# sourceMappingURL=index.js.map