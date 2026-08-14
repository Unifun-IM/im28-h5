import type { CustomEmoji } from '@im28/im-sdk/web';

import type { ChatSystemEmojiStorage } from './chat-system-emoji-recent.js';

/** 本地排序使用独立 stable-ID key，避免覆盖 RN 旧版完整对象缓存。 */
const CHAT_CUSTOM_EMOJI_ORDER_KEY = 'im28.chat.customEmoji.order';

/** 管理页网格与 RN 保持相同的四周留白。 */
const CHAT_CUSTOM_EMOJI_GRID_PADDING = 16;

/** 管理页网格与 RN 保持相同的横纵间距。 */
const CHAT_CUSTOM_EMOJI_GRID_GAP = 8;

/** 管理页固定采用五列表情布局。 */
const CHAT_CUSTOM_EMOJI_GRID_COLUMN_COUNT = 5;

/** 按网格可用宽度计算五列正方形单元边长。 */
export function getChatCustomEmojiGridCellSize(gridWidth: number): number {
  // gapsWidth 是五列之间四段间距的总宽度。
  const gapsWidth =
    CHAT_CUSTOM_EMOJI_GRID_GAP * (CHAT_CUSTOM_EMOJI_GRID_COLUMN_COUNT - 1);
  return Math.max(
    1,
    (gridWidth - CHAT_CUSTOM_EMOJI_GRID_PADDING * 2 - gapsWidth) /
      CHAT_CUSTOM_EMOJI_GRID_COLUMN_COUNT,
  );
}

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
  // contentLeft 扣除管理网格固定横向内边距。
  const contentLeft = gridRect.left + CHAT_CUSTOM_EMOJI_GRID_PADDING;
  // contentTop 扣除管理网格固定顶部内边距。
  const contentTop = gridRect.top + CHAT_CUSTOM_EMOJI_GRID_PADDING;
  // cellSize 与五列 CSS grid 使用同一正方形边长。
  const cellSize = getChatCustomEmojiGridCellSize(gridRect.width);
  // cellStep 包含单元边长和下一列或下一行间距。
  const cellStep = cellSize + CHAT_CUSTOM_EMOJI_GRID_GAP;
  // column 把横坐标限制在五列范围内。
  const column = Math.max(
    0,
    Math.min(
      CHAT_CUSTOM_EMOJI_GRID_COLUMN_COUNT - 1,
      Math.floor(
        (clientX - contentLeft + CHAT_CUSTOM_EMOJI_GRID_GAP / 2) / cellStep,
      ),
    ),
  );
  // row 允许指针落到当前列表末行之后。
  const row = Math.max(
    0,
    Math.floor(
      (clientY - contentTop + CHAT_CUSTOM_EMOJI_GRID_GAP / 2) / cellStep,
    ),
  );
  return Math.max(
    0,
    Math.min(
      remainingCount,
      row * CHAT_CUSTOM_EMOJI_GRID_COLUMN_COUNT + column,
    ),
  );
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
