import { gatewayOpenAPI } from '@im28/im-sdk/openapi';
import { IMError } from '@im28/im-sdk/core';
import { z } from 'zod';
import { WebIMRuntimeError } from './runtime-error.js';
/** 平台条款业务键与 RN termService 保持一致。 */
export const WEB_IM_PLATFORM_TERM_KEYS = {
    userAgreement: 'user_agreement',
    privacyPolicy: 'privacy_policy',
};
/** 生成接口响应的最小校验结构，拒绝缺失 term 的假成功。 */
const PLATFORM_TERM_ENVELOPE_SCHEMA = z.object({
    code: z.number().optional(),
    message: z.string().optional(),
    data: z
        .object({
        term: z.object({
            key: z.string().optional(),
            title: z.string().optional(),
            content: z.string().optional(),
            version: z.string().optional(),
        }),
    })
        .optional(),
});
/** 复用 generated OpenAPI operation 创建浏览器平台条款 client。 */
export function createWebIMPlatformTermsClient(options) {
    return {
        /** 查询并验证单个已启用的平台条款。 */
        async getTerm(key) {
            // 请求头与共享 Gateway client 保持同一语言和请求追踪约定。
            const headers = {
                'content-type': 'application/json',
                'Accept-Language': options.language,
            };
            // request ID 只在调用方提供工厂时生成。
            const requestID = options.createRequestID?.();
            if (requestID) {
                headers['X-Request-ID'] = requestID;
            }
            // generated operation 是 endpoint/body 的唯一 owner。
            const payload = await gatewayOpenAPI.apIpingtai.postV1PlatformTermGet({ key }, {
                baseURL: options.gatewayHTTPURL.replace(/\/+$/, ''),
                fetch: options.fetch,
                headers,
            });
            // Zod 在 runtime 边界拦截结构损坏的成功响应。
            const parsedEnvelope = PLATFORM_TERM_ENVELOPE_SCHEMA.safeParse(payload);
            if (!parsedEnvelope.success) {
                throw new WebIMRuntimeError('INVALID_PLATFORM_TERM_RESPONSE', 'Gateway platform term response is invalid.', parsedEnvelope.error);
            }
            // 后续业务码和 term 校验只消费已验证信封。
            const envelope = parsedEnvelope.data;
            if (envelope.code !== undefined && envelope.code !== 0) {
                throw new IMError({
                    code: 'GATEWAY_API_ERROR',
                    message: envelope.message ??
                        `Gateway API failed with code ${envelope.code}.`,
                    source: 'transport',
                    cause: envelope,
                });
            }
            if (!envelope.data?.term) {
                throw new WebIMRuntimeError('INVALID_PLATFORM_TERM_RESPONSE', 'Gateway platform term response is invalid.', envelope);
            }
            // 空可选字段沿用 RN termService 的稳定空字符串语义。
            const term = envelope.data.term;
            return {
                key,
                title: term.title ?? '',
                content: term.content ?? '',
                version: term.version ?? '',
            };
        },
    };
}
//# sourceMappingURL=platform-terms-client.js.map