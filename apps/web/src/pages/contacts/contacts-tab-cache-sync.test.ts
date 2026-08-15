import { describe, expect, it } from 'vitest';

import contactsPageSource from './ContactsPage.tsx?raw';
import verificationHookSource from './use-verification-unread.ts?raw';

/** 通讯录主 Tab 必须保持 SQLite 首屏、双列表同步和验证角标实时刷新。 */
describe('contacts tab cache sync contract', () => {
  /** 好友缓存读取必须先于好友与我的群聊全量同步。 */
  it('renders cached friends before independently syncing friends and groups', () => {
    expect(contactsPageSource.indexOf('sync.contacts.listCached()')).toBeLessThan(
      contactsPageSource.indexOf('sync.contacts.list()'),
    );
    expect(contactsPageSource).toContain('sync.groups.sync()');
    expect(contactsPageSource).toContain('Promise.allSettled([');
  });

  /** 验证类 revision 只刷新权威计数，不复用普通消息版本。 */
  it('refreshes verification counts from the dedicated realtime revision', () => {
    expect(verificationHookSource).toContain('snapshot.verificationVersion');
    expect(verificationHookSource).toContain('void refresh();');
  });
});
