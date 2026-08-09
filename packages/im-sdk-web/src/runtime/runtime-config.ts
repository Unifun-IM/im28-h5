import { z } from 'zod';

import { WebIMRuntimeError } from './runtime-error.js';

// OpenIM 官方终端枚举将浏览器平台定义为 5。
const DEFAULT_WEB_PLATFORM_ID = 5;
// H5 默认使用中文 Gateway 响应语言，可由部署环境覆盖。
const DEFAULT_GATEWAY_LANGUAGE = 'zh-CN';

/** 把空环境变量归一为缺省值，避免空字符串被 number coercion 误判。 */
function normalizeOptionalEnvironmentValue(value: unknown): unknown {
  return typeof value === 'string' && value.trim() === '' ? undefined : value;
}

// 运行时环境 schema 只读取公开部署配置，不接收任何 token。
const WEB_IM_RUNTIME_ENV_SCHEMA = z.object({
  VITE_GATEWAY_HTTP_URL: z.string().trim().url(),
  VITE_GATEWAY_WS_URL: z.string().trim().url(),
  VITE_IM_PLATFORM_ID: z.preprocess(
    normalizeOptionalEnvironmentValue,
    z.coerce.number().int().positive().default(DEFAULT_WEB_PLATFORM_ID),
  ),
  VITE_IM_LANGUAGE: z.preprocess(
    normalizeOptionalEnvironmentValue,
    z.string().trim().min(2).default(DEFAULT_GATEWAY_LANGUAGE),
  ),
});

/** 浏览器 Gateway runtime 创建客户端所需的稳定配置。 */
export interface WebIMRuntimeConfig {
  readonly gatewayHTTPURL: string;
  readonly gatewayWebSocketURL: string;
  readonly platformID: number;
  readonly language: string;
}

/** 解析并验证 Vite 环境输入，失败时不创建任何网络客户端。 */
export function parseWebIMRuntimeConfig(
  environment: Readonly<Record<string, unknown>>,
): WebIMRuntimeConfig {
  try {
    // Zod 负责拒绝缺失值、非法 URL 和非法 platform ID。
    const parsedEnvironment = WEB_IM_RUNTIME_ENV_SCHEMA.parse(environment);
    return {
      gatewayHTTPURL: normalizeHTTPURL(parsedEnvironment.VITE_GATEWAY_HTTP_URL),
      gatewayWebSocketURL: normalizeWebSocketURL(
        parsedEnvironment.VITE_GATEWAY_WS_URL,
      ),
      platformID: parsedEnvironment.VITE_IM_PLATFORM_ID,
      language: parsedEnvironment.VITE_IM_LANGUAGE,
    };
  } catch (cause) {
    if (cause instanceof WebIMRuntimeError) {
      throw cause;
    }
    throw new WebIMRuntimeError(
      'INVALID_RUNTIME_CONFIG',
      'Web IM runtime configuration is invalid.',
      cause,
    );
  }
}

/** 校验 HTTP Gateway 协议并移除末尾斜杠。 */
function normalizeHTTPURL(value: string): string {
  // URL parser 负责协议大小写和绝对地址校验后的结构化读取。
  const url = new URL(value);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new WebIMRuntimeError(
      'INVALID_RUNTIME_CONFIG',
      'Gateway HTTP URL must use http or https.',
    );
  }
  return value.replace(/\/+$/, '');
}

/** 校验 WebSocket Gateway 协议，并支持从 HTTP 地址安全映射协议。 */
function normalizeWebSocketURL(value: string): string {
  // 独立 URL 实例避免字符串替换误伤 host、path 或 query。
  const url = new URL(value);
  if (url.protocol === 'http:') {
    url.protocol = 'ws:';
  } else if (url.protocol === 'https:') {
    url.protocol = 'wss:';
  } else if (url.protocol !== 'ws:' && url.protocol !== 'wss:') {
    throw new WebIMRuntimeError(
      'INVALID_RUNTIME_CONFIG',
      'Gateway WebSocket URL must use ws, wss, http or https.',
    );
  }
  return url.toString();
}
