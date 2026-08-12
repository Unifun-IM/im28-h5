import { createWebIMSyncError, requireWebIMSyncContext, } from './sync-context.js';
/** 创建跨端共用的通话控制 facade。 */
export function createIMCallControlSync(dependencies) {
    return {
        /** 发起通话时统一验证会话、媒体类型和稳定 client ID。 */
        start: async (options) => {
            requireWebIMSyncContext(dependencies, 'Call start');
            /** conversationID 是服务端通话与现有单聊的稳定关联。 */
            const conversationID = requireCallValue(options.conversationID, 'INVALID_CALL_CONVERSATION');
            /** clientCallID 支持调用方在模糊超时后显式复用。 */
            const clientCallID = options.clientCallID?.trim() ||
                dependencies.createClientMessageID?.()?.trim();
            if (!clientCallID) {
                throw createWebIMSyncError('CALL_CLIENT_ID_UNAVAILABLE', 'Call start requires a stable client call ID.');
            }
            /** callType 只接受 Gateway 当前支持的音频或视频。 */
            const callType = options.callType === 'video'
                ? 'video'
                : options.callType === 'audio'
                    ? 'audio'
                    : null;
            if (!callType) {
                throw createWebIMSyncError('INVALID_CALL_TYPE', 'Call type must be audio or video.');
            }
            return requireCallTokenResult(await dependencies.gatewayClient.startCall({
                conversation_id: conversationID,
                call_type: callType,
                client_call_id: clientCallID,
            }), dependencies);
        },
        /** 接听通话后统一校验返回的媒体凭证。 */
        answer: async (callID, deviceID) => {
            requireWebIMSyncContext(dependencies, 'Call answer');
            return requireCallTokenResult(await dependencies.gatewayClient.answerCall({
                call_id: requireCallID(callID),
                ...(deviceID?.trim() ? { device_id: deviceID.trim() } : {}),
            }), dependencies);
        },
        /** 拒绝只返回服务端确认后的通话实体。 */
        reject: async (callID) => {
            requireWebIMSyncContext(dependencies, 'Call reject');
            return (await dependencies.gatewayClient.rejectCall({ call_id: requireCallID(callID) })).call;
        },
        /** 取消只允许已认证账号操作稳定 call ID。 */
        cancel: async (callID) => {
            requireWebIMSyncContext(dependencies, 'Call cancel');
            return (await dependencies.gatewayClient.cancelCall({ call_id: requireCallID(callID) })).call;
        },
        /** 挂断保留平台提供的可选原因文案。 */
        hangup: async (callID, reason) => {
            requireWebIMSyncContext(dependencies, 'Call hangup');
            return (await dependencies.gatewayClient.hangupCall({
                call_id: requireCallID(callID),
                ...(reason?.trim() ? { reason: reason.trim() } : {}),
            })).call;
        },
        /** 刷新令牌与 start/answer 共用完整凭证校验。 */
        refreshToken: async (callID) => {
            requireWebIMSyncContext(dependencies, 'Call token refresh');
            return requireCallTokenResult(await dependencies.gatewayClient.refreshCallToken({ call_id: requireCallID(callID) }), dependencies);
        },
    };
}
/** 规范化 HTTP(S)/WS(S) LiveKit 地址，不做平台网络可达性猜测。 */
export function normalizeIMCallServerURL(serverURL) {
    /** rawURL 拒绝空白或非 URL 服务端配置。 */
    const rawURL = serverURL.trim();
    /** parsed 仅接受 LiveKit 支持的网络协议。 */
    let parsed;
    try {
        parsed = new URL(rawURL);
    }
    catch {
        throw createWebIMSyncError('INVALID_CALL_SERVER_URL', 'Call server URL is invalid.');
    }
    if (parsed.protocol === 'http:')
        parsed.protocol = 'ws:';
    else if (parsed.protocol === 'https:')
        parsed.protocol = 'wss:';
    else if (parsed.protocol !== 'ws:' && parsed.protocol !== 'wss:') {
        throw createWebIMSyncError('UNSUPPORTED_CALL_SERVER_PROTOCOL', 'Call server URL must use HTTP(S) or WS(S).');
    }
    return parsed.toString();
}
/** 拒绝空白 call ID。 */
function requireCallID(callID) {
    return requireCallValue(callID, 'INVALID_CALL_ID');
}
/** 统一读取必填的通话稳定身份。 */
function requireCallValue(value, code) {
    /** normalizedValue 防止空白身份进入 Gateway。 */
    const normalizedValue = value.trim();
    if (!normalizedValue) {
        throw createWebIMSyncError(code, 'Call identity is required.');
    }
    return normalizedValue;
}
/** 验证通话、LiveKit URL/token 与当前客户端 E2EE 能力。 */
function requireCallTokenResult(data, dependencies) {
    /** callID 是 active call 生命周期的唯一主键。 */
    const callID = data.call?.call_id?.trim() ?? '';
    /** token 不进入日志、缓存或应用 DTO。 */
    const token = data.livekit_token?.trim() ?? '';
    /** rawServerURL 在平台 adapter 前先要求服务端真实返回。 */
    const rawServerURL = data.livekit_url?.trim() ?? '';
    if (!data.call || !callID || !token || !rawServerURL) {
        throw createWebIMSyncError('CALL_CREDENTIAL_UNAVAILABLE', 'Call service did not return a complete media credential.');
    }
    if (data.e2ee_required) {
        throw createWebIMSyncError('CALL_E2EE_UNSUPPORTED', 'This client does not support encrypted calls.');
    }
    /** serverUrl 允许 RN 注入设备可达性校验，Web/Desktop 使用中性协议转换。 */
    const serverUrl = (dependencies.normalizeCallServerURL ?? normalizeIMCallServerURL)(rawServerURL);
    return {
        call: { ...data.call, call_id: callID },
        credential: { serverUrl, token },
        e2eeRequired: false,
        ...(data.expires_in === undefined ? {} : { expiresIn: data.expires_in }),
    };
}
//# sourceMappingURL=call-control.js.map