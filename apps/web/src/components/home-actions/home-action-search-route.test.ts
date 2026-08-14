import { describe, expect, it } from 'vitest';

import menuSource from './HomeActionMenu.tsx?raw';

/** 全局添加朋友入口必须把当前主场景交给搜索页恢复。 */
describe('home action contact search route', () => {
  /** 锁定联系人搜索入口使用白名单解析前的当前 pathname。 */
  it('passes the current scene into contact search route state', () => {
    expect(menuSource).toContain("route === '/contacts/search'");
    expect(menuSource).toContain('state: { searchBackHref: location.pathname }');
  });
});
