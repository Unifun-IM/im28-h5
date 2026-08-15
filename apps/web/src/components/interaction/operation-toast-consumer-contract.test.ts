import { describe, expect, it } from 'vitest';

import pickerSource from '../chat-target-picker/ChatTargetPickerModal.tsx?raw';
import contactProfileActionsSource from '../../pages/contacts/useContactProfileActions.ts?raw';
import friendApplicationSource from '../../pages/contacts/ContactFriendApplicationPage.tsx?raw';
import friendApplicationsSource from '../../pages/contacts/FriendApplicationsPage.tsx?raw';
import groupApplicationsSource from '../../pages/contacts/GroupApplicationsPage.tsx?raw';
import callsStateSource from '../../pages/calls/useCallsPageState.ts?raw';
import blacklistSource from '../../pages/me/MeBlacklistPage.tsx?raw';
import groupManagementSource from '../../pages/chat/GroupManagementPage.tsx?raw';
import groupMuteSource from '../../pages/chat/GroupMutePage.tsx?raw';
import groupSpeechSource from '../../pages/chat/GroupSpeechFrequencyPage.tsx?raw';
import groupRoleSource from '../../pages/chat/useGroupRoleRouteData.ts?raw';
import groupAdminsSource from '../../pages/chat/GroupAdminsPage.tsx?raw';
import groupAddAdminsSource from '../../pages/chat/GroupAddAdminsPage.tsx?raw';
import groupOwnerTransferSource from '../../pages/chat/GroupOwnerTransferPage.tsx?raw';
import groupInviteSource from '../../pages/chat/GroupInviteMembersPage.tsx?raw';
import groupRemoveSource from '../../pages/chat/GroupRemoveMembersPage.tsx?raw';
import createGroupSource from '../../pages/groups/useCreateGroupPageState.ts?raw';
import groupProfileSource from '../../pages/chat/GroupProfilePage.tsx?raw';
import groupTextSource from '../../pages/chat/GroupTextDetailPage.tsx?raw';
import chatSettingsSource from '../../pages/chat/ChatSettingsPage.tsx?raw';
import joinedGroupsSource from '../../pages/contacts/useJoinedGroupsPageState.ts?raw';
import notificationSource from '../../pages/me/MeNotificationSettingsPage.tsx?raw';
import profileEditorSource from '../../pages/me/MeProfileEditorPage.tsx?raw';
import qrApplySource from '../../pages/qr/GroupQRCodeApplyPage.tsx?raw';
import customEmojiManagerSource from '../../pages/chat/CustomEmojiManagerPage.tsx?raw';
import mediaPreviewSource from '../../pages/chat/ChatMediaPreviewOverlay.tsx?raw';
import permissionSettingsSource from '../../pages/me/MePermissionSettingsPage.tsx?raw';
import meSettingsSource from '../../pages/me/MeSettingsPage.tsx?raw';

