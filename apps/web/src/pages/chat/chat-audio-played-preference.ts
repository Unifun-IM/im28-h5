/** 语音已播放偏好只依赖浏览器同步键值存储。 */
export interface ChatAudioPlayedStorage {
  readonly getItem: (key: string) => string | null;
  readonly setItem: (key: string, value: string) => void;
}

/** 构造与 RN 一致且按账号、会话隔离的语音已播放存储键。 */
export function getChatAudioPlayedStorageKey(
  userID: string,
  conversationID: string,
): string {
  return `im28.voicePlayed.${userID.trim() || 'guest'}.${conversationID.trim()}`;
}

/** 从浏览器偏好恢复稳定语音消息身份集合。 */
export function readChatAudioPlayedMessageIDs(
  userID: string,
  conversationID: string,
  storage: ChatAudioPlayedStorage | null = resolveChatAudioPlayedStorage(),
): ReadonlySet<string> {
  if (!storage || !conversationID.trim()) return new Set();
  try {
    /** raw 是 RN 兼容的消息 ID JSON 数组。 */
    const raw = storage.getItem(getChatAudioPlayedStorageKey(userID, conversationID));
    if (!raw) return new Set();
    /** parsed 只接受数组，损坏或旧类型按空偏好处理。 */
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    /** ids 去除空身份并保持首次出现顺序。 */
    const ids = parsed.map(value => String(value ?? '').trim()).filter(Boolean);
    return new Set(ids);
  } catch {
    return new Set();
  }
}

/** 把当前语音已播放身份写回账号会话隔离偏好。 */
export function writeChatAudioPlayedMessageIDs(
  userID: string,
  conversationID: string,
  messageIDs: ReadonlySet<string>,
  storage: ChatAudioPlayedStorage | null = resolveChatAudioPlayedStorage(),
): void {
  if (!storage || !conversationID.trim()) return;
  try {
    /** ids 只保存非空稳定身份，不写消息正文或媒体地址。 */
    const ids = Array.from(messageIDs, value => value.trim()).filter(Boolean);
    storage.setItem(
      getChatAudioPlayedStorageKey(userID, conversationID),
      JSON.stringify(ids),
    );
  } catch {
    // 浏览器拒绝 localStorage 时保留当前页面内存状态。
  }
}

/** 安全取得 localStorage，隐私策略拒绝时返回 null。 */
function resolveChatAudioPlayedStorage(): ChatAudioPlayedStorage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}
