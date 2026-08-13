/** 单聊陌生人关系提示的页面输入。 */
interface ChatRelationshipNoticeProps {
  readonly text: string;
  readonly actionLabel: string;
  readonly onAction: () => void;
}

/** 按 RN 底部消息提示布局呈现好友验证动作。 */
export function ChatRelationshipNotice({
  text,
  actionLabel,
  onAction,
}: ChatRelationshipNoticeProps) {
  if (!text) return null;
  return (
    <div className="rn-chat-bottom-notice" role="status">
      <span>{text}</span>
      {actionLabel ? (
        <button type="button" aria-label={actionLabel} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
