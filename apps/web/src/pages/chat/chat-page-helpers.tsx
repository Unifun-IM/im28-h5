import type { Message, WebIMSync } from '@im28/im-sdk/web';

/** 首次聊天历史刷新只依赖 SDK 消息 facade 的两个读取操作。 */
type ChatHistorySync = Pick<WebIMSync['messages'], 'getCachedHistory' | 'pullHistory'>;

/** 拉取远端增量后重读 SQLite，避免旧远端窗口覆盖并发发送或实时写入。 */
export async function pullAndReadChatHistory(
  sync: ChatHistorySync,
  options: { readonly conversationID: string; readonly fromSeq: string; readonly limit: number },
): Promise<readonly Message[]> {
  await sync.pullHistory(options);
  return sync.getCachedHistory({
    conversationID: options.conversationID,
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
