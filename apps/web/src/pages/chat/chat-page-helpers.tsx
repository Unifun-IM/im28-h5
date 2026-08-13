import type { Message, WebIMSync } from '@im28/im-sdk/web';

import { readFocusedChatMessageWindow } from './chat-message-focus.js';

/** 首次聊天历史刷新只依赖 SDK 消息 facade 的两个读取操作。 */
type ChatHistorySync = Pick<WebIMSync['messages'], 'getCachedHistory' | 'pullHistoryPage'>;

/** 聊天页首次消息窗口同时支持普通历史和搜索目标定位。 */
type ChatPageMessageWindowSync = Pick<
  WebIMSync['messages'],
  'getCachedByClientMsgIDs' | 'getCachedHistory' | 'pullHistoryPage'
>;

/** 聊天首屏窗口同时返回消息和服务端确认的上一页事实。 */
export interface ChatInitialMessageWindow {
  readonly messages: readonly Message[];
  readonly hasMore: boolean;
  readonly nextCursor?: string;
}

/** 拉取远端增量后重读 SQLite，避免旧远端窗口覆盖并发发送或实时写入。 */
export async function pullAndReadChatHistory(
  sync: ChatHistorySync,
  options: { readonly conversationID: string; readonly fromSeq: string; readonly limit: number },
): Promise<ChatInitialMessageWindow> {
  /** page 保留 Gateway has_more 与 next_seq，页面不得根据条数猜测。 */
  const page = await sync.pullHistoryPage(options);
  /** messages 在持久化完成后重读，包含并发 sending/realtime 快照。 */
  const messages = await sync.getCachedHistory({
    conversationID: options.conversationID,
    limit: options.limit,
  });
  return {
    messages,
    hasMore: page.hasMore,
    ...(page.nextSeq ? { nextCursor: page.nextSeq } : {}),
  };
}

/** 读取普通最新历史或搜索结果所在窗口，并允许页面先呈现本地 cache。 */
export async function readInitialChatMessageWindow(
  sync: ChatPageMessageWindowSync,
  options: {
    readonly conversationID: string;
    readonly fromSeq: string;
    readonly focusedMessageID: string;
    readonly limit: number;
  },
  onCached: (messages: readonly Message[]) => void,
): Promise<ChatInitialMessageWindow> {
  if (options.focusedMessageID) {
    /** messages 是搜索定位独占的缓存窗口，不自动进入远端历史分页。 */
    const messages = await readFocusedChatMessageWindow(
      sync,
      options.conversationID,
      options.focusedMessageID,
      options.limit,
    );
    return { messages, hasMore: false };
  }
  /** cachedMessages 先让页面呈现当前账号 SQLite 最新窗口。 */
  const cachedMessages = await sync.getCachedHistory({
    conversationID: options.conversationID,
    limit: options.limit,
  });
  onCached(cachedMessages);
  return pullAndReadChatHistory(sync, {
    conversationID: options.conversationID,
    fromSeq: options.fromSeq,
    limit: options.limit,
  });
}

/** 统一承载启动和配置错误的全屏状态。 */
export function ChatPageState({
  label,
  detail,
}: {
  readonly label: string;
  readonly detail?: string | null;
}) {
  return (
    <main className="rn-chat-page-state">
      <strong>{label}</strong>
      {detail ? <span>{detail}</span> : null}
    </main>
  );
}

/** 将消息异常转换为不包含敏感数据的文本。 */
export function readChatPageError(cause: unknown): string {
  return cause instanceof Error && cause.message
    ? cause.message
    : '消息操作失败';
}

/** 将 SDK sending entity 按 newest-first 规则合并到当前可见列表。 */
export function upsertVisibleMessage(
  messages: readonly Message[],
  nextMessage: Message,
): readonly Message[] {
  // remaining 移除可能已由 realtime/cache 刷新的同 ID 旧状态。
  const remaining = messages.filter(
    message => message.clientMsgID !== nextMessage.clientMsgID,
  );
  return [nextMessage, ...remaining].sort(
    (left, right) => right.sendTime - left.sendTime,
  );
}
