import { describe, expect, it } from 'vitest';

import pageSource from './ChatSettingsPage.tsx?raw';
import dataSource from './useChatSettingsData.ts?raw';

/** 聊天设置数据加载必须保持单一 Hook owner 和薄页面边界。 */
describe('chat settings data owner contract', () => {
  /** cache-first 与完整同步只能存在于数据 Hook。 */
  it('owns conversation group and member loading in one hook', () => {
    expect(pageSource).toContain('useChatSettingsData({');
    expect(dataSource).toContain('sync.conversations.listCached({ limit: 500 })');
    expect(dataSource).toContain('sync.conversations.sync({ pageSize: 100 })');
    expect(dataSource).toContain('sync.groups.listCached()');
    expect(dataSource).toContain('sync.groups.sync({ pageSize: 100 })');
    expect(dataSource).toContain('sync.groupMembers.listCached(groupID)');
    expect(dataSource).toContain('sync.groupMembers.sync(groupID, { pageSize: 100 })');
    expect(pageSource).not.toMatch(/conversations\.(listCached|sync)\(/);
    expect(pageSource).not.toMatch(/groupMembers\.(listCached|sync)\(/);
  });

  /** 数据 owner 不得吸收路由、反馈或破坏性 mutation。 */
  it('keeps navigation and mutations in the page interaction owner', () => {
    expect(dataSource).not.toMatch(/useNavigate|useSearchParams|navigate\(/);
    expect(dataSource).not.toMatch(/clearChatHistory|groupLifecycle\.(leave|dismiss)|useAppToast/);
    expect(pageSource).toContain('clearChatHistory(');
    expect(pageSource).toContain('sync.groupLifecycle.leave(');
    expect(pageSource).toContain('sync.groupLifecycle.dismiss(');
  });

  /** 拆分后的 owner 均保持小于 300 行，避免再次形成页面级巨石。 */
  it('keeps both owners below the repository size threshold', () => {
    expect(pageSource.split('\n').length).toBeLessThanOrEqual(300);
    expect(dataSource.split('\n').length).toBeLessThanOrEqual(300);
  });
});
