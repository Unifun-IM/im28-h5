/** 聊天页错误与真实 mutation 通知保持同一固定区域。 */
export function ChatPageFeedback({
  error,
  notice,
}: {
  readonly error: string | null;
  readonly notice: string | null;
}) {
  return (
    <>
      {error ? <p className="rn-chat-error" role="status">{error}</p> : null}
      {notice ? <p className="rn-chat-notice" role="status">{notice}</p> : null}
    </>
  );
}
