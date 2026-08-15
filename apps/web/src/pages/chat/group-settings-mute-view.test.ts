import { describe, expect, it } from 'vitest';

import chatRoutesSource from '../../app/AppChatRoutes.tsx?raw';
import managementSource from './GroupManagementPage.tsx?raw';
import muteSource from './GroupMutePage.tsx?raw';
import speechSource from './GroupSpeechFrequencyPage.tsx?raw';

/** H5 群设置和禁言页面不得复制 Gateway、SQL 或角色权限业务。 */
describe('group settings and mute H5 contract', () => {
  it('两个详情页均由 React Router SPA 子路由拥有', () => {
    expect(chatRoutesSource).toContain('path="/conversations/:conversationID/settings/manage/mute"');
    expect(chatRoutesSource).toContain('path="/conversations/:conversationID/settings/manage/speech-frequency"');
    expect(chatRoutesSource).toContain('<GroupMutePage />');
    expect(chatRoutesSource).toContain('<GroupSpeechFrequencyPage />');
  });

  it('三个页面只消费 shared groupManagement facade', () => {
    /** source 保存本切片全部页面源码。 */
    const source = `${managementSource}\n${muteSource}\n${speechSource}`;
    expect(managementSource).toContain('sync.groupManagement.updateSettings(options)');
    expect(muteSource).toContain('sync.groupManagement.updateMute');
    expect(muteSource).toContain('sync.groupManagement.updateMemberMute');
    expect(speechSource).toContain('sync.groupManagement.updateSettings(options)');
    expect(source).not.toContain('GatewayHTTPClient');
    expect(source).not.toContain('GroupRepository');
    expect(source).not.toContain('@openim/');
    expect(source).not.toContain('roleLevel === 100');
  });

  /** 群禁言刷新只重读既有 shared 群和成员 facade。 */
  it('群禁言成员面板复用全局下拉刷新且不增加 transport owner', () => {
    expect(muteSource).toContain('usePullRefresh({');
    expect(muteSource).toContain('sync.groups.sync({ pageSize: 100 })');
    expect(muteSource).toContain('sync.groupMembers.sync(groupID, { pageSize: 100 })');
    expect(muteSource).toContain('<PullRefreshIndicator');
    expect(muteSource).toContain('refreshing: loading || refreshing || submitting');
    expect(muteSource).not.toMatch(/GatewayHTTPClient|GroupRepository|@openim\//);
  });

  it('所有 mutation 都有确认或显式确定操作且不伪造成功', () => {
    expect(managementSource).toContain('ariaLabel="确认群设置"');
    expect(muteSource).toContain('ariaLabel="确认禁言设置"');
    expect(speechSource).toContain("onClick={() => { void save(); }}");
    expect(managementSource).toContain("result.cacheState === 'remote-only'");
    expect(muteSource).toContain("result.cacheState === 'remote-only'");
    expect(speechSource).toContain("result.cacheState === 'remote-only'");
  });
});
