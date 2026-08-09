import { useState, type FormEvent, type KeyboardEvent } from 'react';

import sendIconURL from '../../assets/rn/assets/icons/imm28/send.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';

/** RN 文本 composer 仅暴露 Web facade 已实现的 sendText 能力。 */
interface ChatComposerProps {
  readonly sending: boolean;
  readonly onSend: (text: string) => Promise<void>;
}

/** 呈现 RN input pill、千字上限和按草稿出现的发送按钮。 */
export function ChatComposer({ sending, onSend }: ChatComposerProps) {
  // draft 仅属于当前页面生命周期，不写入 token/session storage。
  const [draft, setDraft] = useState('');
  // canSend 统一控制键盘提交与可见发送按钮。
  const canSend = Boolean(draft.trim()) && !sending;

  /** 提交前固定当前文本并清空 RN composer 草稿。 */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) return;
    // text 保留本轮提交值，防止异步期间受后续输入影响。
    const text = draft.trim();
    setDraft('');
    await onSend(text);
  }

  /** Enter 发送、Shift+Enter 换行，并尊重中文输入法合成态。 */
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key !== 'Enter' ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <form className="rn-chat-composer" onSubmit={handleSubmit}>
      <label className="rn-chat-composer-pill">
        <span className="sr-only">消息内容</span>
        <textarea
          rows={1}
          maxLength={1000}
          value={draft}
          placeholder="发消息..."
          disabled={sending}
          onChange={event => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </label>
      {draft.trim() ? (
        <button
          className="rn-chat-send-button"
          type="submit"
          disabled={!canSend}
          aria-label="发送消息"
        >
          <RNAssetIcon assetURL={sendIconURL} />
        </button>
      ) : null}
    </form>
  );
}
