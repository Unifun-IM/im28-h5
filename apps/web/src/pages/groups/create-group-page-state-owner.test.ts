import { describe, expect, it } from 'vitest';

import pageSource from './CreateGroupPage.tsx?raw';
import stateOwnerSource from './useCreateGroupPageState.ts?raw';

/** 建群页 owner 契约阻止 cache-first、选择和创建事务重新回流到页面。 */
describe('create group page state owner contract', () => {
  it('keeps the page presentation-only', () => {
    expect(pageSource).toContain('useCreateGroupPageState');
    expect(pageSource).not.toContain('sync.groups.create');
    expect(pageSource).not.toContain('sync.contacts.list');
    expect(pageSource).not.toContain('sync.conversations.listCached');
    expect(pageSource).not.toContain('useAppToast');
  });

  it('owns cache-first loading, validated peer resolution and creation transaction', () => {
    expect(stateOwnerSource).toContain('sync.contacts.listCached()');
    expect(stateOwnerSource).toContain('sync.contacts.list({ pageSize: 100 })');
    expect(stateOwnerSource).toContain('sync.conversations.listCached({ limit: 500 })');
    expect(stateOwnerSource).toContain('sync.groups.create({');
    expect(stateOwnerSource).toContain("result.cacheState === 'remote-only'");
  });
});
