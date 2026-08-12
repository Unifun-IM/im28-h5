/** 校验 token POST /v1/auth/check-token */
export declare function postV1AuthCheckToken(body: GatewayOpenAPI.CheckTokenRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.CheckTokenEnvelope>;
/** 退出登录 校验 access token 与 X-Device-ID 后，仅撤销当前设备的 Token Family，不影响该用户其他设备。 POST /v1/auth/logout */
export declare function postV1AuthLogout(body: GatewayOpenAPI.LogoutRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.ResponseBase>;
/** 修改密码 校验当前密码并设置新密码。临时账号首次登录后，服务端只允许访问本接口；修改成功会撤销当前 session，客户端需使用新密码重新登录。 POST /v1/auth/password/reset */
export declare function postV1AuthPasswordReset(body: GatewayOpenAPI.ResetPasswordRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.ResponseBase>;
/** 刷新 token X-Device-ID 必须与原 Session 绑定值一致。成功后 access token 和 refresh token 同时轮换，旧 refresh token 立即失效。 POST /v1/auth/refresh-token */
export declare function postV1AuthRefreshToken(body: GatewayOpenAPI.RefreshTokenRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.UserAuthEnvelope>;
/** 用户注册 POST /v1/auth/register */
export declare function postV1AuthRegister(body: GatewayOpenAPI.RegisterUserRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.UserAuthEnvelope>;
/** 用户登录 POST /v1/auth/user-login */
export declare function postV1AuthUserLogin(body: GatewayOpenAPI.UserLoginRequest, options?: Record<string, unknown>): Promise<GatewayOpenAPI.UserAuthEnvelope>;
//# sourceMappingURL=renzheng.d.ts.map