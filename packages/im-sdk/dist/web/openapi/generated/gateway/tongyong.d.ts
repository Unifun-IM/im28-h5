/** 获取文件上传凭证 前端先获取 OSS 表单直传凭证，再把文件直接上传到 OSS/CDN。图片最大 10MB，音频和普通文件最大 100MB，视频最大 500MB，凭证默认 5 分钟有效。 POST /v1/common/upload-credential */
export declare function postV1CommonUploadCredential(body: GatewayOpenAPI.UploadCredentialRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.UploadCredentialEnvelope>;
//# sourceMappingURL=tongyong.d.ts.map