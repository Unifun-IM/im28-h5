import type {
  FormEventHandler,
  KeyboardEventHandler,
  PointerEvent,
  RefObject,
} from 'react';
import type { PresetEmojiDocument } from '@im28/im-sdk/web';

import emojiIconURL from '../../assets/rn/assets/icons/imm28/emoji.regular.svg';
import keyboardIconURL from '../../assets/rn/assets/icons/imm28/keyboard.svg';
import plusIconURL from '../../assets/rn/assets/icons/imm28/plus-circle.regular.svg';
import sendIconURL from '../../assets/rn/assets/icons/imm28/send.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { PresetEmojiTextContent } from './PresetEmojiTextContent.js';
import { ChatVoiceInput } from './ChatVoiceInput.js';
import type { ChatComposerPanel } from './chat-composer-types.js';
import type { ChatVoiceRecordingStatus } from './useChatVoiceRecorder.js';

/** 输入行只接收 Composer 已计算的展示状态和事件。 */
interface ChatComposerInputRowProps {
  readonly draftDocument: PresetEmojiDocument;
  readonly textareaRef: RefObject<HTMLTextAreaElement | null>;
  readonly sending: boolean;
  readonly canSend: boolean;
  readonly showSendButton: boolean;
  readonly forwarding: boolean;
  readonly voiceMode: boolean;
  readonly voiceRecordingStatus: ChatVoiceRecordingStatus;
  readonly voiceRecordingSeconds: number;
  readonly voiceRecordingLevel: number;
  readonly activePanel: ChatComposerPanel;
  readonly onSubmit: FormEventHandler<HTMLFormElement>;
  readonly onKeyDown: KeyboardEventHandler<HTMLTextAreaElement>;
  readonly onChangeText: (text: string) => void;
  readonly onFocusText: () => void;
  readonly onToggleVoiceMode: () => void;
  readonly onToggleEmojiPanel: () => void;
  readonly onToggleActionsPanel: () => void;
  readonly onVoiceRecordStart: () => void;
  readonly onVoiceRecordSend: () => void;
  readonly onVoiceRecordCancel: () => void;
}

/** 阻止发送按钮在 pointerdown 阶段夺走 textarea 焦点。 */
function preventComposerSubmitBlur(event: PointerEvent<HTMLButtonElement>): void {
  event.preventDefault();
}

/** 呈现 RN 语音切换、输入 pill、表情和发送/功能按钮。 */
export function ChatComposerInputRow({
  draftDocument,
  textareaRef,
  sending,
  canSend,
  showSendButton,
  forwarding,
  voiceMode,
  voiceRecordingStatus,
  voiceRecordingSeconds,
  voiceRecordingLevel,
  activePanel,
  onSubmit,
  onKeyDown,
  onChangeText,
  onFocusText,
  onToggleVoiceMode,
  onToggleEmojiPanel,
  onToggleActionsPanel,
  onVoiceRecordStart,
  onVoiceRecordSend,
  onVoiceRecordCancel,
}: ChatComposerInputRowProps) {
  return (
    <form className="rn-chat-composer" onSubmit={onSubmit}>
      <ChatVoiceInput
        voiceMode={voiceMode}
        disabled={sending}
        status={voiceRecordingStatus}
        seconds={voiceRecordingSeconds}
        level={voiceRecordingLevel}
        onToggleMode={onToggleVoiceMode}
        onStart={onVoiceRecordStart}
        onSend={onVoiceRecordSend}
        onCancel={onVoiceRecordCancel}
      >
        <label className="rn-chat-composer-pill">
          <span className="sr-only">消息内容</span>
          {draftDocument.entities.length ? (
            <span className="rn-chat-composer-rich-preview" aria-hidden="true">
              <PresetEmojiTextContent
                text={draftDocument.text}
                entities={draftDocument.entities}
              />
            </span>
          ) : null}
          <textarea
            ref={textareaRef}
            rows={1}
            maxLength={1000}
            value={draftDocument.text}
            placeholder="发消息..."
            readOnly={sending}
            className={draftDocument.entities.length ? 'has-rich-preview' : undefined}
            onChange={event => onChangeText(event.target.value)}
            onKeyDown={onKeyDown}
            onFocus={onFocusText}
          />
        </label>
      </ChatVoiceInput>
      <button
        className="rn-chat-composer-icon-button"
        type="button"
        disabled={sending}
        aria-label={activePanel === 'emoji' ? '切换到键盘输入' : '打开表情面板'}
        aria-expanded={activePanel === 'emoji'}
        title={activePanel === 'emoji' ? '键盘' : '表情'}
        onClick={onToggleEmojiPanel}
      >
        <RNAssetIcon assetURL={activePanel === 'emoji' ? keyboardIconURL : emojiIconURL} />
      </button>
      {!voiceMode && showSendButton ? (
        <button
          className="rn-chat-send-button"
          type="submit"
          disabled={!canSend}
          aria-label={forwarding ? '发送转发消息' : '发送消息'}
          onPointerDown={preventComposerSubmitBlur}
        >
          <RNAssetIcon assetURL={sendIconURL} />
        </button>
      ) : (
        <button
          className="rn-chat-composer-icon-button"
          type="button"
          disabled={sending}
          aria-label="打开功能面板"
          aria-expanded={activePanel === 'actions'}
          onClick={onToggleActionsPanel}
        >
          <RNAssetIcon assetURL={plusIconURL} />
        </button>
      )}
    </form>
  );
}
