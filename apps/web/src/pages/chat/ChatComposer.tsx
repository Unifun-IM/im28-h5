import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import {
  createIMComposerSubmissionPlan,
  resolveIMGroupMemberDisplayName,
  trimPresetEmojiDocument,
  type IMComposerSubmissionPlan,
  type PresetEmojiDocument,
} from '@im28/im-sdk/web';

import emojiIconURL from '../../assets/rn/assets/icons/imm28/emoji.regular.svg';
import keyboardIconURL from '../../assets/rn/assets/icons/imm28/keyboard.svg';
import plusIconURL from '../../assets/rn/assets/icons/imm28/plus-circle.regular.svg';
import sendIconURL from '../../assets/rn/assets/icons/imm28/send.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { ChatComposerAttachmentControls } from './ChatComposerAttachmentControls.js';
import { ChatComposerQuotePreview } from './ChatComposerQuotePreview.js';
import { ChatComposerEditPreview } from './ChatComposerEditPreview.js';
import { ChatComposerPendingFile } from './ChatComposerPendingFile.js';
import { ChatSystemEmojiPanel } from './ChatSystemEmojiPanel.js';
import { PresetEmojiTextContent } from './PresetEmojiTextContent.js';
import { ChatVoiceInput } from './ChatVoiceInput.js';
import { useChatComposerDraftEditing } from './useChatComposerDraftEditing.js';
import { getChatMessageEditDocument } from './chat-message-edit-view.js';
import { useChatComposerAttachments } from './useChatComposerAttachments.js';
import { ChatMentionPickerPanel } from './ChatMentionPickerPanel.js';
import { useChatComposerMentions } from './useChatComposerMentions.js';
import type { ChatComposerProps } from './chat-composer-types.js';

/** Composer 的两个内嵌面板互斥且不承载发送状态。 */
type ChatComposerPanel = 'actions' | 'emoji' | null;

