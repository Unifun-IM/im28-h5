import type { Message } from '@im28/im-sdk/web';

import editIconURL from '../../assets/rn/assets/icons/imm28/edit.dynamic.svg';
import closeIconURL from '../../assets/rn/assets/icons/imm28/xmark.dynamic.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { getChatMessageEditDocument } from './chat-message-edit-view.js';
import { PresetEmojiTextContent } from './PresetEmojiTextContent.js';
import './chat-message-edit.css';

/** 编辑预览只接收缓存消息和取消动作。 */
interface ChatComposerEditPreviewProps {
  readonly message: Message;
  readonly onCancel: () => void;
}

/** 复刻 RN 编辑标识、单行原文和取消入口。 */
export function ChatComposerEditPreview({
  message,
  onCancel,
}: ChatComposerEditPreviewProps) {
  // document 使用气泡同源投影，避免第二套正文解析。
  const document = getChatMessageEditDocument(message);
  return (
    <section className="rn-chat-composer-edit" aria-label="编辑消息">
      <RNAssetIcon assetURL={editIconURL} />
      <span className="rn-chat-composer-edit-copy">
        <strong>编辑消息</strong>
        <small aria-label="编辑消息原文">
          <PresetEmojiTextContent text={document.text} entities={document.entities} />
        </small>
      </span>
      <button type="button" aria-label="取消编辑消息" onClick={onCancel}>
        <RNAssetIcon assetURL={closeIconURL} />
      </button>
    </section>
  );
}
