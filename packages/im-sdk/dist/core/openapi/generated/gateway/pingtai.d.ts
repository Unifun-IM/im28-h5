/** 检查客户端版本 客户端启动时检查是否需要更新；未登录也可调用。 POST /v1/platform/client-version/check */
export declare function postV1PlatformClientVersionCheck(body: GatewayOpenAPI.CheckClientVersionRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.CheckClientVersionEnvelope>;
/** 获取平台条款 按业务键获取已启用的平台条款；未登录也可调用。 POST /v1/platform/term/get */
export declare function postV1PlatformTermGet(body: GatewayOpenAPI.GetPlatformTermRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.PlatformTermEnvelope>;
//# sourceMappingURL=pingtai.d.ts.map