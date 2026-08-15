import type { WebIMConversationListItem } from '@im28/im-sdk/web';

import { getConversationTitle } from './conversation-list-view.js';
import { getConversationDisplayPreview } from './conversation-preview-view.js';

/** 判断归档通栏是否需要延续 RN 的置顶会话背景。 */
export function shouldUsePinnedArchiveBackground(
  visibleItems: readonly WebIMConversationListItem[],
  archivedItems: readonly WebIMConversationListItem[],
): boolean {
  return [...visibleItems, ...archivedItems].some(
    item => item.conversation.isPinned === true,
  );
}

/** 按稳定会话 ID 合并分页结果，新快照覆盖旧行且保留既有顺序。 */
export function mergeArchivedConversationItems(
  current: readonly WebIMConversationListItem[],
  next: readonly WebIMConversationListItem[],
): readonly WebIMConversationListItem[] {
  /** nextByID 供旧顺序位置替换最新快照。 */
  const nextByID = new Map(next.map(item => [item.conversation.conversationID, item]));
  /** merged 先更新已有行。 */
  const merged = current.map(item => nextByID.get(item.conversation.conversationID) ?? item);
  /** seen 阻止后续分页重复会话。 */
  const seen = new Set(merged.map(item => item.conversation.conversationID));
  return [
    ...merged,
    ...next.filter(item => !seen.has(item.conversation.conversationID)),
  ];
}

/** 使用 RN 相同的标题和摘要字段过滤当前已加载归档缓存。 */
export function filterArchivedConversationItems(
  items: readonly WebIMConversationListItem[],
  query: string,
  currentUserID = '',
): readonly WebIMConversationListItem[] {
  /** normalizedQuery 统一大小写并忽略首尾空白。 */
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return items;
  return items.filter(item => {
    /** title 使用会话列表既有回退逻辑。 */
    const title = getConversationTitle(item.conversation).toLocaleLowerCase();
    /** preview 使用列表相同的草稿、mention 与媒体文案。 */
    const preview = getConversationDisplayPreview(item, currentUserID).text.toLocaleLowerCase();
    return title.includes(normalizedQuery) || preview.includes(normalizedQuery);
  });
}
