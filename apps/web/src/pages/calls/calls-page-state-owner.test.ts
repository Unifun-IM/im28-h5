import { describe, expect, it } from 'vitest';

import pageSource from './CallsPage.tsx?raw';
import stateSource from './useCallsPageState.ts?raw';

/** 通话列表 owner 契约阻止页面重新承载缓存和删除事务。 */
describe('calls page state owner', () => {
  it('keeps page chrome and pull gestures in CallsPage', () => {
    expect(pageSource).toContain('useCallsPageState({');
    expect(pageSource).toContain('usePullRefresh({');
    expect(pageSource).toContain('onChromeHiddenChange?.(editing)');
    expect(pageSource).not.toContain('.listCached(');
    expect(pageSource).not.toContain('.delete(');
    expect(pageSource).not.toContain('refreshCallListPage(');
  });

  it('owns cache-first, full selection scan and deletion in the state hook', () => {
    expect(stateSource.indexOf('calls.listCached({')).toBeLessThan(
      stateSource.indexOf('.then(() => calls.sync())'),
    );
    expect(stateSource).toContain('refreshCallListPage(calls, filter, keyword, PAGE_SIZE)');
    expect(stateSource).toContain('while (offset < total)');
    expect(stateSource).toContain('await calls.delete([...selectedIDs])');
    expect(stateSource).toContain('setSelectedIDs(new Set())');
    expect(stateSource).not.toContain('usePullRefresh(');
    expect(stateSource).not.toContain('onChromeHiddenChange');
  });
});
