import type { Message } from '@im28/im-sdk/web';

import closeIconURL from '../../assets/rn/assets/icons/imm28/xmark.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { getChatQuoteComposerView } from './chat-quote-view.js';

/** Composer 引用条只消费当前选中来源和显式取消动作。 */
interface ChatComposerQuotePreviewProps {
  readonly message: Message;
  readonly isGroup: boolean;
  readonly onCancel: () => void;
}

/** 呈现 RN “回复发送者”来源摘要。 */
export function ChatComposerQuotePreview({
  message,
  isGroup,
  onCancel,
}: ChatComposerQuotePreviewProps) {
  // view 始终由来源真实 payload 构造，不读取待发送草稿。
  const view = getChatQuoteComposerView(message, isGroup);
  return (
    <div className="rn-chat-composer-quote" aria-label="引用消息">
      <span>
        <strong>回复 {view.label || '消息'}</strong>
        <small>{view.text}</small>
      </span>
      <button type="button" aria-label="取消引用消息" onClick={onCancel}>
        <RNAssetIcon assetURL={closeIconURL} />
      </button>
    </div>
  );
}
