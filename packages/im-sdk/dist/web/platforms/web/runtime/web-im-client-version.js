/** 复用共享 Gateway operation，并收敛 Web 更新地址安全策略。 */
export function createWebIMClientVersion(dependencies) {
    return {
        currentVersion: dependencies.appVersion,
        /** 使用部署注入的 Web build identity 查询更新策略。 */
        async check() {
            // data 保持共享 Gateway DTO 为唯一响应 contract。
            const data = await dependencies.gatewayClient.checkClientVersion({
                platform: 'web',
                version: dependencies.appVersion,
                ...(dependencies.appBuildNumber
                    ? { build_number: dependencies.appBuildNumber }
                    : {}),
            });
            // clientVersion 缺失时按无需更新处理，不制造空更新态。
            const clientVersion = data.client_version ?? {};
            // enabled=false 明确关闭该版本策略。
            const enabled = clientVersion.is_enable !== false;
            return {
                needUpdate: Boolean(data.need_update) && enabled,
                forceUpdate: Boolean(clientVersion.force_update),
                latestVersion: clientVersion.version ?? '',
                updateURL: normalizeWebUpdateURL(clientVersion.download_url),
                title: clientVersion.title ?? '',
                description: clientVersion.description ?? '',
            };
        },
    };
}
/** 仅接受 HTTPS，开发环境只额外放行 loopback HTTP 地址。 */
function normalizeWebUpdateURL(value) {
    if (!value)
        return null;
    try {
        // url 使用结构化解析，避免 scheme 前缀或 host 字符串误判。
        const url = new URL(value);
        if (url.protocol === 'https:')
            return url.toString();
        // isLoopbackHost 限定本机开发地址，不放行局域网或公网明文跳转。
        const isLoopbackHost = url.hostname === 'localhost' ||
            url.hostname === '127.0.0.1' ||
            url.hostname === '[::1]';
        return url.protocol === 'http:' && isLoopbackHost ? url.toString() : null;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=web-im-client-version.js.map