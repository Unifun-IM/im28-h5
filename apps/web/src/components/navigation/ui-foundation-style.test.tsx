import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import { PageNavbar } from './PageNavbar.js';
import routeMotionSource from '../interaction/RouteMotionController.tsx?raw';

describe('H5 UI foundation styles', () => {
  it('composes the global navbar class with a page-owned visual hook', () => {
    /** html 证明页面差异 class 不会替代全局导航 owner。 */
    const html = renderToStaticMarkup(
      <PageNavbar className="rn-example-header">
        <button type="button">返回</button><h1>示例</h1><span />
      </PageNavbar>,
    );
    expect(html).toContain('class="im-page-navbar rn-example-header"');
    expect(html).toContain('<header');
  });

  it('keeps route motion page-scoped and reduced-motion safe', () => {
    expect(routeMotionSource).toContain('#root [data-primary-tab-scene="active"] main, #root main');
    expect(routeMotionSource).toContain("prefers-reduced-motion: reduce");
    expect(routeMotionSource).toContain('previousPathRef.current === location.pathname');
  });
});
