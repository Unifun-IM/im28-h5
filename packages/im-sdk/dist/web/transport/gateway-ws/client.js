const OPEN = 1;
const DEFAULT_HEARTBEAT_INTERVAL_MS = 25_000;
const DEFAULT_PONG_TIMEOUT_MS = 10_000;
const DEFAULT_RECONNECT_BASE_DELAY_MS = 1_000;
const DEFAULT_RECONNECT_MAX_DELAY_MS = 30_000;
const DEFAULT_MAX_RECONNECT_ATTEMPTS = Number.POSITIVE_INFINITY;
// Gateway 业务码 100003 表示当前凭证已失效，禁止继续使用旧 token 重连。
const GATEWAY_AUTH_INVALID_CODE = 100003;
export function createGatewayRealtimeClient(options) {
    return new GatewayRealtimeClientImpl(options);
}
class GatewayRealtimeClientImpl {
    options;
    handlers = new Set();
    setTimer;
    clearTimer;
    state = 'idle';
    socket = null;
    heartbeatTimer = null;
    pongTimer = null;
    reconnectTimer = null;
    reconnectAttempts = 0;
    manualClose = false;
    constructor(options) {
        this.options = options;
        this.setTimer =
            options.setTimeout ??
                ((handler, timeoutMs) => globalThis.setTimeout(handler, timeoutMs));
        this.clearTimer =
            options.clearTimeout ??
                (timer => globalThis.clearTimeout(timer));
    }
    connect() {
        this.manualClose = false;
        this.clearReconnect();
        this.openSocket('connecting');
    }
    close() {
        this.manualClose = true;
        this.clearHeartbeat();
        this.clearPongTimeout();
        this.clearReconnect();
        const socket = this.socket;
        this.socket = null;
        if (socket) {
            socket.onopen = null;
            socket.onmessage = null;
            socket.onerror = null;
            socket.onclose = null;
            socket.close(1000, 'client logout');
        }
        this.setState('closed');
    }
    send(data) {
        const socket = this.socket;
        if (!socket || socket.readyState !== OPEN) {
            return;
        }
        socket.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
    onEvent(handler) {
        this.handlers.add(handler);
        return () => {
            this.handlers.delete(handler);
        };
    }
    getState() {
        return this.state;
    }
    openSocket(state) {
        this.clearHeartbeat();
        this.clearPongTimeout();
        this.setState(state);
        this.emit({ type: state === 'reconnecting' ? 'reconnecting' : 'connecting' });
        let socket;
        try {
            const url = this.buildURL();
            socket = new this.options.WebSocket(url);
        }
        catch (error) {
            this.emit({ type: 'error', data: error, raw: error });
            if (!this.manualClose) {
                this.scheduleReconnect();
            }
            return;
        }
        this.socket = socket;
        socket.onopen = () => {
            this.reconnectAttempts = 0;
            this.setState('connected');
            this.emit({ type: 'connected' });
            this.sendAuthFrame();
            this.startHeartbeat();
        };
        socket.onmessage = event => {
            this.clearPongTimeout();
            this.handleMessage(event.data);
        };
        socket.onerror = event => {
            this.emit({ type: 'error', data: event, raw: event });
            if (!this.manualClose) {
                this.reconnectSocket(socket, 'socket error');
            }
        };
        socket.onclose = event => {
            this.clearHeartbeat();
            this.clearPongTimeout();
            if (this.socket === socket) {
                this.socket = null;
            }
            this.emit({ type: 'disconnected', data: event, raw: event });
            if (!this.manualClose) {
                this.scheduleReconnect();
            }
            else {
                this.setState('closed');
            }
        };
    }
    buildURL() {
        const base = this.options.url.trim();
        const separator = base.includes('?') ? '&' : '?';
        const params = [
            ['user_id', this.options.userID],
            ['device_id', this.options.deviceID],
            ['token', this.options.token],
        ]
            .filter((entry) => entry[1] !== undefined && String(entry[1]).length > 0)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
            .join('&');
        return params ? `${base}${separator}${params}` : base;
    }
    sendAuthFrame() {
        const proxy = this.options.getProxyConfig?.();
        this.send({
            type: 'auth',
            user_id: this.options.userID,
            token: this.options.token,
            platform_id: this.options.platformID,
            device_id: this.options.deviceID,
            proxy: proxy?.enabled ? proxy : undefined,
        });
    }
    startHeartbeat() {
        this.clearHeartbeat();
        const interval = this.options.heartbeatIntervalMs ?? DEFAULT_HEARTBEAT_INTERVAL_MS;
        if (interval <= 0) {
            return;
        }
        this.heartbeatTimer = this.setTimer(() => {
            this.send({ type: 'ping', ts: Date.now() });
            this.startPongTimeout();
            this.startHeartbeat();
        }, interval);
    }
    startPongTimeout() {
        this.clearPongTimeout();
        const timeout = this.options.pongTimeoutMs ?? DEFAULT_PONG_TIMEOUT_MS;
        if (timeout <= 0) {
            return;
        }
        const socket = this.socket;
        this.pongTimer = this.setTimer(() => {
            this.pongTimer = null;
            if (socket && this.socket === socket && !this.manualClose) {
                this.emit({ type: 'error', data: 'pong timeout', raw: 'pong timeout' });
                this.reconnectSocket(socket, 'pong timeout');
            }
        }, timeout);
    }
    reconnectSocket(socket, reason) {
        if (this.socket !== socket) {
            return;
        }
        this.clearHeartbeat();
        this.clearPongTimeout();
        this.socket = null;
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        socket.close(4000, reason);
        this.emit({ type: 'disconnected', data: reason, raw: reason });
        this.scheduleReconnect();
    }
    scheduleReconnect() {
        if (this.reconnectTimer !== null) {
            return;
        }
        const maxAttempts = this.options.maxReconnectAttempts ?? DEFAULT_MAX_RECONNECT_ATTEMPTS;
        if (this.reconnectAttempts >= maxAttempts) {
            this.setState('closed');
            return;
        }
        this.reconnectAttempts += 1;
        const base = this.options.reconnectBaseDelayMs ?? DEFAULT_RECONNECT_BASE_DELAY_MS;
        const max = this.options.reconnectMaxDelayMs ?? DEFAULT_RECONNECT_MAX_DELAY_MS;
        const delay = Math.min(max, base * 2 ** Math.max(0, this.reconnectAttempts - 1));
        this.setState('reconnecting');
        this.reconnectTimer = this.setTimer(() => {
            this.reconnectTimer = null;
            this.openSocket('reconnecting');
        }, delay);
    }
    handleMessage(raw) {
        const parsed = parseGatewayRealtimePayload(raw);
        if (!parsed) {
            return;
        }
        const events = normalizeGatewayRealtimeEvents(parsed);
        for (const event of events) {
            if (event.type === 'pong') {
                continue;
            }
            if (event.type === 'token_expired') {
                // 先关闭 socket 和全部定时器，再通知上层清理登录态。
                this.close();
            }
            this.emit(event);
        }
    }
    setState(state) {
        this.state = state;
    }
    clearHeartbeat() {
        if (this.heartbeatTimer !== null) {
            this.clearTimer(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
    clearPongTimeout() {
        if (this.pongTimer !== null) {
            this.clearTimer(this.pongTimer);
            this.pongTimer = null;
        }
    }
    clearReconnect() {
        if (this.reconnectTimer !== null) {
            this.clearTimer(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }
    emit(event) {
        for (const handler of [...this.handlers]) {
            handler(event);
        }
    }
}
export function parseGatewayRealtimePayload(raw) {
    if (typeof raw !== 'string') {
        return raw;
    }
    const value = raw.trim();
    if (!value) {
        return null;
    }
    try {
        return JSON.parse(value);
    }
    catch {
        return { type: value, data: value };
    }
}
export function normalizeGatewayRealtimeEvents(raw) {
    if (Array.isArray(raw)) {
        return raw.flatMap(item => normalizeGatewayRealtimeEvents(item));
    }
    if (!raw || typeof raw !== 'object') {
        return [];
    }
    const record = raw;
    const nested = record.events ?? record.notifications;
    if (Array.isArray(nested)) {
        return nested.flatMap(item => normalizeGatewayRealtimeEvents(item));
    }
    const dataSource = record.data ?? record.payload ?? record.message ?? record.body;
    const parsedDataSource = typeof dataSource === 'string' ? parseGatewayRealtimePayload(dataSource) : dataSource;
    const dataRecord = parsedDataSource && typeof parsedDataSource === 'object' && !Array.isArray(parsedDataSource)
        ? parsedDataSource
        : undefined;
    // 鉴权失效可能只携带业务码，没有 event/type 字段。
    const gatewayCode = readGatewayCode(record.code) ?? readGatewayCode(dataRecord?.code);
    if (gatewayCode === GATEWAY_AUTH_INVALID_CODE) {
        return [{ type: 'token_expired', data: parsedDataSource ?? record, raw }];
    }
    const batchUpdateEvents = normalizeGatewayRealtimeMessageUpdateBatchEvents(record, dataRecord, raw);
    if (batchUpdateEvents.length) {
        return batchUpdateEvents;
    }
    const event = readString(record.event) ??
        readString(dataRecord?.event) ??
        readString(record.event_name) ??
        readString(dataRecord?.event_name) ??
        readString(record.command) ??
        readString(dataRecord?.command) ??
        readString(record.action) ??
        readString(dataRecord?.action);
    const isMessageRecord = isGatewayRealtimeMessageRecord(record);
    const type = normalizeGatewayRealtimeEventType(readEventType(record.type) ??
        readEventType(dataRecord?.type) ??
        event ??
        (isMessageRecord ? 'message' : 'custom'));
    const data = isMessageRecord ? record : parsedDataSource ?? record;
    return [{ type, ...(event ? { event } : {}), data, raw }];
}
function normalizeGatewayRealtimeEventType(type) {
    const normalized = type.trim();
    switch (normalized) {
        case 'onConnecting':
        case 'connecting':
            return 'connecting';
        case 'onConnectSuccess':
        case 'connected':
            return 'connected';
        case 'onConnectFailed':
        case 'error':
            return 'error';
        case 'onKickedOffline':
        case 'kicked':
            return 'kicked';
        case 'onUserTokenExpired':
        case 'token_expired':
            return 'token_expired';
        case 'onRecvNewMessages':
        case 'onRecvNewMessage':
        case 'onRecvOfflineNewMessages':
        case 'onRecvOfflineNewMessage':
        case 'onRecvOnlineOnlyMessage':
        case 'message':
        case 'message.batch':
        case 'message.multi_batch':
        case 'message.created':
        case '101':
        case '102':
        case '103':
        case '104':
        case '105':
        case '110':
        case '108':
        case '1201':
        case '2102':
        case 'conversation_cleared':
        case '1400':
        case '1502':
        case '1503':
        case '1507':
        case 'group_owner_changed':
        case '1508':
        case '1512':
        case '1513':
        case '1514':
        case '1515':
        case '1520':
        case '1601':
        case '1602':
        case '1603':
        case '1604':
        case '1605':
        case '1606':
        case '1607':
        case '1608':
            return 'message';
        case 'message.update':
            return 'message.update';
        case '1200':
        case 'friend_application_created':
            return 'friend_application_created';
        case '1202':
        case 'friend_deleted':
        case 'friend.deleted':
        case 'onFriendDeleted':
            return 'friend_deleted';
        case 'onConversationChanged':
        case 'onNewConversation':
        case 'conversation':
        case 'conversation.changed':
            return 'conversation';
        case 'onFriendAdded':
        case 'onFriendInfoChanged':
        case 'onBlackAdded':
        case 'onBlackDeleted':
        case 'onFriendApplicationAdded':
        case 'onFriendApplicationAccepted':
        case 'onFriendApplicationRejected':
        case 'onFriendApplicationDeleted':
        case 'friend':
        case 'friend.changed':
            return 'friend';
        case 'onGroupApplicationAdded':
        case 'onGroupApplicationAccepted':
        case 'onGroupApplicationRejected':
        case 'onGroupApplicationDeleted':
        case 'onJoinedGroupAdded':
        case 'onJoinedGroupDeleted':
        case 'onGroupInfoChanged':
        case 'onGroupMemberAdded':
        case 'onGroupMemberDeleted':
        case 'onGroupMemberInfoChanged':
        case 'onGroupDismissed':
        case 'group':
        case 'group.changed':
            return 'group';
        case 'onSelfInfoUpdated':
        case 'self':
        case 'self.changed':
            return 'self';
        case 'onUserStatusChanged':
        case 'user_status':
            return 'user_status';
        default:
            return normalized || 'custom';
    }
}
function normalizeGatewayRealtimeMessageUpdateBatchEvents(record, dataRecord, raw) {
    const batch = findGatewayRealtimeMessageUpdateBatch(record, dataRecord);
    if (!batch) {
        return [];
    }
    const updates = batch.updates;
    const conversationID = readString(batch.conversation_id);
    const serverTime = readString(batch.server_time);
    const batchID = readString(batch.batch_id);
    const latestUpdateSeq = batch.latest_update_seq;
    return updates
        .filter((update) => Boolean(update && typeof update === 'object' && !Array.isArray(update)))
        .map(update => {
        const data = {
            ...update,
            ...(conversationID && !readString(update.conversation_id)
                ? { conversation_id: conversationID }
                : {}),
            ...(serverTime && !readString(update.server_time)
                ? { server_time: serverTime }
                : {}),
            ...(batchID ? { batch_id: batchID } : {}),
            ...(latestUpdateSeq === undefined ? {} : { latest_update_seq: latestUpdateSeq }),
            event_type: readString(update.event_type) ??
                readString(batch.event_type) ??
                'message.update',
        };
        const event = readString(data.event_type);
        return {
            type: 'message.update',
            ...(event ? { event } : {}),
            data,
            raw,
        };
    });
}
function findGatewayRealtimeMessageUpdateBatch(record, dataRecord) {
    for (const candidate of [record, dataRecord]) {
        if (!candidate) {
            continue;
        }
        const type = readEventType(candidate.type);
        const eventType = readString(candidate.event_type);
        if ((type === 'message.update.batch' ||
            eventType === 'message.updates.batch') &&
            Array.isArray(candidate.updates)) {
            return candidate;
        }
    }
    return null;
}
function readString(value) {
    return typeof value === 'string' && value.trim() ? value : undefined;
}
function readEventType(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
    }
    return readString(value);
}
// 兼容 Gateway 通过 number 或数字字符串传递业务错误码。
function readGatewayCode(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    if (typeof value !== 'string' || !value.trim()) {
        return undefined;
    }
    // 字符串业务码统一转换后再做严格匹配。
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}
function isGatewayRealtimeMessageRecord(record) {
    return (typeof record.type === 'number' ||
        Boolean(record.msg_id || record.client_msg_id || record.event_id) ||
        Boolean(record.body && typeof record.body === 'object'));
}
//# sourceMappingURL=client.js.map