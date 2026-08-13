/** RN 对齐的聊天输入区不可用提示参数。 */
interface ChatUnavailableComposerBarProps {
  readonly text: string;
}

/** 以只读状态栏取代不可发送会话的全部输入控件。 */
export function ChatUnavailableComposerBar({ text }: ChatUnavailableComposerBarProps) {
  return (
    <div
      aria-label={text}
      className="rn-chat-unavailable-composer"
      role="status"
    >
      {text}
    </div>
  );
}
