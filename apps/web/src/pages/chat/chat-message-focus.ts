import type { Message, WebIMSync } from '@im28/im-sdk/web';

/** 搜索结果定位只依赖消息 facade 的两个本地读取方法。 */
type ChatMessageFocusSync = Pick<
  WebIMSync['messages'],
  'getCachedByClientMsgIDs' | 'getCachedHistory'
>;

/** 与 RN 目标消息高亮持续时间保持一致。 */
export const CHAT_MESSAGE_FOCUS_HIGHLIGHT_MS = 1600;

/** 每行只保留一个高亮清理计时器，重复定位时重新计时。 */
const chatMessageFocusTimers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

/** 从当前账号 SQLite 恢复目标消息所在的 newest-first 窗口。 */
export async function readFocusedChatMessageWindow(
  sync: ChatMessageFocusSync,
  conversationID: string,
  clientMsgID: string,
  limit = 50,
): Promise<readonly Message[]> {
  /** targets 只按稳定 client ID 从当前账号缓存读取。 */
  const targets = await sync.getCachedByClientMsgIDs([clientMsgID]);
  /** target 必须仍属于当前路由会话，避免跨会话深链读取。 */
  const target = targets.find(message => message.conversationID === conversationID);
  if (!target) throw new Error('搜索结果已不在当前聊天记录中');
  /** history 从目标时间点恢复，不拉取 Gateway 或覆盖其他缓存窗口。 */
  const history = await sync.getCachedHistory({
    conversationID,
    beforeSendTime: target.sendTime + 1,
    limit,
  });
  if (history.some(message => message.clientMsgID === target.clientMsgID)) return history;
  return [target, ...history].sort((left, right) => right.sendTime - left.sendTime);
}

/** 在唯一消息滚动容器内定位并短暂强调目标行。 */
export function focusChatMessageRow(
  container: HTMLElement | null,
  clientMsgID: string,
): boolean {
  if (!container || !clientMsgID) return false;
  /** rows 只扫描当前消息容器，不推动整个页面视口。 */
  const rows = container.querySelectorAll<HTMLElement>('.rn-chat-message-row');
  /** target 使用 DOM dataset 与稳定 client ID 精确匹配。 */
  const target = Array.from(rows).find(
    row => row.dataset.clientMessageId === clientMsgID,
  );
  if (!target) return false;
  target.scrollIntoView({ block: 'center', behavior: 'smooth' });
  /** previousTimer 防止重复定位被旧计时器提前移除。 */
  const previousTimer = chatMessageFocusTimers.get(target);
  if (previousTimer !== undefined) clearTimeout(previousTimer);
  target.classList.add('is-focus-highlighted');
  /** timer 在 RN 1600ms 窗口结束后移除纯展示状态。 */
  const timer = setTimeout(() => {
    target.classList.remove('is-focus-highlighted');
    chatMessageFocusTimers.delete(target);
  }, CHAT_MESSAGE_FOCUS_HIGHLIGHT_MS);
  chatMessageFocusTimers.set(target, timer);
  return true;
}

/** 构造引用来源的当前会话 SPA 定位地址，不携带消息正文。 */
export function buildChatMessageFocusURL(
  conversationID: string,
  clientMsgID: string,
): string | null {
  /** normalizedConversationID 限制定位继续停留在当前聊天。 */
  const normalizedConversationID = conversationID.trim();
  /** normalizedClientMsgID 只使用 SQLite canonical client identity。 */
  const normalizedClientMsgID = clientMsgID.trim();
  if (!normalizedConversationID || !normalizedClientMsgID) return null;
  return `/conversations/${encodeURIComponent(normalizedConversationID)}` +
    `?messageID=${encodeURIComponent(normalizedClientMsgID)}`;
}
