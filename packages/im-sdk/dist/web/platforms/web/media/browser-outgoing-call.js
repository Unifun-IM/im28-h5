/** 将共享 call type 收敛为浏览器媒体会话枚举。 */
function readMediaType(value) {
    return value === 'video' ? 'video' : 'audio';
}
/** 创建 Web-only 呼出编排，H5 页面不持有凭据或回滚分支。 */
export function createWebIMOutgoingCall(dependencies) {
    /** listeners 为 React external store 提供稳定订阅。 */
    const listeners = new Set();
    /** callID 只在当前内存生命周期存在。 */
    let callID = null;
    /** conversationID 允许 UI 校验路由身份，不参与 Gateway DTO。 */
    let conversationID = null;
    /** ending 阻止取消、挂断和 route cleanup 重复发送。 */
    let ending = false;
    /** disposed 阻止页面退出后的重试或控制。 */
    let disposed = false;
    /** hasPeerConnected 决定结束时调用 cancel 还是 hangup。 */
    let hasPeerConnected = false;
    /** lastStartOptions 只保存稳定 ID/媒体类型，用于首次媒体失败后的完整重试。 */
    let lastStartOptions = null;
    /** mediaSnapshot 复用现有媒体状态机且不保存凭据。 */
    let mediaSnapshot = dependencies.mediaSession.getSnapshot();
    /** 发布组合快照变化。 */
    const publish = () => {
        for (const listener of listeners)
            listener();
    };
    /** 订阅媒体会话并记录远端成员曾经接通。 */
    const unsubscribeMedia = dependencies.mediaSession.subscribe(() => {
        mediaSnapshot = dependencies.mediaSession.getSnapshot();
        if (mediaSnapshot.participantIDs.length > 0)
            hasPeerConnected = true;
        publish();
    });
    /** 要求呼出实例仍可执行用户操作。 */
    const requireUsable = () => {
        if (disposed)
            throw new Error('Web IM outgoing call has been disposed.');
    };
    /** 发起一次 shared call 并只把凭据交给媒体会话。 */
    const start = async (options) => {
        requireUsable();
        if (callID)
            throw new Error('Web IM outgoing call is already active.');
        lastStartOptions = { ...options };
        /** result 在此异步栈内短暂持有 token，不进入 snapshot。 */
        const result = await dependencies.calls.start(options);
        callID = result.call.call_id;
        conversationID = options.conversationID.trim();
        publish();
        try {
            await dependencies.mediaSession.start({
                credential: result.credential,
                mediaType: readMediaType(options.callType),
            });
        }
        catch (cause) {
            /** startedCallID 固定本次 Gateway 已创建的通话。 */
            const startedCallID = callID;
            callID = null;
            conversationID = null;
            if (startedCallID) {
                await dependencies.calls.cancel(startedCallID).catch(() => undefined);
            }
            publish();
            throw cause;
        }
    };
    /** 媒体失败后刷新凭据并重建同一 call ID 的房间连接。 */
    const retryMedia = async () => {
        requireUsable();
        if (!callID) {
            if (!lastStartOptions)
                throw new Error('Web IM outgoing call is not active.');
            await start(lastStartOptions);
            return;
        }
        /** retryCallID 防止异步刷新后串到新通话。 */
        const retryCallID = callID;
        /** mediaType 必须来自首次启动留下的无凭据快照。 */
        const mediaType = mediaSnapshot.mediaType;
        if (!mediaType)
            throw new Error('Web IM outgoing call media type is unavailable.');
        const result = await dependencies.calls.refreshToken(retryCallID);
        if (disposed || callID !== retryCallID)
            return;
        await dependencies.mediaSession.stop();
        if (disposed || callID !== retryCallID)
            return;
        await dependencies.mediaSession.start({ credential: result.credential, mediaType });
    };
    /** 结束当前通话并按是否接通过选择 shared cancel/hangup。 */
    const end = async (reason = 'hangup') => {
        if (ending)
            return;
        ending = true;
        publish();
        /** endingCallID 固定本次清理目标。 */
        const endingCallID = callID;
        callID = null;
        conversationID = null;
        try {
            await dependencies.mediaSession.stop();
            if (endingCallID) {
                if (hasPeerConnected) {
                    await dependencies.calls.hangup(endingCallID, reason);
                }
                else {
                    await dependencies.calls.cancel(endingCallID);
                }
            }
        }
        finally {
            hasPeerConnected = false;
            lastStartOptions = null;
            ending = false;
            publish();
        }
    };
    /** 远端终态只释放媒体并清空本地身份，不重复发送 cancel/hangup。 */
    const handleRemoteTerminal = async () => {
        if (ending)
            return;
        ending = true;
        callID = null;
        conversationID = null;
        publish();
        try {
            await dependencies.mediaSession.stop();
        }
        finally {
            hasPeerConnected = false;
            lastStartOptions = null;
            ending = false;
            publish();
        }
    };
    /** 读取不含媒体凭据的组合快照。 */
    const getSnapshot = () => ({
        ...mediaSnapshot,
        callID,
        conversationID,
        ending,
    });
    /** 订阅组合快照并返回幂等退订。 */
    const subscribe = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    };
    /** 页面生命周期结束时先收敛远端状态，再释放媒体会话。 */
    const dispose = async () => {
        if (disposed)
            return;
        await end('route_exit').catch(() => undefined);
        disposed = true;
        unsubscribeMedia();
        listeners.clear();
        await dependencies.mediaSession.dispose();
    };
    return {
        start,
        retryMedia,
        setMicrophoneEnabled: enabled => dependencies.mediaSession.setMicrophoneEnabled(enabled),
        setCameraEnabled: enabled => dependencies.mediaSession.setCameraEnabled(enabled),
        resumeAudioPlayback: () => dependencies.mediaSession.resumeAudioPlayback(),
        handleRemoteTerminal,
        end,
        getSnapshot,
        subscribe,
        dispose,
    };
}
//# sourceMappingURL=browser-outgoing-call.js.map