import { describe, expect, it } from 'vitest';

import pageSource from './ChatSettingsPage.tsx?raw';
import controlsSource from './GroupLifecycleSettings.tsx?raw';
import viewSource from './chat-settings-view.ts?raw';

/** H5 群生命周期必须保持 shared owner、确认层和禁止重放边界。 */
describe('group lifecycle H5 contract', () => {
  it('设置页只消费 shared groupLifecycle facade', () => {
    expect(pageSource).toContain('sync.groupLifecycle.leave({ groupID: conversation.targetID, clearHistory })');
    expect(pageSource).toContain('sync.groupLifecycle.dismiss({ groupID: conversation.targetID })');
    expect(pageSource).not.toContain('GatewayHTTPClient');
    expect(pageSource).not.toContain('GroupRepository');
    expect(pageSource).not.toContain('@openim/');
  });

  it('危险操作使用原生交互 modal 并呈现 remote-only', () => {
    expect(controlsSource).toContain('ariaLabel={`确认${label}`}');
    expect(pageSource).toContain("result.cacheState === 'remote-only'");
    expect(pageSource).toContain('setLifecycleBlocked(true)');
    expect(pageSource).toContain('lifecycleSubmitting || lifecycleBlocked');
    expect(pageSource).toContain('避免重复操作');
    expect(pageSource).not.toContain('retry');
  });

  it('页面 capability 只从 shared group permissions 投影', () => {
    expect(viewSource).toContain('group.permissions.canQuitGroup');
    expect(viewSource).toContain('group.permissions.canTransferOwner');
    expect(viewSource).toContain('group.permissions.canDismissGroup');
    expect(viewSource).not.toContain("currentUserRole === 'owner'");
    expect(viewSource).not.toContain('roleLevel === 100');
  });

  it('群主退出复用 RN 的管理员自动继任双分支', () => {
    expect(pageSource).toContain('view.canStartOwnerLeaveFlow');
    expect(pageSource).toContain('selectIMEarliestGroupAdmin(members)');
    expect(pageSource).toContain('<GroupOwnerQuitModal');
    expect(pageSource).toContain('settings/manage/admins');
    expect(pageSource).toContain("confirmGroupLifecycle('leave', clearHistory)");
    expect(pageSource).not.toContain('owner-transfer?intent=leave');
    expect(controlsSource).toContain('当前群聊无法退出，请选择一个成员成为管理员后再进行退出');
    expect(controlsSource).toContain('退出后其权限将自动转移给');
    expect(controlsSource).toContain('退出, 并删除我发的群消息');
  });

  it('普通成员退出复用 RN 的保留消息与删除本人消息双分支', () => {
    expect(controlsSource).toContain('<p>确定要退出群聊吗 ?</p>');
    expect(controlsSource).toContain("onConfirm(false)");
    expect(controlsSource).toContain("onConfirm(true)");
    expect(pageSource).toContain('confirmGroupLifecycle(lifecycleAction, clearHistory)');
  });
});
