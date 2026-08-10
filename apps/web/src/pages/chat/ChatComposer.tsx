import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react';

import albumIconURL from '../../assets/rn/assets/icons/chat/album.svg';
import fileIconURL from '../../assets/rn/assets/icons/chat/file.svg';
import emojiIconURL from '../../assets/rn/assets/icons/imm28/emoji.regular.svg';
import keyboardIconURL from '../../assets/rn/assets/icons/imm28/keyboard.svg';
import plusIconURL from '../../assets/rn/assets/icons/imm28/plus-circle.regular.svg';
import sendIconURL from '../../assets/rn/assets/icons/imm28/send.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { ChatSystemEmojiPanel } from './ChatSystemEmojiPanel.js';
import { ChatVoiceInput } from './ChatVoiceInput.js';
import {
  CHAT_ALBUM_ACCEPT,
  type ChatAlbumSelectionItem,
  validateChatFile,
  validateChatAlbumSelection,
} from './chat-attachment-selection.js';
import type { ChatVoiceRecordingStatus } from './useChatVoiceRecorder.js';
import { useChatComposerDraftEditing } from './useChatComposerDraftEditing.js';

/** Composer 的两个内嵌面板互斥且不承载发送状态。 */
type ChatComposerPanel = 'actions' | 'emoji' | null;

/** RN composer 暴露文本和已验证浏览器附件选择结果。 */
interface ChatComposerProps {
  readonly sending: boolean;
  readonly voiceRecordingStatus: ChatVoiceRecordingStatus;
  readonly voiceRecordingSeconds: number;
  readonly onSendText: (text: string) => Promise<void>;
  readonly onSendAlbum: (
    items: readonly ChatAlbumSelectionItem[],
  ) => Promise<void>;
  readonly onSendFile: (file: File) => Promise<void>;
  readonly onVoiceRecordStart: () => void | Promise<void>;
  readonly onVoiceRecordSend: () => void | Promise<void>;
  readonly onVoiceRecordCancel: () => void | Promise<void>;
  readonly onError: (message: string) => void;
}

