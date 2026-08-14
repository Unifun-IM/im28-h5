import { describe, expect, it } from 'vitest';

import managementSource from './GroupManagementPage.tsx?raw';
import settingsSource from './ChatSettingsPage.tsx?raw';

/** 自动删除入口位置必须保持 RN 单聊设置与群主管理层级。 */
describe('chat auto delete entry contract', () => {
  /** 单聊设置保留入口，群聊设置不得直接暴露入口。 */
  it('keeps only the single-chat entry on chat settings', () => {
    expect(settingsSource).toContain('view.canShowAutoDeleteInChatSettings');
    expect(settingsSource).toContain('<ChatAutoDeleteSettingsRow');
  });

  /** 群聊入口归属群管理，并继续复用同一个展示组件。 */
  it('puts the owner-only group entry on group management', () => {
    expect(managementSource).toContain('group?.permissions.canManageAdmins');
    expect(managementSource).toContain('<ChatAutoDeleteSettingsRow');
    expect(managementSource).toContain('autoDeleteSeconds={conversation.autoDeleteSeconds}');
  });

  /** 页面不得为层级调整新增 transport 或数据库 owner。 */
  it('does not add a web-only business path', () => {
    /** source 汇总两个入口页面的业务边界。 */
    const source = `${settingsSource}\n${managementSource}`;
    expect(source).not.toMatch(/GatewayHTTPClient|GroupRepository|@openim\//);
  });
});
