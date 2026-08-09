import { describe, expect, it } from 'vitest';

import { WebIMRuntimeError } from './runtime-error.js';
import { parseWebIMRuntimeConfig } from './runtime-config.js';

// Gateway runtime 部署配置的纯解析测试集合。
describe('Web IM runtime config', () => {
  // 验证 URL 归一化、HTTP 到 WebSocket 协议映射和 Web 默认平台。
  it('parses and normalizes deployment environment', () => {
    // 输入模拟 Vite 暴露的字符串环境变量。
    const config = parseWebIMRuntimeConfig({
      VITE_GATEWAY_HTTP_URL: ' https://gateway.example.com/// ',
      VITE_GATEWAY_WS_URL: 'https://push.example.com/ws',
      VITE_IM_PLATFORM_ID: '',
      VITE_IM_LANGUAGE: '',
    });

    expect(config).toEqual({
      gatewayHTTPURL: 'https://gateway.example.com',
      gatewayWebSocketURL: 'wss://push.example.com/ws',
      platformID: 5,
      language: 'zh-CN',
    });
  });

  // 验证部署地址缺失时不会返回可创建客户端的假配置。
  it('rejects missing Gateway URLs', () => {
    expect(() => parseWebIMRuntimeConfig({})).toThrowError(
      WebIMRuntimeError,
    );
  });

  // 验证非 HTTP Gateway 协议被结构化配置错误拒绝。
  it('rejects unsupported HTTP protocols', () => {
    expect(() =>
      parseWebIMRuntimeConfig({
        VITE_GATEWAY_HTTP_URL: 'ftp://gateway.example.com',
        VITE_GATEWAY_WS_URL: 'wss://push.example.com/ws',
      }),
    ).toThrowError(
      expect.objectContaining({ code: 'INVALID_RUNTIME_CONFIG' }),
    );
  });
});
