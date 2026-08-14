import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { PullRefreshIndicator } from '../../components/interaction/index.js';
import appSource from '../../app/App.tsx?raw';
import inviteSource from './GroupInviteMembersPage.tsx?raw';
import modalSource from './GroupMemberPickerModal.tsx?raw';
import removeSource from './GroupRemoveMembersPage.tsx?raw';

/** 群成员选择刷新契约锁定两个 RN 列表复用同一手势和提示 owner。 */
describe('group member selection pull refresh', () => {
  /** 邀请与移除页面只调用既有 shared facade，不新增 transport。 */
  it('keeps refresh behind existing group facades', () => {
    expect(inviteSource).toContain('usePullRefresh({');
    expect(inviteSource).toContain('sync.contacts.list({ pageSize: 100 })');
    expect(removeSource).toContain('usePullRefresh({');
    expect(removeSource).toContain('sync.groupMembers.sync(groupID, { pageSize: 100 })');
    expect(`${inviteSource}\n${removeSource}`).not.toMatch(/GatewayHTTPClient|GroupRepository|@openim\//);
  });

  /** 共用提示保留 RN 三态文案与折叠高度。 */
  it('renders the shared armed state without business content', () => {
    expect(renderToStaticMarkup(
      <PullRefreshIndicator refreshing={false} armed pullDistance={56} />,
    )).toContain('松开刷新');
    expect(renderToStaticMarkup(
      <PullRefreshIndicator refreshing armed={false} pullDistance={0} />,
    )).toContain('正在刷新');
  });

  /** 邀请和移除保持可直达 SPA URL，但统一叠加在群设置页的 60% 底部弹窗。 */
  it('renders both member actions through one settings modal shell', () => {
    expect(modalSource).toContain('className={`rn-group-member-picker-modal');
    expect(inviteSource).toContain('<GroupMemberPickerModal');
    expect(removeSource).toContain('<GroupMemberPickerModal');
    expect(appSource.match(/<ChatSettingsPage \/>/g)).toHaveLength(3);
  });
});
