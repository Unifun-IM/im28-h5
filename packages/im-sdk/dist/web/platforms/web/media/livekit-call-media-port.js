/** LiveKit 事件字符串保持 SDK Web adapter 可在 Room 创建前按需加载引擎。 */
const LIVEKIT_ROOM_EVENTS = {
    participantConnected: 'participantConnected',
    participantDisconnected: 'participantDisconnected',
    reconnecting: 'reconnecting',
    reconnected: 'reconnected',
    disconnected: 'disconnected',
    mediaDevicesError: 'mediaDevicesError',
    audioPlaybackChanged: 'audioPlaybackChanged',
    trackSubscribed: 'trackSubscribed',
    trackUnsubscribed: 'trackUnsubscribed',
    localTrackPublished: 'localTrackPublished',
    localTrackUnpublished: 'localTrackUnpublished',
};
/** 在用户明确呼出并取得凭据后才加载真实浏览器媒体引擎。 */
async function createDefaultLiveKitRoom() {
    /** liveKitModule 独立成 RTC chunk，主页面不得预加载 WebRTC 实现。 */
    const liveKitModule = await import('livekit-client');
    return new liveKitModule.Room({
        adaptiveStream: false,
        dynacast: false,
        singlePeerConnection: false,
        disconnectOnPageLeave: true,
    });
}
/** 从 LiveKit 事件参数读取非空参与者身份。 */
function readParticipantID(value) {
    if (!value || typeof value !== 'object' || !('identity' in value))
        return '';
    /** identity 只接受 LiveKit 已解码的字符串身份。 */
    const identity = value.identity;
    return typeof identity === 'string' ? identity.trim() : '';
}
/** 将 LiveKit disconnect reason 转成不含凭据的可观察文案。 */
function readDisconnectReason(value) {
    if (value === undefined || value === null)
        return undefined;
    /** reason 拒绝对象序列化，避免意外暴露底层上下文。 */
    const reason = typeof value === 'string' || typeof value === 'number'
        ? String(value).trim()
        : '';
    return reason || undefined;
}
/** 创建只存在于 `/web` 构建入口的真实 LiveKit 媒体端口。 */
export function createLiveKitCallMediaPort(dependencies = {}) {
    /** listeners 保存上层媒体状态机订阅，不进入 LiveKit 实例。 */
    const listeners = new Set();
    /** room 只在单次连接期间存在，断开后立即释放引用。 */
    let room = null;
    /** roomBindings 确保断开时逐项解除 LiveKit listener。 */
    let roomBindings = [];
    /** mediaElements 由 route DOM 生命周期提供，不由 SDK 创建节点。 */
    let mediaElements = {
        audioElement: null,
        remoteVideoElement: null,
        localVideoElement: null,
    };
    /** attachedTracks 记录轨道与目标节点，保证 route/room cleanup 对称。 */
    const attachedTracks = new Map();
    /** knownTracks 保留 DOM 尚未挂载时已经订阅/发布的轨道。 */
    const knownTracks = new Map();
    /** 向所有会话消费者同步同一个不可变端口事件。 */
    const emit = (event) => {
        for (const listener of listeners)
            listener(event);
    };
    /** 把远端音频/视频或本地视频挂到 H5 提供的对应节点。 */
    const attachTrack = (track, local) => {
        if (!track || typeof track !== 'object' || !('attach' in track))
            return;
        /** mediaTrack 仅消费 LiveKit 公共 kind/attach/detach contract。 */
        const mediaTrack = track;
        knownTracks.set(mediaTrack, local);
        /** element 按轨道方向和类型选择，麦克风本地音频不回放。 */
        const element = mediaTrack.kind === 'audio'
            ? (local ? null : mediaElements.audioElement)
            : (local ? mediaElements.localVideoElement : mediaElements.remoteVideoElement);
        if (!element || attachedTracks.has(mediaTrack))
            return;
        mediaTrack.attach(element);
        attachedTracks.set(mediaTrack, element);
    };
    /** 解除一个轨道与其当前 DOM 节点。 */
    const detachTrack = (track) => {
        if (!track || typeof track !== 'object')
            return;
        /** mediaTrack 与 attachedTracks 使用同一对象身份。 */
        const mediaTrack = track;
        /** element 未命中代表该轨道从未挂载。 */
        const element = attachedTracks.get(mediaTrack);
        if (!element)
            return;
        mediaTrack.detach(element);
        attachedTracks.delete(mediaTrack);
        knownTracks.delete(mediaTrack);
    };
    /** 解除当前 Room 下的全部媒体节点绑定。 */
    const detachAllTracks = () => {
        for (const [track, element] of attachedTracks)
            track.detach(element);
        attachedTracks.clear();
    };
    /** 解除当前 Room 的全部事件，避免旧房间污染新会话。 */
    const unbindRoom = (target) => {
        for (const binding of roomBindings) {
            target.off(binding.event, binding.listener);
        }
        roomBindings = [];
    };
    /** 为新 Room 建立 LiveKit 到稳定端口事件的一对一映射。 */
    const bindRoom = (target) => {
        /** bindings 只包含媒体状态机实际消费的 LiveKit 事件。 */
        const bindings = [
            {
                event: LIVEKIT_ROOM_EVENTS.participantConnected,
                listener: participant => {
                    /** participantID 未知时不制造成员身份。 */
                    const participantID = readParticipantID(participant);
                    if (participantID)
                        emit({ type: 'participant_connected', participantID });
                },
            },
            {
                event: LIVEKIT_ROOM_EVENTS.participantDisconnected,
                listener: participant => {
                    /** participantID 未知时不误删其他成员。 */
                    const participantID = readParticipantID(participant);
                    if (participantID)
                        emit({ type: 'participant_disconnected', participantID });
                },
            },
            { event: LIVEKIT_ROOM_EVENTS.reconnecting, listener: () => emit({ type: 'reconnecting' }) },
            { event: LIVEKIT_ROOM_EVENTS.reconnected, listener: () => emit({ type: 'reconnected' }) },
            {
                event: LIVEKIT_ROOM_EVENTS.disconnected,
                listener: value => {
                    /** reason 只在成功归一化后进入 exact-optional 事件。 */
                    const reason = readDisconnectReason(value);
                    emit({ type: 'disconnected', ...(reason ? { reason } : {}) });
                },
            },
            {
                event: LIVEKIT_ROOM_EVENTS.mediaDevicesError,
                listener: cause => emit({ type: 'media_devices_error', cause }),
            },
            {
                event: LIVEKIT_ROOM_EVENTS.audioPlaybackChanged,
                listener: playing => emit({
                    type: playing === true ? 'audio_playback_ready' : 'audio_playback_blocked',
                }),
            },
            {
                event: LIVEKIT_ROOM_EVENTS.trackSubscribed,
                listener: track => attachTrack(track, false),
            },
            {
                event: LIVEKIT_ROOM_EVENTS.trackUnsubscribed,
                listener: track => detachTrack(track),
            },
            {
                event: LIVEKIT_ROOM_EVENTS.localTrackPublished,
                listener: publication => {
                    /** track 是 LiveKit publication 当前已发布的本地轨道。 */
                    const track = publication && typeof publication === 'object' && 'track' in publication
                        ? publication.track
                        : null;
                    attachTrack(track, true);
                },
            },
            {
                event: LIVEKIT_ROOM_EVENTS.localTrackUnpublished,
                listener: publication => {
                    /** track 与发布事件使用同一 LiveKit 对象身份。 */
                    const track = publication && typeof publication === 'object' && 'track' in publication
                        ? publication.track
                        : null;
                    detachTrack(track);
                },
            },
        ];
        roomBindings = bindings;
        for (const binding of bindings)
            target.on(binding.event, binding.listener);
    };
    /** 连接真实 LiveKit Room，并补发入房前已存在的远端成员。 */
    const connect = async (credential) => {
        if (room)
            throw new Error('LiveKit call media port is already connected.');
        /** target 是本次连接唯一 Room owner。 */
        const target = await (dependencies.createRoom ?? createDefaultLiveKitRoom)();
        room = target;
        bindRoom(target);
        await target.connect(credential.serverUrl, credential.token);
        for (const participant of target.remoteParticipants.values()) {
            /** participantID 为空时保持 fail-closed。 */
            const participantID = participant.identity.trim();
            if (participantID)
                emit({ type: 'participant_connected', participantID });
        }
        if (!target.canPlaybackAudio)
            emit({ type: 'audio_playback_blocked' });
    };
    /** 幂等断开当前 Room 并要求 LiveKit 停止本地轨道。 */
    const disconnect = async () => {
        /** target 先从共享引用移除，防止断开期间重入。 */
        const target = room;
        room = null;
        if (!target)
            return;
        unbindRoom(target);
        detachAllTracks();
        knownTracks.clear();
        await target.disconnect(true);
    };
    /** 返回当前 Room，不允许未连接时操作浏览器设备。 */
    const requireRoom = () => {
        if (!room)
            throw new Error('LiveKit call media port is not connected.');
        return room;
    };
    return {
        connect,
        disconnect,
        setMicrophoneEnabled: enabled => requireRoom().localParticipant.setMicrophoneEnabled(enabled).then(() => undefined),
        setCameraEnabled: enabled => requireRoom().localParticipant.setCameraEnabled(enabled).then(() => undefined),
        startAudioPlayback: () => requireRoom().startAudio(),
        setMediaElements: elements => {
            detachAllTracks();
            mediaElements = elements;
            for (const [track, local] of knownTracks)
                attachTrack(track, local);
        },
        subscribe: listener => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
}
//# sourceMappingURL=livekit-call-media-port.js.map