/** 呈现 RN input pill、发送按钮和真实附件功能面板。 */
export function ChatComposer({
  sending,
  voiceRecordingStatus,
  voiceRecordingSeconds,
  onSendText,
  onSendAlbum,
  onSendFile,
  onVoiceRecordStart,
  onVoiceRecordSend,
  onVoiceRecordCancel,
  onError,
}: ChatComposerProps) {
  // draft 仅属于当前页面生命周期，不写入 token/session storage。
  const [draft, setDraft] = useState('');
  // activePanel 保证功能面板和表情面板互斥。
  const [activePanel, setActivePanel] = useState<ChatComposerPanel>(null);
  // voiceMode 在文本和 RN 按住说话输入之间切换。
  const [voiceMode, setVoiceMode] = useState(false);
  // imageInputRef 触发浏览器多图选择器。
  const albumInputRef = useRef<HTMLInputElement>(null);
  // fileInputRef 触发浏览器单文件选择器。
  const fileInputRef = useRef<HTMLInputElement>(null);
  // draftEditing 持有 textarea selection 的唯一编辑入口。
  const draftEditing = useChatComposerDraftEditing({
    draft,
    onChangeDraft: setDraft,
  });
  // canSend 统一控制键盘提交与可见发送按钮。
  const canSend = Boolean(draft.trim()) && !sending && !voiceMode;

  /** 提交前固定当前文本并清空 RN composer 草稿。 */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) return;
    // text 保留本轮提交值，防止异步期间受后续输入影响。
    const text = draft.trim();
    setDraft('');
    setActivePanel(null);
    await onSendText(text);
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

  /** 校验浏览器相册结果后按原顺序交给页面 facade caller。 */
  async function handleAlbumSelection(event: ChangeEvent<HTMLInputElement>) {
    // files 立即复制，随后清空 input 允许重复选择同一文件。
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = '';
    setActivePanel(null);
    if (!files.length) return;
    try {
      await onSendAlbum(validateChatAlbumSelection(files));
    } catch (cause) {
      onError(readSelectionError(cause));
    }
  }

  /** 校验普通文件后交给唯一 SDK sendFile caller。 */
  async function handleFileSelection(event: ChangeEvent<HTMLInputElement>) {
    // file 固定本轮第一个选择结果。
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    setActivePanel(null);
    if (!file) return;
    try {
      await onSendFile(validateChatFile(file));
    } catch (cause) {
      onError(readSelectionError(cause));
    }
  }

  return (
    <section
      className={`rn-chat-composer-shell${activePanel ? ' is-panel-open' : ''}`}
    >
      <form className="rn-chat-composer" onSubmit={handleSubmit}>
        <ChatVoiceInput
          voiceMode={voiceMode}
          disabled={sending}
          status={voiceRecordingStatus}
          seconds={voiceRecordingSeconds}
          onToggleMode={() => {
            setActivePanel(null);
            setVoiceMode(current => !current);
          }}
          onStart={onVoiceRecordStart}
          onSend={onVoiceRecordSend}
          onCancel={onVoiceRecordCancel}
        >
          <label className="rn-chat-composer-pill">
            <span className="sr-only">消息内容</span>
            <textarea
              ref={draftEditing.textareaRef}
              rows={1}
              maxLength={1000}
              value={draft}
              placeholder="发消息..."
              disabled={sending}
              onChange={event => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setActivePanel(null)}
            />
          </label>
        </ChatVoiceInput>
        <button
          className="rn-chat-composer-icon-button"
          type="button"
          disabled={sending}
          aria-label={
            activePanel === 'emoji' ? '切换到键盘输入' : '打开表情面板'
          }
          aria-expanded={activePanel === 'emoji'}
          title={activePanel === 'emoji' ? '键盘' : '表情'}
          onClick={() => {
            setVoiceMode(false);
            setActivePanel(current => (current === 'emoji' ? null : 'emoji'));
          }}
        >
          <RNAssetIcon
            assetURL={activePanel === 'emoji' ? keyboardIconURL : emojiIconURL}
          />
        </button>
        {!voiceMode && draft.trim() ? (
          <button
            className="rn-chat-send-button"
            type="submit"
            disabled={!canSend}
            aria-label="发送消息"
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
            onClick={() =>
              setActivePanel(current => (current === 'actions' ? null : 'actions'))
            }
          >
            <RNAssetIcon assetURL={plusIconURL} />
          </button>
        )}
      </form>
      {activePanel === 'emoji' ? (
        <ChatSystemEmojiPanel
          onInsert={draftEditing.insertTextAtSelection}
          onDeleteBackward={draftEditing.deleteBackward}
        />
      ) : null}
      {activePanel === 'actions' ? (
        <div className="rn-chat-action-panel" aria-label="聊天功能面板">
          <AttachmentAction
            label="相册"
            assetURL={albumIconURL}
            onClick={() => albumInputRef.current?.click()}
          />
          <AttachmentAction
            label="文件"
            assetURL={fileIconURL}
            onClick={() => fileInputRef.current?.click()}
          />
        </div>
      ) : null}
      <input
        ref={albumInputRef}
        hidden
        type="file"
        multiple
        accept={CHAT_ALBUM_ACCEPT}
        disabled={sending}
        onChange={event => void handleAlbumSelection(event)}
      />
      <input
        ref={fileInputRef}
        hidden
        type="file"
        disabled={sending}
        onChange={event => void handleFileSelection(event)}
      />
    </section>
  );
}

/** 复用 RN 72px icon box 呈现一个已接通的附件 action。 */
function AttachmentAction({
  label,
  assetURL,
  onClick,
}: {
  readonly label: string;
  readonly assetURL: string;
  readonly onClick: () => void;
}) {
  return (
    <button
      className="rn-chat-action-item"
      type="button"
      aria-label={label}
      onClick={onClick}
    >
      <span className="rn-chat-action-icon-box">
        <RNAssetIcon assetURL={assetURL} />
      </span>
      <span>{label}</span>
    </button>
  );
}

/** 将选择器异常转换为不包含本地路径的用户文案。 */
function readSelectionError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '附件选择失败';
}
