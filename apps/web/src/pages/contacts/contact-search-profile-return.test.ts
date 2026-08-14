import { describe, expect, it } from 'vitest';

import profileSharedSource from './ContactProfileShared.tsx?raw';
import searchPageSource from './ContactSearchPage.tsx?raw';
import searchUserRowSource from './ContactSearchUserRow.tsx?raw';

/** 联系人搜索进入资料页后必须通过受控 React Router state 返回。 */
describe('contact search profile return contract', () => {
  it('搜索页为本地与服务器用户结果创建唯一的资料返回状态', () => {
    expect(searchPageSource).toContain('createContactSearchProfileState(');
    expect(searchPageSource).toContain('createContactSearchProfileState(');
    expect(searchPageSource).toContain('normalizedKeyword,\n                      null,\n                      routeState.searchBackHref,');
    expect(searchPageSource).toContain('normalizedKeyword,\n                  serverTab,\n                  routeState.searchBackHref,');
    expect(searchPageSource).toContain('routeState.searchBackHref');
    expect(searchUserRowSource).toContain('state={profileState}');
  });

  it('资料页只向通用 header 透传已校验的搜索返回状态', () => {
    expect(profileSharedSource).toContain('getContactProfileHeaderBackState(backHref, location.state)');
    expect(profileSharedSource).toContain('state={backState}');
    expect(profileSharedSource).not.toContain('readonly backState?: unknown;');
    expect(searchPageSource).not.toContain('window.history');
  });

  it('取消搜索以 replace 语义关闭并返回白名单来源页', () => {
    expect(searchPageSource).toContain(
      'navigate(routeState.searchBackHref, { replace: true })',
    );
    expect(searchPageSource).not.toContain('<Link to="/contacts"');
  });
});
