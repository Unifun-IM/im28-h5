/** 创建不含鉴权凭据的初始媒体快照。 */
const createInitialSnapshot = () => ({
    state: 'idle',
    mediaType: null,
    microphoneEnabled: false,
    cameraEnabled: false,
    participantIDs: [],
    audioPlaybackBlocked: false,
    error: null,
});
/** 判断当前连接阶段是否允许操作本地媒体轨道。 */
const isActiveState = (state) => state === 'connected' || state === 'reconnecting';
/** 将未知异常转换为可观察错误，同时保留原始错误对象。 */
const toMediaError = (cause) => cause instanceof Error ? cause : new Error(String(cause));
/** 创建与具体媒体引擎解耦的浏览器通话会话状态机。 */
export const createWebIMCallMediaSession = (port) => {
    /** 保存当前可观察快照。 */
    let snapshot = createInitialSnapshot();
    /** 保存订阅快照变化的监听器。 */
    const listeners = new Set();
    /** 保存媒体引擎事件的退订函数。 */
    let unsubscribePort = null;
    /** 标记会话是否已经销毁。 */
    let disposed = false;
    /** 使过期的异步启动结果无法覆盖新状态。 */
    let operationVersion = 0;
    /** 发布不可变快照并通知所有消费者。 */
    const publish = (next) => {
        snapshot = next;
        for (const listener of listeners) {
            listener();
        }
    };
    /** 在会话已销毁时阻止继续执行媒体操作。 */
    const requireUsable = () => {
        if (disposed) {
            throw new Error('Web IM call media session has been disposed.');
        }
    };
    /** 处理底层媒体引擎事件并投影到稳定快照。 */
    const handlePortEvent = (event) => {
        if (disposed) {
            return;
        }
        if (event.type === 'participant_connected') {
            /** 合并后使用 Set 避免重复参与者。 */
            const participantIDs = Array.from(new Set([...snapshot.participantIDs, event.participantID]));
            publish({ ...snapshot, participantIDs });
            return;
        }
        if (event.type === 'participant_disconnected') {
            /** 删除已离开参与者而不改变其他媒体状态。 */
            const participantIDs = snapshot.participantIDs.filter((participantID) => participantID !== event.participantID);
            publish({ ...snapshot, participantIDs });
            return;
        }
        if (event.type === 'reconnecting') {
            publish({ ...snapshot, state: 'reconnecting' });
            return;
        }
        if (event.type === 'reconnected') {
            publish({ ...snapshot, state: 'connected', error: null });
            return;
        }
        if (event.type === 'media_devices_error') {
            publish({ ...snapshot, error: toMediaError(event.cause) });
            return;
        }
        if (event.type === 'audio_playback_blocked') {
            publish({ ...snapshot, audioPlaybackBlocked: true });
            return;
        }
        if (event.type === 'audio_playback_ready') {
            publish({ ...snapshot, audioPlaybackBlocked: false });
            return;
        }
        operationVersion += 1;
        unsubscribePort?.();
        unsubscribePort = null;
        publish({
            ...snapshot,
            state: 'disconnected',
            microphoneEnabled: false,
            cameraEnabled: false,
            participantIDs: [],
            audioPlaybackBlocked: false,
            error: event.reason ? new Error(event.reason) : null,
        });
    };
    /** 启动单次媒体会话并发布所需本地轨道。 */
    const start = async (options) => {
        requireUsable();
        if (snapshot.state === 'connecting' || isActiveState(snapshot.state)) {
            throw new Error('Web IM call media session is already active.');
        }
        /** 标记本次异步启动操作。 */
        const currentVersion = ++operationVersion;
        unsubscribePort?.();
        unsubscribePort = port.subscribe(handlePortEvent);
        publish({
            ...createInitialSnapshot(),
            state: 'connecting',
            mediaType: options.mediaType,
        });
        try {
            await port.connect(options.credential);
            if (currentVersion !== operationVersion || disposed) {
                await port.disconnect().catch(() => undefined);
                return;
            }
            await port.setMicrophoneEnabled(true);
            if (currentVersion !== operationVersion || disposed) {
                await port.setMicrophoneEnabled(false).catch(() => undefined);
                await port.disconnect().catch(() => undefined);
                return;
            }
            if (options.mediaType === 'video') {
                await port.setCameraEnabled(true);
                if (currentVersion !== operationVersion || disposed) {
                    await port.setCameraEnabled(false).catch(() => undefined);
                    await port.setMicrophoneEnabled(false).catch(() => undefined);
                    await port.disconnect().catch(() => undefined);
                    return;
                }
            }
            publish({
                ...snapshot,
                state: 'connected',
                microphoneEnabled: true,
                cameraEnabled: options.mediaType === 'video',
                error: null,
            });
        }
        catch (cause) {
            if (currentVersion !== operationVersion || disposed) {
                return;
            }
            unsubscribePort?.();
            unsubscribePort = null;
            await port.disconnect().catch(() => undefined);
            publish({
                ...snapshot,
                state: 'failed',
                microphoneEnabled: false,
                cameraEnabled: false,
                participantIDs: [],
                audioPlaybackBlocked: false,
                error: toMediaError(cause),
            });
            throw cause;
        }
    };
    /** 停止媒体会话并释放当前房间订阅。 */
    const stop = async () => {
        operationVersion += 1;
        unsubscribePort?.();
        unsubscribePort = null;
        await port.disconnect().catch(() => undefined);
        publish({
            ...createInitialSnapshot(),
            state: 'disconnected',
        });
    };
    /** 切换麦克风发布状态并在失败时保持旧快照。 */
    const setMicrophoneEnabled = async (enabled) => {
        requireUsable();
        if (!isActiveState(snapshot.state)) {
            throw new Error('Web IM call media session is not connected.');
        }
        /** 记录轨道操作对应的当前会话版本。 */
        const currentVersion = operationVersion;
        await port.setMicrophoneEnabled(enabled);
        if (currentVersion !== operationVersion || !isActiveState(snapshot.state)) {
            return;
        }
        publish({ ...snapshot, microphoneEnabled: enabled, error: null });
    };
    /** 仅为视频会话切换摄像头发布状态。 */
    const setCameraEnabled = async (enabled) => {
        requireUsable();
        if (!isActiveState(snapshot.state) || snapshot.mediaType !== 'video') {
            throw new Error('Web IM video call media session is not connected.');
        }
        /** 记录轨道操作对应的当前会话版本。 */
        const currentVersion = operationVersion;
        await port.setCameraEnabled(enabled);
        if (currentVersion !== operationVersion || !isActiveState(snapshot.state)) {
            return;
        }
        publish({ ...snapshot, cameraEnabled: enabled, error: null });
    };
    /** 在浏览器阻止自动播放后由用户手势恢复远端音频。 */
    const resumeAudioPlayback = async () => {
        requireUsable();
        if (!snapshot.audioPlaybackBlocked) {
            return;
        }
        /** 记录自动播放恢复对应的当前会话版本。 */
        const currentVersion = operationVersion;
        await port.startAudioPlayback();
        if (currentVersion !== operationVersion || !isActiveState(snapshot.state)) {
            return;
        }
        publish({ ...snapshot, audioPlaybackBlocked: false, error: null });
    };
    /** 返回最近一次不可变媒体快照。 */
    const getSnapshot = () => snapshot;
    /** 订阅快照变化并返回幂等退订函数。 */
    const subscribe = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    };
    /** 销毁会话并释放底层媒体连接。 */
    const dispose = async () => {
        if (disposed) {
            return;
        }
        disposed = true;
        await stop();
        listeners.clear();
    };
    return {
        start,
        stop,
        setMicrophoneEnabled,
        setCameraEnabled,
        resumeAudioPlayback,
        getSnapshot,
        subscribe,
        dispose,
    };
};
//# sourceMappingURL=browser-call-session.js.map