/** 呈现 RN input pill、发送按钮和真实附件功能面板。 */
export function ChatComposer({
  initialDraftDocument,
  onDraftDocumentChange,
  sending,
  voiceRecordingStatus,
  voiceRecordingSeconds,
  onSendText,
  onSendMention,
  mentionMembers,
  canMentionAll,
  currentUserID,
  mentionRequest,
  editingMessage,
  onCancelEdit,
  onEditText,
  quoteMessage,
  isGroup,
  onCancelQuote,
  onSendQuote,
  onSendAlbum,
  onSendSubmission,
  showCallAction,
  onOpenCallPicker,
  onOpenCardPicker,
  loadCachedCustomEmojis,
  syncCustomEmojis,
  onSendCustomEmoji,
  onManageCustomEmojis,
  onVoiceRecordStart,
  onVoiceRecordSend,
  onVoiceRecordCancel,
  onError,
}: ChatComposerProps) {
  // draftDocument 从当前账号 SDK SQLite 恢复，仍由 Composer 持有即时编辑状态。
  const [draftDocument, setDraftDocument] = useState<PresetEmojiDocument>(
    initialDraftDocument,
  );
  // activePanel 保证功能面板和表情面板互斥。
  const [activePanel, setActivePanel] = useState<ChatComposerPanel>(null);
  // voiceMode 在文本和 RN 按住说话输入之间切换。
  const [voiceMode, setVoiceMode] = useState(false);
  // attachments 隔离浏览器 input、校验和选择异常。
  const attachments = useChatComposerAttachments({
    draftText: draftDocument.text,
    onSendAlbum,
    onClosePanel: () => setActivePanel(null),
    onError,
  });
  /** 更新普通草稿并通知页面持久化；消息编辑文档保持瞬时状态。 */
  function updateDraftDocument(document: PresetEmojiDocument): void {
    setDraftDocument(document);
    if (!editingMessage) onDraftDocumentChange(document);
  }
  // draftEditing 持有 textarea selection 的唯一编辑入口。
  const draftEditing = useChatComposerDraftEditing({
    document: draftDocument,
    onChangeDocument: updateDraftDocument,
  });
  // mentions 管理群聊 @ 查询、候选身份与光标恢复。
  const mentions = useChatComposerMentions({
    enabled: isGroup && !editingMessage && !quoteMessage,
    document: draftDocument,
    onChangeDocument: updateDraftDocument,
    textareaRef: draftEditing.textareaRef,
    members: mentionMembers,
    selfID: currentUserID,
    canMentionAll,
  });
  // handledMentionRequestRef 防止 hook 函数重建时重复消费同一头像长按。
  const handledMentionRequestRef = useRef(0);

  useEffect(() => {
    if (!mentionRequest || handledMentionRequestRef.current === mentionRequest.id) return;
    handledMentionRequestRef.current = mentionRequest.id;
    if (!isGroup || editingMessage || quoteMessage) return;
    /** member 只来自当前聊天已同步的群成员快照。 */
    const member = mentionRequest.member;
    /** displayName 复用 SDK 的群成员名称优先级。 */
    const displayName = resolveIMGroupMemberDisplayName(member, member.userID);
    mentions.append({
      key: `user:${member.userID}`,
      label: displayName,
      description: member.userID,
      avatarURL: member.avatarURL,
      mention: {
        key: `user:${member.userID}`,
        type: 'user',
        userID: member.userID,
        nickname: displayName,
      },
    });
    setVoiceMode(false);
    setActivePanel(null);
  }, [editingMessage, isGroup, mentionRequest, mentions.append, quoteMessage]);
  // canSend 统一控制键盘提交与可见发送按钮。
  const canSend = Boolean(
    draftDocument.text.trim() ||
    attachments.pendingMedia ||
    attachments.pendingFile,
  ) && !sending && !voiceMode;

  useEffect(() => {
    if (!editingMessage) return;
    // document 使用气泡同源投影恢复正文和 preset entity。
    const document = getChatMessageEditDocument(editingMessage);
    setDraftDocument(document);
    setVoiceMode(false);
    setActivePanel(null);
  }, [editingMessage]);

  /** 提交前固定当前文本并清空 RN composer 草稿。 */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) return;
    // document 同步裁剪正文和实体偏移，防止异步期间受后续输入影响。
    const document = trimPresetEmojiDocument(draftDocument);
    // selectedEdit 固定提交瞬间的原消息，失败时保留当前草稿。
    const selectedEdit = editingMessage;
    // pendingMedia/pendingFile 固定本次选择，清空行为与 RN 提交时机一致。
    const pendingMedia = attachments.pendingMedia;
    const pendingFile = attachments.pendingFile;
    // plan 先执行跨端互斥校验，再允许编辑或组合发送继续。
    let plan: IMComposerSubmissionPlan;
    try {
      plan = createIMComposerSubmissionPlan({
        text: document.text,
        hasPendingMedia: Boolean(pendingMedia),
        hasPendingFile: Boolean(pendingFile),
        editing: Boolean(selectedEdit),
      });
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : '消息暂不可发送');
      return;
    }
    if (selectedEdit) {
      const completed = await onEditText(selectedEdit, document);
      if (completed) setDraftDocument(initialDraftDocument);
      return;
    }
    if (pendingMedia || pendingFile) {
      // selectedQuote 和 visibleMentions 都必须取提交瞬间快照。
      const selectedQuote = quoteMessage;
      const visibleMentions = mentions.collect(document.text);
      attachments.clearPendingMedia();
      attachments.clearPendingFile();
      setActivePanel(null);
      /** completed 只在组合发送全部步骤成功后清空文本草稿。 */
      const completed = await onSendSubmission(
        plan,
        document,
        visibleMentions,
        selectedQuote,
        pendingMedia,
        pendingFile,
      );
      if (completed && document.text) {
        updateDraftDocument({ text: '', entities: [] });
        mentions.clear();
        if (selectedQuote) onCancelQuote();
      }
      return;
    }
    // selectedQuote 固定提交瞬间的来源，避免异步期间被新动作替换。
    const selectedQuote = quoteMessage;
    setActivePanel(null);
    if (selectedQuote) {
      /** completed 保护失败发送时的草稿和引用来源。 */
      const completed = await onSendQuote(selectedQuote, document.text);
      if (completed) {
        updateDraftDocument({ text: '', entities: [] });
        onCancelQuote();
      }
      return;
    }
    // visibleMentions 只包含仍存在于提交正文中的用户选择。
    const visibleMentions = mentions.collect(document.text);
    if (visibleMentions.length) {
      /** completed 保护失败提及发送时的文本与 mention identity。 */
      const completed = await onSendMention(document, visibleMentions);
      if (completed) {
        updateDraftDocument({ text: '', entities: [] });
        mentions.clear();
      }
      return;
    }
    /** completed 只在 shared message 状态机确认成功后清空草稿。 */
    const completed = await onSendText(document);
    if (completed) updateDraftDocument({ text: '', entities: [] });
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
    <section
      className={`rn-chat-composer-shell${activePanel ? ' is-panel-open' : ''}`}
    >
      {quoteMessage ? (
        <ChatComposerQuotePreview
          message={quoteMessage}
          isGroup={isGroup}
          onCancel={onCancelQuote}
        />
      ) : null}
      {editingMessage ? (
        <ChatComposerEditPreview
          message={editingMessage}
          onCancel={() => {
            setDraftDocument(initialDraftDocument);
            onCancelEdit();
          }}
        />
      ) : null}
      <ChatMentionPickerPanel items={mentions.items} onSelect={mentions.select} />
      {attachments.pendingFile ? (
        <ChatComposerPendingFile
          file={attachments.pendingFile}
          onRemove={attachments.clearPendingFile}
        />
      ) : null}
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
            {draftDocument.entities.length ? (
              <span
                className="rn-chat-composer-rich-preview"
                aria-hidden="true"
              >
                <PresetEmojiTextContent
                  text={draftDocument.text}
                  entities={draftDocument.entities}
                />
              </span>
            ) : null}
            <textarea
              ref={draftEditing.textareaRef}
              rows={1}
              maxLength={1000}
              value={draftDocument.text}
              placeholder="发消息..."
              disabled={sending}
              className={
                draftDocument.entities.length ? 'has-rich-preview' : undefined
              }
              onChange={event => draftEditing.changeText(event.target.value)}
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
        {!voiceMode && (
          editingMessage ||
          draftDocument.text.trim() ||
          attachments.pendingMedia ||
          attachments.pendingFile
        ) ? (
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
          onInsertPresetEmoji={draftEditing.insertPresetEmojiAtSelection}
          onDeleteBackward={draftEditing.deleteBackward}
          disabled={sending}
          loadCachedCustomEmojis={loadCachedCustomEmojis}
          syncCustomEmojis={syncCustomEmojis}
          onSendCustomEmoji={onSendCustomEmoji}
          onManageCustomEmojis={onManageCustomEmojis}
          onError={onError}
        />
      ) : null}
      <ChatComposerAttachmentControls
        visible={activePanel === 'actions'}
        disabled={sending}
        showCallAction={showCallAction}
        attachments={attachments}
        onOpenCallPicker={() => {
          setActivePanel(null);
          onOpenCallPicker();
        }}
        onOpenCardPicker={() => {
          setActivePanel(null);
          onOpenCardPicker();
        }}
      />
    </section>
  );
}
