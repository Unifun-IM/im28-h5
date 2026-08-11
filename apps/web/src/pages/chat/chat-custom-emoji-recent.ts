import type { ChatSystemEmojiStorage } from './chat-system-emoji-recent.js';

/** 与 RN 自定义表情常用区保持相同的 preference key。 */
const CHAT_CUSTOM_EMOJI_RECENT_KEY = 'im28.chat.customEmoji.recent';
/** 常用区最多保留服务端允许的 100 个稳定身份。 */
const CHAT_CUSTOM_EMOJI_RECENT_LIMIT = 100;

/** 读取浏览器中的自定义表情 ID MRU 顺序。 */
export function loadRecentChatCustomEmojiIDs(
  storage: ChatSystemEmojiStorage | null = resolveCustomEmojiStorage(),
): readonly string[] {
  if (!storage) return [];
  try {
    // raw 只包含非敏感稳定 ID，不复制远端 URL 数据。
    const raw = storage.getItem(CHAT_CUSTOM_EMOJI_RECENT_KEY);
    return normalizeCustomEmojiIDs(parseCustomEmojiJSON(raw));
  } catch {
    return [];
  }
}

/** 将成功发送的自定义表情 ID 移到 MRU 首位。 */
export function recordRecentChatCustomEmojiID(
  emojiID: string,
  storage: ChatSystemEmojiStorage | null = resolveCustomEmojiStorage(),
): readonly string[] {
  // normalizedID 排除空身份，避免污染跨端主列表索引。
  const normalizedID = emojiID.trim();
  if (!normalizedID || !storage) return loadRecentChatCustomEmojiIDs(storage);
  // current 是写入前已规范化的 MRU 顺序。
  const current = loadRecentChatCustomEmojiIDs(storage);
  // next 将当前身份置顶并移除旧位置。
  const next = normalizeCustomEmojiIDs([
    normalizedID,
    ...current.filter(item => item !== normalizedID),
  ]);
  try {
    storage.setItem(CHAT_CUSTOM_EMOJI_RECENT_KEY, JSON.stringify(next));
    return next;
  } catch {
    return current;
  }
}

/** 规范化未知列表，保序去重并限制服务端容量。 */
function normalizeCustomEmojiIDs(input: unknown): readonly string[] {
  if (!Array.isArray(input)) return [];
  // seen 防止同一稳定 ID 重复占据常用区。
  const seen = new Set<string>();
  // normalized 保存可解析身份的 MRU 顺序。
  const normalized: string[] = [];
  for (const item of input) {
    // emojiID 只接受非空字符串。
    const emojiID = typeof item === 'string' ? item.trim() : '';
    if (!emojiID || seen.has(emojiID)) continue;
    seen.add(emojiID);
    normalized.push(emojiID);
  }
  return normalized.slice(0, CHAT_CUSTOM_EMOJI_RECENT_LIMIT);
}

/** 损坏 preference 按空列表处理。 */
function parseCustomEmojiJSON(raw: string | null): unknown {
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** 安全取得 localStorage，隐私策略拒绝时返回 null。 */
function resolveCustomEmojiStorage(): ChatSystemEmojiStorage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}
