import { describe, expect, it } from 'vitest';

import pageSource from './ChatSettingsPage.tsx?raw';
import controlsSource from './GroupLifecycleSettings.tsx?raw';
import viewSource from './chat-settings-view.ts?raw';

/** H5 群生命周期必须保持 shared owner、确认层和禁止重放边界。 */
describe('group lifecycle H5 contract', () => {
  it('设置页只消费 shared groupLifecycle facade', () => {
    expect(pageSource).toContain('sync.groupLifecycle.leave({ groupID: conversation.targetID })');
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

  it('群主退出先转让并在返回设置页后要求再次确认', () => {
    expect(pageSource).toContain('view.canStartOwnerLeaveFlow');
    expect(pageSource).toContain('settings/manage/owner-transfer?intent=leave');
    expect(pageSource).toContain("searchParams.get('lifecycle') !== 'leave'");
    expect(pageSource).toContain("setLifecycleAction('leave')");
    expect(pageSource).toContain("nextSearchParams.delete('lifecycle')");
  });
});
