import { describe, expect, it } from 'vitest';

import appSource from './App.tsx?raw';
import layoutSource from './PrimaryTabsLayout.tsx?raw';
import pullRefreshSource from '../hooks/use-pull-refresh.ts?raw';

describe('primary tab scene retention contract', () => {
  it('keeps all four RN-equivalent tab scenes behind React Activity', () => {
    expect(layoutSource).toContain('Activity,');
    expect(layoutSource.match(/<PrimaryTabScene/g)).toHaveLength(4);
    expect(layoutSource).toContain('<ConversationsPage />');
    expect(layoutSource).toContain('<ContactsPage />');
    expect(layoutSource).toContain('<CallsPage />');
    expect(layoutSource).toContain('<MePage />');
    expect(layoutSource).toContain('aria-hidden={!visible}');
    expect(layoutSource.indexOf('className="rn-primary-tab-scene"'))
      .toBeLessThan(layoutSource.indexOf('<Activity name={`primary-tab-${tab}`}'));
  });

  it('keeps React Router as the canonical SPA URL owner without route-owned page instances', () => {
    expect(appSource).toContain('<Route path="/conversations" />');
    expect(appSource).toContain('<Route path="/contacts" />');
    expect(appSource).toContain('<Route path="/calls" />');
    expect(appSource).toContain('<Route path="/me" />');
  });

  it('gives retained scenes independent scrolling and refresh top detection', () => {
    expect(layoutSource).toContain('data-primary-tab-scene={visible ? \'active\' : \'inactive\'}');
    expect(pullRefreshSource).toContain("closest<HTMLElement>('[data-primary-tab-scene]')");
    expect(pullRefreshSource).toContain('sceneScrollTop > 0');
  });
});
