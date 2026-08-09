import { describe, expect, it, vi } from 'vitest';

import { createBrowserGatewayFetch } from './browser-gateway-fetch.js';

// 浏览器 Fetch 到共享 Gateway 端口的适配测试集合。
describe('browser Gateway fetch', () => {
  // 验证 adapter 只转发浏览器支持的请求字段。
  it('forwards Gateway requests to browser fetch', async () => {
    // Response stub 只实现共享 Gateway client 需要的字段。
    const response = {
      ok: true,
      status: 200,
      json: async () => ({ code: 0 }),
    } as Response;
    // 浏览器 fetch spy 用于检查 URL、method、headers 和 body。
    const browserFetch = vi.fn(async () => response);
    // Gateway adapter 使用显式注入，测试不触碰全局 fetch。
    const gatewayFetch = createBrowserGatewayFetch(browserFetch);

    await expect(
      gatewayFetch('https://gateway.example.com/v1/auth/check-token', {
        method: 'POST',
        headers: { Authorization: 'Bearer access-1' },
        body: '{"access_token":"access-1"}',
      }),
    ).resolves.toBe(response);
    expect(browserFetch).toHaveBeenCalledWith(
      'https://gateway.example.com/v1/auth/check-token',
      {
        method: 'POST',
        headers: { Authorization: 'Bearer access-1' },
        body: '{"access_token":"access-1"}',
      },
    );
  });

  // 验证缺少浏览器 fetch 时创建阶段立即失败。
  it('rejects a missing browser fetch capability', () => {
    expect(() => createBrowserGatewayFetch(null)).toThrowError(
      expect.objectContaining({ code: 'BROWSER_CAPABILITY_UNAVAILABLE' }),
    );
  });
});
