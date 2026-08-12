/** 创建接听编排，媒体凭据仅在 answer/retry 异步栈内流转。 */
export function createWebIMIncomingCall(dependencies) {
    /** listeners 为 React Provider 提供稳定状态订阅。 */
    const listeners = new Set();
    /** mediaSnapshot 在媒体会话创建前保持稳定 idle 状态。 */
    let mediaSnapshot = {
        state: 'idle',
        mediaType: null,
        microphoneEnabled: false,
        cameraEnabled: false,
        participantIDs: [],
        audioPlaybackBlocked: false,
        error: null,
    };
    /** mediaSession 延迟到用户接听后创建，拒绝路径不触碰媒体权限。 */
    let mediaSession = null;
    /** unsubscribeMedia 释放延迟创建的媒体状态订阅。 */
    let unsubscribeMedia = null;
    /** answering 阻止同一来电重复接听。 */
    let answering = false;
    /** answered 标识 Gateway answer 已确认，可安全走 hangup。 */
    let answered = false;
    /** ending 阻止拒绝、挂断和 dispose 重复发送。 */
    let ending = false;
    /** ended 保证用户挂断与 Provider dispose 只发送一次远端结束。 */
    let ended = false;
    /** disposed 阻止页面清理后继续执行用户操作。 */
    let disposed = false;
    /** 发布组合快照变化。 */
    const publish = () => {
        for (const listener of listeners)
            listener();
    };
    /** 拒绝已销毁实例继续执行操作。 */
    const requireUsable = () => {
        if (disposed)
            throw new Error('Web IM incoming call has been disposed.');
    };
    /** 首次接听时创建并订阅媒体会话，后续重试复用同一实例。 */
    const requireMediaSession = () => {
        requireUsable();
        if (mediaSession)
            return mediaSession;
        mediaSession = dependencies.createMediaSession();
        mediaSnapshot = mediaSession.getSnapshot();
        unsubscribeMedia = mediaSession.subscribe(() => {
            if (!mediaSession)
                return;
            mediaSnapshot = mediaSession.getSnapshot();
            publish();
        });
        return mediaSession;
    };
    /** 用户明确接听后才请求凭据并启动浏览器媒体。 */
    const answer = async () => {
        requireUsable();
        if (answering || answered)
            return;
        answering = true;
        publish();
        try {
            /** result 的 token 不写入实例字段或公开快照。 */
            const result = await dependencies.calls.answer(dependencies.call.callID);
            answered = true;
            /** session 只在 Gateway 确认接听后创建，避免失败接听触发权限。 */
            const session = requireMediaSession();
            await session.start({
                credential: result.credential,
                mediaType: dependencies.call.callType,
            }).catch(() => undefined);
        }
        finally {
            answering = false;
            publish();
        }
    };
    /** 拒绝来电只调用 shared signal，不创建或启动媒体。 */
    const reject = async () => {
        requireUsable();
        if (ending || answered)
            return;
        ending = true;
        publish();
        try {
            await dependencies.calls.reject(dependencies.call.callID);
        }
        finally {
            ending = false;
            publish();
        }
    };
    /** 接听后媒体失败时刷新同一 call ID 的短期凭据。 */
    const retryMedia = async () => {
        requireUsable();
        if (!answered)
            throw new Error('Web IM incoming call has not been answered.');
        /** result 的 token 仅交给媒体会话。 */
        const result = await dependencies.calls.refreshToken(dependencies.call.callID);
        /** session 已在接听成功后创建，此处仅复用并刷新连接。 */
        const session = requireMediaSession();
        await session.stop();
        await session.start({
            credential: result.credential,
            mediaType: dependencies.call.callType,
        });
    };
    /** 已接听通话结束时先释放媒体再收敛 Gateway hangup。 */
    const end = async (reason = 'hangup') => {
        if (ending || ended)
            return;
        ending = true;
        publish();
        try {
            await mediaSession?.stop();
            if (answered) {
                await dependencies.calls.hangup(dependencies.call.callID, reason);
            }
            ended = true;
        }
        finally {
            ending = false;
            publish();
        }
    };
    /** 远端终态只释放媒体并标记结束，不重复发送 hangup。 */
    const handleRemoteTerminal = async () => {
        if (ending || ended)
            return;
        ending = true;
        publish();
        try {
            await mediaSession?.stop();
            ended = true;
        }
        finally {
            ending = false;
            publish();
        }
    };
    /** 读取不含 token 的来电媒体快照。 */
    const getSnapshot = () => ({
        ...mediaSnapshot,
        callID: dependencies.call.callID,
        conversationID: dependencies.call.conversationID,
        answering,
        ending,
    });
    /** 订阅组合快照变化。 */
    const subscribe = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    };
    /** Provider 清理时只对已接听通话发送 route_exit hangup。 */
    const dispose = async () => {
        if (disposed)
            return;
        await end('route_exit').catch(() => undefined);
        disposed = true;
        unsubscribeMedia?.();
        unsubscribeMedia = null;
        listeners.clear();
        await mediaSession?.dispose();
        mediaSession = null;
    };
    return {
        answer,
        reject,
        retryMedia,
        setMicrophoneEnabled: enabled => requireMediaSession().setMicrophoneEnabled(enabled),
        setCameraEnabled: enabled => requireMediaSession().setCameraEnabled(enabled),
        resumeAudioPlayback: () => requireMediaSession().resumeAudioPlayback(),
        handleRemoteTerminal,
        end,
        getSnapshot,
        subscribe,
        dispose,
    };
}
//# sourceMappingURL=browser-incoming-call.js.map