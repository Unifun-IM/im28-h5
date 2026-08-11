import type { Message, WebIMSync } from '@im28/im-sdk/web';

/** 搜索结果定位只依赖消息 facade 的两个本地读取方法。 */
type ChatMessageFocusSync = Pick<
  WebIMSync['messages'],
  'getCachedByClientMsgIDs' | 'getCachedHistory'
>;

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
  target.animate(
    [
      { backgroundColor: 'transparent' },
      { backgroundColor: 'var(--im-bg-pressed)' },
      { backgroundColor: 'transparent' },
    ],
    { duration: 900 },
  );
  return true;
}
