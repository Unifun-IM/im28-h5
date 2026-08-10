/** 最近使用表情只依赖浏览器同步 preference contract。 */
export interface ChatSystemEmojiStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** 与 RN AsyncStorage 保持相同的 preference key。 */
const CHAT_SYSTEM_EMOJI_RECENT_KEY = 'im28.chat.systemEmoji.recent';
/** RN 最近使用区域最多保留 21 项。 */
const CHAT_SYSTEM_EMOJI_RECENT_LIMIT = 21;

/** 读取、去重并限制最近使用表情。 */
export function loadRecentChatSystemEmojis(
  storage: ChatSystemEmojiStorage | null = resolveChatSystemEmojiStorage(),
): readonly string[] {
  if (!storage) return [];
  try {
    // raw 是浏览器 preference 中的兼容 JSON。
    const raw = storage.getItem(CHAT_SYSTEM_EMOJI_RECENT_KEY);
    return normalizeRecentChatSystemEmojis(parseRecentChatSystemEmojiJSON(raw));
  } catch {
    return [];
  }
}

/** 将刚使用的表情移到 MRU 首位并持久化。 */
export function recordRecentChatSystemEmoji(
  emoji: string,
  storage: ChatSystemEmojiStorage | null = resolveChatSystemEmojiStorage(),
): readonly string[] {
  // normalizedEmoji 忽略空白输入，保留可见 Unicode 内容。
  const normalizedEmoji = emoji.trim();
  if (!normalizedEmoji || !storage) return loadRecentChatSystemEmojis(storage);
  // current 是写入前的规范化 MRU 顺序。
  const current = loadRecentChatSystemEmojis(storage);
  // next 将当前项置顶并去除旧位置。
  const next = normalizeRecentChatSystemEmojis([
    normalizedEmoji,
    ...current.filter(item => item !== normalizedEmoji),
  ]);
  try {
    storage.setItem(CHAT_SYSTEM_EMOJI_RECENT_KEY, JSON.stringify(next));
    return next;
  } catch {
    return current;
  }
}

/** 规范化任意 recent 输入，保序去重并限制容量。 */
function normalizeRecentChatSystemEmojis(input: unknown): readonly string[] {
  if (!Array.isArray(input)) return [];
  // seen 防止同一 Unicode 值重复占据常用区。
  const seen = new Set<string>();
  // normalized 保留最近使用顺序。
  const normalized: string[] = [];
  for (const item of input) {
    // emoji 仅接受非空字符串。
    const emoji = typeof item === 'string' ? item.trim() : '';
    if (!emoji || seen.has(emoji)) continue;
    seen.add(emoji);
    normalized.push(emoji);
  }
  return normalized.slice(0, CHAT_SYSTEM_EMOJI_RECENT_LIMIT);
}

/** 解析兼容 JSON，损坏值按空列表处理。 */
function parseRecentChatSystemEmojiJSON(raw: string | null): unknown {
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** 安全取得 localStorage，隐私策略拒绝时返回 null。 */
function resolveChatSystemEmojiStorage(): ChatSystemEmojiStorage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}
