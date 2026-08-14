import { describe, expect, it } from 'vitest';

import appSource from '../../app/App.tsx?raw';
import managementSource from './GroupManagementPage.tsx?raw';
import ownerTransferSource from './GroupOwnerTransferPage.tsx?raw';

/** 群主转让必须由单一 SPA 页面消费 shared SDK 能力。 */
describe('group owner transfer route contract', () => {
  it('群管理入口只导航到独立 React Router 子路由', () => {
    expect(appSource).toContain('path="/conversations/:conversationID/settings/manage/owner-transfer"');
    expect(appSource).toContain('<GroupOwnerTransferPage />');
    expect(managementSource).toContain('label="群主转让"');
    expect(managementSource).toContain('to={ownerTransferURL}');
    expect(managementSource).not.toContain('MemberPickerModal');
    expect(managementSource).not.toContain('groupMembers.transferOwner');
  });

  it('转让页面仅通过路由数据适配层消费业务能力', () => {
    expect(ownerTransferSource).toContain('useGroupRoleRouteData');
    expect(ownerTransferSource).toContain('await data.transferOwner(selectedMember.userID)');
    expect(ownerTransferSource).not.toContain('GatewayHTTPClient');
    expect(ownerTransferSource).not.toContain('GroupRepository');
    expect(ownerTransferSource).not.toContain('@openim/');
  });

  it('提交前有明确确认且成功后退出群主管理范围', () => {
    expect(ownerTransferSource).toContain('ariaLabel="确认选择新群主"');
    expect(ownerTransferSource).toContain("searchParams.get('from') === 'joined-groups'");
    expect(ownerTransferSource).toContain("? '/contacts/groups'");
    expect(ownerTransferSource).toContain(": `${settingsURL}${fromOwnerLeave ? '?lifecycle=leave' : ''}`");
    expect(ownerTransferSource).toContain('navigate(successURL, { replace: true })');
  });

  it('群设置发起的退出意图在转让后返回退群确认入口', () => {
    expect(ownerTransferSource).toContain("searchParams.get('intent') === 'leave'");
    expect(ownerTransferSource).toContain("'?lifecycle=leave'");
    expect(ownerTransferSource).toContain("fromOwnerLeave ? settingsURL : manageURL");
    expect(ownerTransferSource).not.toContain('groupLifecycle.leave');
  });
});