/** 操作反馈契约阻止瞬时成功/失败重新占用页面布局。 */
describe('operation toast consumer contract', () => {
  it('共享目标弹窗只保留加载错误并将操作错误交给 Toast', () => {
    expect(pickerSource).toContain('<OperationToastFeedback error={operationError} />');
    expect(pickerSource).toContain('loadError ?');
    expect(pickerSource).not.toContain('{operationError ? <p');
  });

  it('资料与设置 mutation 使用成功和失败 Toast', () => {
    expect(profileEditorSource).toContain("toast.success('保存成功')");
    expect(profileEditorSource).toContain('toast.error(readEditorError(cause))');
    expect(notificationSource).toContain("toast.success('设置成功')");
    expect(notificationSource).toContain('toast.error(readNotificationError(cause))');
    expect(contactProfileActionsSource).toContain("toast.success('备注保存成功')");
  });

  it('好友与群申请使用 Toast 并保留加载错误状态', () => {
    expect(friendApplicationSource).toContain("toast.success('好友申请已发送')");
    expect(friendApplicationSource).toContain('setError(readApplicationError(cause, \'联系人资料加载失败\'))');
    expect(qrApplySource).toContain("toast.success('入群申请已发送')");
    expect(qrApplySource).toContain('setError(readGroupApplyError(cause, \'群资料加载失败\'))');
    expect(friendApplicationsSource).toContain("toast.success('已添加好友')");
    expect(friendApplicationsSource).toContain("toast.error(readFriendApplicationError(cause, '添加好友失败'))");
    expect(friendApplicationsSource).toContain("setError(readFriendApplicationError(cause, '好友验证加载失败'))");
    expect(groupApplicationsSource).toContain("toast.success(action === 'accept' ? '已通过' : '已拒绝')");
    expect(groupApplicationsSource).toContain("toast.error(readGroupApplicationError(cause, action === 'accept' ? '通过申请失败' : '拒绝申请失败'))");
    expect(groupApplicationsSource).toContain("setError(readGroupApplicationError(cause, '入群申请加载失败'))");
  });

  it('黑名单与通话删除使用 Toast 并保留加载错误状态', () => {
    expect(blacklistSource).toContain("toast.success('已移出黑名单')");
    expect(blacklistSource).toContain("toast.error(readBlacklistError(cause, '解除黑名单失败'))");
    expect(blacklistSource).toContain("setError(readBlacklistError(cause, '黑名单加载失败'))");
    expect(callsStateSource).toContain("toast.success('通话记录已删除')");
    expect(callsStateSource).toContain("toast.error(readError(cause, '通话记录删除失败'))");
    expect(callsStateSource).toContain('setError(readError(cause))');
  });

  it('群设置 mutation 使用 Toast 并保留 remote-only 恢复状态', () => {
    expect(groupManagementSource).toContain("toast.success('设置成功')");
    expect(groupManagementSource).toContain('toast.error(readGroupManagementError(cause))');
    expect(groupManagementSource).toContain("setError('服务端设置已更新，本地群资料尚未收敛；请稍后刷新。')");
    expect(groupMuteSource).toContain("toast.success('设置成功')");
    expect(groupMuteSource).toContain('toast.error(readMuteError(cause))');
    expect(groupMuteSource).toContain("setError('服务端设置已更新，本地成员快照尚未收敛；请稍后刷新。')");
    expect(groupSpeechSource).toContain("toast.success('设置成功')");
    expect(groupSpeechSource).toContain("toast.error(readActionError(cause, '发言频率保存失败'))");
    expect(groupSpeechSource).toContain("setError('服务端设置已更新，本地群资料尚未收敛；请稍后刷新。')");
  });

  it('群角色 hook 直接消费跨路由 Toast 并保留 remote-only 恢复状态', () => {
    expect(groupRoleSource).toContain("toast.success(role === 'admin' ? '管理员已添加' : '已移除管理员权限')");
    expect(groupRoleSource).toContain("toast.success('群主已转让')");
    expect(groupRoleSource).toContain("toast.error(readGroupRoleRouteError(cause, '群角色操作失败，请稍后重试'))");
    expect(groupRoleSource).toContain("toast.error(readGroupRoleRouteError(cause, '群主转让失败，请稍后重试'))");
    expect(groupRoleSource).toContain("setError('服务端操作已完成，本地成员快照尚未刷新；请稍后重新进入页面。')");
    expect(groupAdminsSource).not.toContain('<OperationToastFeedback');
    expect(groupAddAdminsSource).not.toContain('<OperationToastFeedback');
    expect(groupOwnerTransferSource).not.toContain('<OperationToastFeedback');
  });

  it('建群、邀请和移除成员使用 Toast 并保留 remoteCompleted 状态', () => {
    expect(groupInviteSource).toContain("toast.success(result.mode === 'application' ? '入群申请已发送' : '添加成员成功')");
    expect(groupInviteSource).toContain('toast.error(readGroupInviteError(cause))');
    expect(groupInviteSource).toContain("setError('邀请已提交到服务端，本地群成员尚未刷新；请返回群设置后下拉刷新。')");
    expect(groupRemoveSource).toContain("toast.success('成员已移除')");
    expect(groupRemoveSource).toContain('toast.error(readGroupRemoveError(cause))');
    expect(groupRemoveSource).toContain("setError('成员已在服务端移除，本地成员列表尚未刷新；请返回群设置后下拉刷新。')");
    expect(createGroupSource).toContain("toast.success('群聊创建成功')");
    expect(createGroupSource).toContain('handleCreateGroupFailure(cause, setRemoteCompleted, setError, toast.error)');
    expect(createGroupSource).toContain("notifyError(readCreateGroupError(cause, '创建群聊失败，请稍后重试'))");
    expect(createGroupSource).toContain("setError('群聊已在服务端创建，本地会话尚未保存；请返回会话列表并下拉刷新。')");
  });

  it('群资料和群文本 mutation 使用 Toast 并只保留加载错误', () => {
    expect(groupProfileSource).toContain("toast.success('群昵称已更新')");
    expect(groupProfileSource).toContain("toast.success('群头像已更新')");
    expect(groupProfileSource).toContain("toast.error(readGroupProfileError(cause, '群昵称更新失败'))");
    expect(groupProfileSource).toContain("setError(readGroupProfileError(cause, '群资料加载失败'))");
    expect(groupProfileSource).not.toContain('<OperationToastFeedback');
    expect(groupTextSource).toContain('toast.success(editor.successText)');
    expect(groupTextSource).toContain('toast.error(readGroupTextDetailError(cause, fallbackError))');
    expect(groupTextSource).toContain('error: readGroupTextDetailError(cause, fallbackError)');
    expect(groupTextSource).not.toContain('<OperationToastFeedback');
  });

  it('聊天设置 mutation 使用 Toast 并保留群生命周期 remote-only 状态', () => {
    expect(chatSettingsSource).toContain("toast.success('聊天记录已清空')");
    expect(chatSettingsSource).toContain("toast.success(requestedAction === 'leave' ? '已退出群聊' : '群聊已解散')");
    expect(chatSettingsSource).toContain('toast.error(readChatSettingsError(cause))');
    expect(chatSettingsSource).toContain("showError('群操作已在服务端完成，本地缓存同步失败；为避免重复操作，请返回会话列表刷新')");
    expect(chatSettingsSource).not.toContain('<OperationToastFeedback');
  });

  it('已加入群的打开与退出使用 Toast 并保留 remote-only 状态', () => {
    expect(joinedGroupsSource).toContain("toast.error(readJoinedGroupError(cause, '打开群聊失败'))");
    expect(joinedGroupsSource).toContain("toast.success('已退出群聊')");
    expect(joinedGroupsSource).toContain("toast.error(readJoinedGroupError(cause, '退出群聊失败'))");
    expect(joinedGroupsSource).toContain("setError('退群已在服务端完成，本地缓存同步失败；为避免重复操作，请刷新群列表')");
  });

  it('自定义表情操作使用 Toast 并仅保留加载错误状态', () => {
    expect(customEmojiManagerSource).toContain("toast.success('添加成功')");
    expect(customEmojiManagerSource).toContain("toast.success('删除成功')");
    expect(customEmojiManagerSource).toContain("toast.success('排序成功')");
    expect(customEmojiManagerSource).toContain("toast.error(readCustomEmojiManagerError(cause, '添加自定义表情失败'))");
    expect(customEmojiManagerSource).toContain('loadError ? <p');
    expect(customEmojiManagerSource).not.toContain('<OperationToastFeedback');
    expect(customEmojiManagerSource).not.toContain('setNotice(');
  });

  it('媒体预览的打开与下载结果使用全局 Toast', () => {
    expect(mediaPreviewSource).toContain("toast.success('已提交到浏览器下载')");
    expect(mediaPreviewSource).toContain('toast.error(readMediaActionError(cause))');
    expect(mediaPreviewSource).not.toContain('setFeedback(');
    expect(mediaPreviewSource).not.toContain('rn-chat-media-feedback');
  });

  it('权限、版本和退出操作使用 Toast 并保留加载错误 owner', () => {
    expect(permissionSettingsSource).toContain("toast.success('设置成功')");
    expect(permissionSettingsSource).toContain("toast.error(readPermissionError(cause, '权限设置失败'))");
    expect(permissionSettingsSource).toContain("setError(readPermissionError(cause, '权限设置加载失败'))");
    expect(meSettingsSource).toContain("toast.success('已是最新版本')");
    expect(meSettingsSource).toContain("toast.error(readSettingsOperationError(cause, '版本检查失败'))");
    expect(meSettingsSource).toContain("toast.success('已退出登录')");
    expect(meSettingsSource).toContain("toast.error(readSettingsOperationError(cause, '退出登录失败'))");
    expect(meSettingsSource).not.toContain('<OperationToastFeedback');
  });
});
