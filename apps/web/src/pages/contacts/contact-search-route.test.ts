import { describe, expect, it } from 'vitest';

import pageSource from './ContactSearchPage.tsx?raw';
import { buildConversationRoute } from '../conversations/conversation-route.js';
import {
  readContactSearchBackHref,
} from './contact-search-route.js';

/** 联系人搜索路由 owner 同时锁定来源关闭和群会话打开语义。 */
describe('contact search route', () => {
  it('只接受已登记的联系人搜索来源 scene', () => {
    expect(readContactSearchBackHref('/contacts')).toBe('/contacts');
    expect(readContactSearchBackHref('/conversations')).toBe('/conversations');
    expect(readContactSearchBackHref('/conversations/archived')).toBe('/conversations/archived');
    expect(readContactSearchBackHref('/contacts/search')).toBe('/contacts');
  });

  it('将规范群会话身份投影为关闭搜索层的聊天 route', () => {
    expect(buildConversationRoute(' sg/group 28 ', true)).toEqual({
      href: '/conversations/sg%2Fgroup%2028',
      replace: true,
    });
    expect(buildConversationRoute(' ', true)).toBeNull();
  });

  it('本地群和服务器已加入群共用唯一 route 投影', () => {
    expect(pageSource.match(/buildConversationRoute\([^\n]+, true\)/g)).toHaveLength(2);
    expect(pageSource.match(/navigate\(route\.href, \{ replace: route\.replace \}\)/g)).toHaveLength(2);
    expect(pageSource).not.toContain('window.history');
  });
});
