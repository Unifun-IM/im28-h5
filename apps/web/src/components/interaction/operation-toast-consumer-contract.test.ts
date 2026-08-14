import { describe, expect, it } from 'vitest';

import pickerSource from '../chat-target-picker/ChatTargetPickerModal.tsx?raw';
import contactProfileSource from '../../pages/contacts/ContactProfilePage.tsx?raw';
import friendApplicationSource from '../../pages/contacts/ContactFriendApplicationPage.tsx?raw';
import notificationSource from '../../pages/me/MeNotificationSettingsPage.tsx?raw';
import profileEditorSource from '../../pages/me/MeProfileEditorPage.tsx?raw';
import qrApplySource from '../../pages/qr/GroupQRCodeApplyPage.tsx?raw';
import customEmojiManagerSource from '../../pages/chat/CustomEmojiManagerPage.tsx?raw';

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
    expect(contactProfileSource).toContain("toast.success('备注保存成功')");
  });

  it('好友与群申请使用 Toast 并保留加载错误状态', () => {
    expect(friendApplicationSource).toContain("toast.success('好友申请已发送')");
    expect(friendApplicationSource).toContain('setError(readApplicationError(cause, \'联系人资料加载失败\'))');
    expect(qrApplySource).toContain("toast.success('入群申请已发送')");
    expect(qrApplySource).toContain('setError(readGroupApplyError(cause, \'群资料加载失败\'))');
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
});
