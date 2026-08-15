import { describe, expect, it } from 'vitest';

import appSource from './App.tsx?raw';
import chatRoutesSource from './AppChatRoutes.tsx?raw';
import coreRoutesSource from './AppCoreRoutes.tsx?raw';
import routeTreeSource from './AppRouteTree.tsx?raw';

/** 应用根装配与 SPA 路由账本必须保持单一且可追踪的 owner 边界。 */
describe('application route owner contract', () => {
  it('keeps global providers in App and delegates the route ledger once', () => {
    expect(appSource).toContain('<BrowserRouter>');
    expect(appSource).toContain('<WebIMRuntimeProvider>');
    expect(appSource).toContain('<OfflineRuntimeBoundary>');
    expect(appSource).toContain('<WebIMCallProvider>');
    expect(appSource).toContain('<AppRouteTree />');
    expect(appSource).not.toContain('<Routes>');
    expect(appSource).not.toContain('<Route ');
  });

  it('combines core and chat routes under one Routes and one fallback', () => {
    expect(routeTreeSource).toContain('<Routes>');
    expect(routeTreeSource).toContain('{renderCoreRoutes()}');
    expect(routeTreeSource).toContain('{renderChatRoutes()}');
    expect(routeTreeSource).toContain('<Route path="*" element={<NotFoundPage />} />');
    expect(coreRoutesSource).not.toContain('path="*"');
    expect(chatRoutesSource).not.toContain('path="*"');
  });

  it('keeps route owners free of runtime and transport construction', () => {
    expect(`${coreRoutesSource}\n${chatRoutesSource}`).not.toMatch(
      /WebIMRuntimeProvider|WebIMCallProvider|GatewayHTTPClient|@openim\//,
    );
  });
});
