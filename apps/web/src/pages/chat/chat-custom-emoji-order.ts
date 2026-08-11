import type { CustomEmoji } from '@im28/im-sdk/web';

import type { ChatSystemEmojiStorage } from './chat-system-emoji-recent.js';

/** 本地排序使用独立 stable-ID key，避免覆盖 RN 旧版完整对象缓存。 */
const CHAT_CUSTOM_EMOJI_ORDER_KEY = 'im28.chat.customEmoji.order';

/** 读取浏览器自定义表情本地顺序。 */
export function loadChatCustomEmojiOrder(
  storage: ChatSystemEmojiStorage | null = resolveCustomEmojiOrderStorage(),
): readonly string[] {
  if (!storage) return [];
  try {
    // raw 只包含稳定 ID，不复制 URL 或服务端成员关系。
    const raw = storage.getItem(CHAT_CUSTOM_EMOJI_ORDER_KEY);
    return normalizeCustomEmojiOrder(parseCustomEmojiOrderJSON(raw));
  } catch {
    return [];
  }
}

/** 持久化当前完整列表顺序，写入失败时保持页面内排序。 */
export function saveChatCustomEmojiOrder(
  emojiIDs: readonly string[],
  storage: ChatSystemEmojiStorage | null = resolveCustomEmojiOrderStorage(),
): readonly string[] {
  // normalized 负责去空、去重并维持首次出现顺序。
  const normalized = normalizeCustomEmojiOrder(emojiIDs);
  if (!storage) return normalized;
  try {
    storage.setItem(CHAT_CUSTOM_EMOJI_ORDER_KEY, JSON.stringify(normalized));
  } catch {
    return normalized;
  }
  return normalized;
}

/** 按本地 stable-ID preference 排列远端事实列表，并把新成员追加在末尾。 */
export function applyChatCustomEmojiOrder(
  emojis: readonly CustomEmoji[],
  orderIDs: readonly string[] = loadChatCustomEmojiOrder(),
): readonly CustomEmoji[] {
  // emojiByID 只关联当前 SDK 快照，失效 preference 自动被丢弃。
  const emojiByID = new Map(emojis.map(emoji => [emoji.emojiID, emoji]));
  // ordered 先消费仍存在的本地顺序。
  const ordered = normalizeCustomEmojiOrder(orderIDs).flatMap(emojiID => {
    // emoji 缺失表示服务端成员已删除。
    const emoji = emojiByID.get(emojiID);
    if (!emoji) return [];
    emojiByID.delete(emojiID);
    return [emoji];
  });
  return [...ordered, ...emojiByID.values()];
}

/** 按选择顺序把选中组插入未选列表目标索引。 */
export function reorderChatCustomEmojis(
  emojis: readonly CustomEmoji[],
  selectedIDs: readonly string[],
  targetIndex: number,
): readonly CustomEmoji[] {
  // emojiByID 按选择编号恢复完整实体。
  const emojiByID = new Map(emojis.map(emoji => [emoji.emojiID, emoji]));
  // normalizedSelectedIDs 保留绿色编号对应的选择顺序。
  const normalizedSelectedIDs = normalizeCustomEmojiOrder(selectedIDs);
  // selectedSet 用于从原列表剔除整个移动组。
  const selectedSet = new Set(normalizedSelectedIDs);
  // selectedEmojis 忽略已不在当前成员快照中的旧 ID。
  const selectedEmojis = normalizedSelectedIDs.flatMap(emojiID => {
    // emoji 只来自当前 SDK 快照。
    const emoji = emojiByID.get(emojiID);
    return emoji ? [emoji] : [];
  });
  // remainingEmojis 保持未选项的原始相对顺序。
  const remainingEmojis = emojis.filter(emoji => !selectedSet.has(emoji.emojiID));
  // safeTarget 防止指针落在网格外产生非法插入位置。
  const safeTarget = Math.max(0, Math.min(remainingEmojis.length, targetIndex));
  return [
    ...remainingEmojis.slice(0, safeTarget),
    ...selectedEmojis,
    ...remainingEmojis.slice(safeTarget),
  ];
}

/** 把网格内指针位置映射为排除选中组后的插入索引。 */
export function getChatCustomEmojiMoveTarget(
  clientX: number,
  clientY: number,
  gridRect: Readonly<{ left: number; top: number; width: number }>,
  remainingCount: number,
): number {
  // contentLeft 扣除管理网格固定 12px 横向内边距。
  const contentLeft = gridRect.left + 12;
  // contentTop 扣除管理网格固定 14px 顶部内边距。
  const contentTop = gridRect.top + 14;
  // cellSize 与五列 CSS grid 使用同一内容宽度。
  const cellSize = Math.max(1, (gridRect.width - 24) / 5);
  // column 把横坐标限制在五列范围内。
  const column = Math.max(0, Math.min(4, Math.floor((clientX - contentLeft) / cellSize)));
  // row 允许指针落到当前列表末行之后。
  const row = Math.max(0, Math.floor((clientY - contentTop) / cellSize));
  return Math.max(0, Math.min(remainingCount, row * 5 + column));
}

/** 规范化未知 ID 数组。 */
function normalizeCustomEmojiOrder(input: unknown): readonly string[] {
  if (!Array.isArray(input)) return [];
  // seen 防止一个身份占据多个本地位置。
  const seen = new Set<string>();
  return input.flatMap(item => {
    // emojiID 只接受非空字符串。
    const emojiID = typeof item === 'string' ? item.trim() : '';
    if (!emojiID || seen.has(emojiID)) return [];
    seen.add(emojiID);
    return [emojiID];
  });
}

/** 损坏 preference 按空顺序处理。 */
function parseCustomEmojiOrderJSON(raw: string | null): unknown {
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** 安全取得 localStorage，隐私策略拒绝时返回 null。 */
function resolveCustomEmojiOrderStorage(): ChatSystemEmojiStorage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}
