/** 信令去重集合的上限避免长连接运行时无限增长。 */
const MAX_SEEN_SIGNAL_IDS = 128;
/** 已终结通话集合的上限覆盖乱序窗口并限制内存占用。 */
const MAX_CLOSED_CALL_IDS = 64;
/** 创建不包含任何账号或通话信息的来电初始状态。 */
export function createIMIncomingCallLifecycleState() {
    return {
        snapshot: { phase: 'idle', call: null, revision: 0 },
        seenSignalIDs: [],
        closedCallIDs: [],
    };
}
/** 重置账号绑定的来电、去重和终态状态。 */
export function resetIMIncomingCallLifecycleState(state) {
    if (state.snapshot.phase === 'idle' &&
        state.seenSignalIDs.length === 0 &&
        state.closedCallIDs.length === 0) {
        return state;
    }
    /** hadVisibleCall 仅在账号清理确实关闭 UI 来电时推进公开 revision。 */
    const hadVisibleCall = state.snapshot.call !== null;
    return {
        snapshot: {
            phase: 'idle',
            call: null,
            revision: state.snapshot.revision + (hadVisibleCall ? 1 : 0),
        },
        seenSignalIDs: [],
        closedCallIDs: [],
    };
}
/** 按服务端到达顺序应用一批 RTC 过程通知。 */
export function reduceIMIncomingCallSignals(state, signals, currentUserID) {
    /** normalizedUserID 防止匿名 runtime 接管来电。 */
    const normalizedUserID = currentUserID.trim();
    if (!normalizedUserID)
        return state;
    /** nextState 串行承接同一 WebSocket frame 内的全部迁移。 */
    let nextState = state;
    for (const signal of signals) {
        nextState = reduceIMIncomingCallSignal(nextState, signal, normalizedUserID);
    }
    return nextState;
}
/** 将 Gateway pending 结果恢复为与实时邀请相同的响铃快照。 */
export function reconcileIMPendingIncomingCall(state, pending, currentUserID) {
    /** normalizedUserID 防止匿名或空账号恢复跨账号 pending。 */
    const normalizedUserID = currentUserID.trim();
    /** call 只接受 Gateway 明确声明的 pending 记录。 */
    const call = pending.has_pending === true ? pending.call : null;
    if (!normalizedUserID)
        return state;
    if (!call) {
        return state.snapshot.call
            ? dismissIMIncomingCall(state, state.snapshot.call.callID)
            : state;
    }
    if (state.snapshot.call)
        return state;
    /** callID 是 pending 与后续实时终态关联的唯一主键。 */
    const callID = readString(call.call_id);
    /** conversationID 保证后续接听 UI 可以返回来源会话。 */
    const conversationID = readString(call.conversation_id);
    /** callerID 同时用于排除本人呼出记录。 */
    const callerID = readString(call.caller_id);
    /** callType 拒绝未知媒体类型静默降级。 */
    const callType = normalizeCallType(call.call_type);
    /** status 缺省兼容旧网关，非 ringing 状态不可恢复响铃。 */
    const status = readString(call.status).toLowerCase();
    /** direction 明确 outgoing 时不能展示为远端来电。 */
    const direction = readString(call.direction).toLowerCase();
    if (!callID ||
        !conversationID ||
        !callerID ||
        callerID === normalizedUserID ||
        !callType ||
        (status && status !== 'ringing') ||
        direction === 'outgoing' ||
        state.closedCallIDs.includes(callID)) {
        return state;
    }
    /** incomingCall 与 RN pending 恢复保持 room 缺失时回退 call ID。 */
    const incomingCall = {
        callID,
        conversationID,
        roomName: readString(call.room_name) || callID,
        callerID,
        callType,
        mediaType: callType === 'video' ? 'video' : 'voice',
        e2eeRequired: false,
        source: 'pending',
    };
    return publishIncomingCall(state, incomingCall);
}
/** 收起本地已处理的指定来电，但允许后续 Gateway pending 重新校验。 */
export function dismissIMIncomingCall(state, callID) {
    /** normalizedCallID 阻止空操作误清当前来电。 */
    const normalizedCallID = callID.trim();
    if (!normalizedCallID || state.snapshot.call?.callID !== normalizedCallID) {
        return state;
    }
    return {
        ...state,
        snapshot: {
            phase: 'idle',
            call: null,
            revision: state.snapshot.revision + 1,
        },
    };
}
/** 应用单条过程通知并记录跨设备事件身份。 */
function reduceIMIncomingCallSignal(state, signal, currentUserID) {
    /** signalID 优先使用服务端 event ID，旧事件退化为通话加类型。 */
    const signalID = signal.eventID || `${signal.key}:${signal.callID}`;
    if (state.seenSignalIDs.includes(signalID))
        return state;
    /** stateWithSignal 在任何分支都保留去重事实。 */
    const stateWithSignal = {
        ...state,
        seenSignalIDs: appendBounded(state.seenSignalIDs, signalID, MAX_SEEN_SIGNAL_IDS),
    };
    if (signal.key === 'rtc.call.invite') {
        if (signal.callerID === currentUserID ||
            stateWithSignal.closedCallIDs.includes(signal.callID)) {
            return stateWithSignal;
        }
        /** incomingCall 仅由 strict parser 已验证的实时字段构建。 */
        const incomingCall = {
            callID: signal.callID,
            conversationID: signal.conversationID,
            roomName: signal.roomName,
            callerID: signal.callerID,
            callType: signal.callType,
            mediaType: signal.mediaType,
            e2eeRequired: signal.e2eeRequired,
            source: 'realtime',
        };
        return publishIncomingCall(stateWithSignal, incomingCall);
    }
    /** closedState 让终态先到时阻止迟到邀请复活。 */
    const closedState = {
        ...stateWithSignal,
        closedCallIDs: appendBounded(stateWithSignal.closedCallIDs, signal.callID, MAX_CLOSED_CALL_IDS),
    };
    if (closedState.snapshot.call?.callID !== signal.callID)
        return closedState;
    return {
        ...closedState,
        snapshot: {
            phase: 'idle',
            call: null,
            revision: closedState.snapshot.revision + 1,
        },
    };
}
/** 发布新来电；完全相同的 pending/realtime 重放不增加 revision。 */
function publishIncomingCall(state, call) {
    if (isSameIncomingCall(state.snapshot.call, call))
        return state;
    return {
        ...state,
        snapshot: {
            phase: 'ringing',
            call,
            revision: state.snapshot.revision + 1,
        },
    };
}
/** 判断公开来电身份是否未发生可见变化。 */
function isSameIncomingCall(current, next) {
    return Boolean(current &&
        current.callID === next.callID &&
        current.conversationID === next.conversationID &&
        current.roomName === next.roomName &&
        current.callerID === next.callerID &&
        current.callType === next.callType &&
        current.e2eeRequired === next.e2eeRequired);
}
/** 向有界唯一数组追加最新身份。 */
function appendBounded(values, value, limit) {
    /** nextValues 删除旧位置后把最新访问放到末尾。 */
    const nextValues = [...values.filter(item => item !== value), value];
    return nextValues.length > limit ? nextValues.slice(-limit) : nextValues;
}
/** 将 Gateway pending 媒体类型归一化到共享枚举。 */
function normalizeCallType(value) {
    /** normalizedType 兼容 RN 已接受的 voice 别名。 */
    const normalizedType = readString(value).toLowerCase();
    if (normalizedType === 'audio' || normalizedType === 'voice')
        return 'audio';
    if (normalizedType === 'video')
        return 'video';
    return null;
}
/** 安全读取 Gateway 可选字符串。 */
function readString(value) {
    return typeof value === 'string' ? value.trim() : '';
}
//# sourceMappingURL=incoming-call-lifecycle.js.map