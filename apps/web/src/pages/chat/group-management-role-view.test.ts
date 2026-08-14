import { describe, expect, it } from 'vitest';

import managementSource from './GroupManagementPage.tsx?raw';
import { buildGroupManagementRoleView } from './group-management-role-view.js';

/** 群管理角色展示必须保留 RN 对管理员的可见但禁用信息层级。 */
describe('group management role view', () => {
  /** 群主拥有全部设置入口和操作能力。 */
  it('keeps owner controls visible and enabled', () => {
    /** view 投影群主 capability 的展示结果。 */
    const view = buildGroupManagementRoleView({
      canManageAdmins: true,
      canTransferOwner: true,
    });
    expect(view).toEqual({
      switchesDisabled: false,
      speechFrequencyDisabled: false,
      ownerTransferDisabled: false,
    });
  });

  /** 管理员可读取群主管理设置，但不能触发群主专属操作。 */
  it('keeps admin controls visible but disabled', () => {
    /** view 投影管理员 capability 的展示结果。 */
    const view = buildGroupManagementRoleView({
      canManageAdmins: false,
      canTransferOwner: false,
    });
    expect(view).toEqual({
      switchesDisabled: true,
      speechFrequencyDisabled: true,
      ownerTransferDisabled: true,
    });
  });

  /** 生产页面必须消费同一投影，避免 helper 成为孤立实现。 */
  it('connects the role view to the production management page', () => {
    expect(managementSource).toContain('buildGroupManagementRoleView(group.permissions)');
    expect(managementSource).toContain('disabled={roleView.switchesDisabled || submitting}');
    expect(managementSource).toContain('roleView.speechFrequencyDisabled');
    expect(managementSource).toContain('roleView.ownerTransferDisabled');
  });

  /** 普通成员继续由 shared 管理页 capability 守卫拦截。 */
  it('keeps member route admission fail-closed', () => {
    expect(managementSource).toContain('!group.permissions.canOpenGroupManage');
    expect(managementSource).toContain('return <Navigate to={settingsURL} replace />');
    expect(managementSource).not.toContain('roleLevel ===');
  });
});
