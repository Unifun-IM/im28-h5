import type { ChatSystemEmojiStorage } from './chat-system-emoji-recent.js';

/** 与 RN 插画表情 preference 保持相同的独立缓存键。 */
const CHAT_ILLUSTRATED_EMOJI_RECENT_KEY =
  'im28.chat.systemEmoji.illustrated.recent';
/** RN 插画表情最近使用区域最多保留 21 项。 */
const CHAT_ILLUSTRATED_EMOJI_RECENT_LIMIT = 21;

/** 读取浏览器中的 presetID 最近使用顺序。 */
export function loadRecentChatIllustratedEmojiIDs(
  storage: ChatSystemEmojiStorage | null = resolveIllustratedEmojiStorage(),
): readonly string[] {
  if (!storage) return [];
  try {
    /** raw 是浏览器 preference 中的兼容 JSON。 */
    const raw = storage.getItem(CHAT_ILLUSTRATED_EMOJI_RECENT_KEY);
    return normalizeIllustratedEmojiIDs(parseIllustratedEmojiJSON(raw));
  } catch {
    return [];
  }
}

/** 将刚使用的 presetID 移到 MRU 首位并持久化。 */
export function recordRecentChatIllustratedEmojiID(
  presetID: string,
  storage: ChatSystemEmojiStorage | null = resolveIllustratedEmojiStorage(),
): readonly string[] {
  /** normalizedID 排除空身份，避免污染跨端资源索引。 */
  const normalizedID = presetID.trim();
  if (!normalizedID || !storage) {
    return loadRecentChatIllustratedEmojiIDs(storage);
  }
  /** current 是写入前的规范化 MRU 顺序。 */
  const current = loadRecentChatIllustratedEmojiIDs(storage);
  /** next 将当前身份置顶并移除旧位置。 */
  const next = normalizeIllustratedEmojiIDs([
    normalizedID,
    ...current.filter(item => item !== normalizedID),
  ]);
  try {
    storage.setItem(CHAT_ILLUSTRATED_EMOJI_RECENT_KEY, JSON.stringify(next));
    return next;
  } catch {
    return current;
  }
}

/** 规范化未知列表，保序去重并限制容量。 */
function normalizeIllustratedEmojiIDs(input: unknown): readonly string[] {
  if (!Array.isArray(input)) return [];
  /** seen 防止同一 presetID 重复占据常用区。 */
  const seen = new Set<string>();
  /** normalized 保存可解析身份的 MRU 顺序。 */
  const normalized: string[] = [];
  for (const item of input) {
    /** presetID 只接受非空字符串。 */
    const presetID = typeof item === 'string' ? item.trim() : '';
    if (!presetID || seen.has(presetID)) continue;
    seen.add(presetID);
    normalized.push(presetID);
  }
  return normalized.slice(0, CHAT_ILLUSTRATED_EMOJI_RECENT_LIMIT);
}

/** 损坏 preference 按空列表处理。 */
function parseIllustratedEmojiJSON(raw: string | null): unknown {
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** 安全取得 localStorage，隐私策略拒绝时返回 null。 */
function resolveIllustratedEmojiStorage(): ChatSystemEmojiStorage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}
