import type { GatewayFetch, GatewayFetchResponse } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import {
  WEB_IM_PLATFORM_TERM_KEYS,
  createWebIMPlatformTermsClient,
} from './platform-terms-client.js';

/** 创建 generated OpenAPI operation 可消费的 Gateway 响应。 */
function createGatewayResponse(payload: unknown): GatewayFetchResponse {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  };
}

// 平台条款 client 必须保留 generated endpoint 并拒绝假成功信封。
describe('Web IM platform terms client', () => {
  // 验证 endpoint、body、语言和 request ID 全部来自冻结 contract。
  it('queries and normalizes a generated platform term operation', async () => {
    // requests 捕获 generated operation 产出的完整调用参数。
    const requests: Array<{
      readonly input: string;
      readonly headers: Readonly<Record<string, string>>;
      readonly body: string;
    }> = [];
    // Gateway fetch 返回真实平台条款 envelope shape。
    const gatewayFetch: GatewayFetch = async (input, init) => {
      requests.push({ input, headers: init.headers, body: init.body });
      return createGatewayResponse({
        code: 0,
        data: {
          term: {
            key: 'user_agreement',
            title: '用户协议',
            content: '<p>agreement</p>',
            version: 'v1',
          },
        },
      });
    };
    // client 只注入公开部署配置和浏览器 transport。
    const client = createWebIMPlatformTermsClient({
      gatewayHTTPURL: 'https://gateway.example.com/',
      language: 'zh-CN',
      fetch: gatewayFetch,
      createRequestID: () => 'request-1',
    });

    await expect(
      client.getTerm(WEB_IM_PLATFORM_TERM_KEYS.userAgreement),
    ).resolves.toEqual({
      key: 'user_agreement',
      title: '用户协议',
      content: '<p>agreement</p>',
      version: 'v1',
    });
    expect(requests).toEqual([
      {
        input: 'https://gateway.example.com/v1/platform/term/get',
        headers: {
          'content-type': 'application/json',
          'Accept-Language': 'zh-CN',
          'X-Request-ID': 'request-1',
        },
        body: JSON.stringify({ key: 'user_agreement' }),
      },
    ]);
  });

  // 非零业务码必须保持共享 SDK 的 GATEWAY_API_ERROR 语义。
  it('rejects a non-zero Gateway API code', async () => {
    // Gateway fetch 模拟 HTTP 成功但业务失败。
    const gatewayFetch: GatewayFetch = async () =>
      createGatewayResponse({ code: 41001, message: 'Term unavailable.' });
    // client 使用测试 Gateway 配置。
    const client = createWebIMPlatformTermsClient({
      gatewayHTTPURL: 'https://gateway.example.com',
      language: 'zh-CN',
      fetch: gatewayFetch,
    });

    await expect(
      client.getTerm(WEB_IM_PLATFORM_TERM_KEYS.privacyPolicy),
    ).rejects.toMatchObject({ code: 'GATEWAY_API_ERROR' });
  });

  // code=0 但缺少 term 不能被页面当成空白成功。
  it('rejects a successful envelope without a term', async () => {
    // Gateway fetch 模拟损坏的成功响应。
    const gatewayFetch: GatewayFetch = async () =>
      createGatewayResponse({ code: 0, data: {} });
    // client 使用测试 Gateway 配置。
    const client = createWebIMPlatformTermsClient({
      gatewayHTTPURL: 'https://gateway.example.com',
      language: 'zh-CN',
      fetch: gatewayFetch,
    });

    await expect(
      client.getTerm(WEB_IM_PLATFORM_TERM_KEYS.userAgreement),
    ).rejects.toMatchObject({ code: 'INVALID_PLATFORM_TERM_RESPONSE' });
  });
});
