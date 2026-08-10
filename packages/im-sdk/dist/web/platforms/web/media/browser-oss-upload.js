import { IMError, } from '@im28/im-sdk/core';
import { WebIMRuntimeError } from '../runtime/runtime-error.js';
/** 创建只负责 Blob/FormData I/O 的 Web 媒体上传端口。 */
export function createBrowserOSSUploadPort(dependencies) {
    // multipartFetch 允许测试注入，生产默认使用浏览器原生 fetch。
    const multipartFetch = dependencies.fetch ?? createDefaultBrowserMultipartFetch();
    return {
        /** 获取短期凭证并将单个 Blob 直传到 OSS。 */
        async upload(input) {
            if (!(input.source instanceof Blob)) {
                throw new WebIMRuntimeError('BROWSER_CAPABILITY_UNAVAILABLE', 'Browser media upload requires a Blob source.');
            }
            // credential 只存在于本次调用内存，不进入日志或本地数据库。
            const credential = await dependencies.gatewayClient.getUploadCredential({
                ext: input.extension,
            });
            // completeCredential 在发起 OSS 请求前一次性验证必填字段。
            const completeCredential = requireUploadCredential(credential);
            // formData 字段名严格复用 RN 已上线的 OSS 表单契约。
            const formData = new FormData();
            formData.append('key', completeCredential.object_key);
            formData.append('policy', completeCredential.policy);
            formData.append('OSSAccessKeyId', completeCredential.access_key_id);
            formData.append('Signature', completeCredential.signature);
            formData.append('success_action_status', '200');
            formData.append('file', input.source, input.name);
            // response 只接受 HTTP success，禁止把 OSS error page 当成功。
            const response = await multipartFetch(completeCredential.host, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new IMError({
                    code: 'MEDIA_UPLOAD_FAILED',
                    message: `OSS media upload failed with status ${response.status}.`,
                    source: 'transport',
                    retryable: response.status >= 500,
                });
            }
            return {
                objectKey: completeCredential.object_key,
                url: completeCredential.url,
            };
        },
    };
}
/** 包装浏览器原生 fetch，避免 shared Gateway JSON adapter 接收 FormData。 */
function createDefaultBrowserMultipartFetch() {
    if (typeof globalThis.fetch !== 'function') {
        throw new WebIMRuntimeError('BROWSER_CAPABILITY_UNAVAILABLE', 'Browser fetch is unavailable for media upload.');
    }
    return async (input, init) => globalThis.fetch(input, { method: init.method, body: init.body });
}
/** 校验 Gateway 返回的短期 OSS 表单凭证。 */
function requireUploadCredential(credential) {
    // values 统一 trim，避免只有空白的字段通过校验。
    const values = {
        access_key_id: credential.access_key_id?.trim() ?? '',
        policy: credential.policy?.trim() ?? '',
        signature: credential.signature?.trim() ?? '',
        object_key: credential.object_key?.trim() ?? '',
        host: credential.host?.trim() ?? '',
        url: credential.url?.trim() ?? '',
    };
    if (Object.values(values).some(value => !value)) {
        throw new IMError({
            code: 'INVALID_UPLOAD_CREDENTIAL',
            message: 'Gateway upload credential is incomplete.',
            source: 'transport',
            retryable: false,
        });
    }
    return values;
}
//# sourceMappingURL=browser-oss-upload.js.map