import type { FormEvent } from 'react';
import {
  createIMComposerSubmissionPlan,
  trimPresetEmojiDocument,
  type IMComposerSubmissionPlan,
  type PresetEmojiDocument,
} from '@im28/im-sdk/web';

import type { useChatComposerAttachments } from './useChatComposerAttachments.js';
import type { useChatComposerMentions } from './useChatComposerMentions.js';
import type {
  ChatComposerProps,
  ChatForwardSelection,
} from './chat-composer-types.js';

/** Composer 提交 owner 只接收已建立的草稿、附件与页面 actions。 */
interface UseChatComposerSubmissionOptions {
  readonly composer: ChatComposerProps;
  readonly draftDocument: PresetEmojiDocument;
  readonly forwardSelection: ChatForwardSelection | null;
  readonly voiceMode: boolean;
  readonly attachments: ReturnType<typeof useChatComposerAttachments>;
  readonly mentions: ReturnType<typeof useChatComposerMentions>;
  readonly updateDraftDocument: (document: PresetEmojiDocument) => void;
  readonly resetEditingDraft: () => void;
  readonly closePanel: () => void;
}

/** Composer 视图只消费发送可用性和唯一表单提交入口。 */
interface ChatComposerSubmission {
  readonly canSend: boolean;
  readonly submit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

/** 按 RN 顺序编排转发、编辑、组合媒体、引用、提及和普通文本提交。 */
export function useChatComposerSubmission(
  options: UseChatComposerSubmissionOptions,
): ChatComposerSubmission {
  /** canSend 同时约束键盘提交和可见发送按钮。 */
  const canSend = Boolean(options.composer.forwardDraft
    ? options.forwardSelection?.sourceClientMsgIDs.length &&
      !options.composer.forwardDraft.pending.loading
    : options.draftDocument.text.trim() ||
      options.attachments.pendingMedia ||
      options.attachments.pendingFile
  ) && !options.composer.sending && !options.voiceMode;

  /** 提交前固定当前输入快照，仅在对应 shared action 成功后清理草稿。 */
  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!canSend) return;
    /** document 同步裁剪正文和实体偏移，避免异步期间读取后续输入。 */
    const document = trimPresetEmojiDocument(options.draftDocument);
    if (options.composer.forwardDraft) {
      await submitForwardDraft(options, document);
      return;
    }
    await submitRegularDraft(options, document);
  }

  return { canSend, submit };
}

/** 转发草稿只在选择有效且 shared action 成功后清空留言。 */
async function submitForwardDraft(
  options: UseChatComposerSubmissionOptions,
  document: PresetEmojiDocument,
): Promise<void> {
  if (!options.composer.forwardDraft || !options.forwardSelection) return;
  /** completed 只在 shared 转发确认完成后清空复用输入框。 */
  const completed = await options.composer.forwardDraft.onSubmit({
    ...options.forwardSelection,
    comment: document.text,
  });
  if (completed && document.text) {
    options.updateDraftDocument({ text: '', entities: [] });
    options.mentions.clear();
  }
}

/** 普通草稿先冻结附件并执行 shared 互斥计划，再分派唯一发送分支。 */
async function submitRegularDraft(
  options: UseChatComposerSubmissionOptions,
  document: PresetEmojiDocument,
): Promise<void> {
  /** selectedEdit 固定提交瞬间的原消息，失败时保留当前草稿。 */
  const selectedEdit = options.composer.editingMessage;
  /** pendingMedia 固定本次已暂存媒体，清空时机保持不变。 */
  const pendingMedia = options.attachments.pendingMedia;
  /** pendingFile 固定本次已暂存文件，清空时机保持不变。 */
  const pendingFile = options.attachments.pendingFile;
  /** plan 先执行跨端互斥校验，再允许编辑或组合发送继续。 */
  let plan: IMComposerSubmissionPlan;
  try {
    plan = createIMComposerSubmissionPlan({
      text: document.text,
      hasPendingMedia: Boolean(pendingMedia),
      hasPendingFile: Boolean(pendingFile),
      editing: Boolean(selectedEdit),
    });
  } catch (cause) {
    options.composer.onError(
      cause instanceof Error ? cause.message : '消息暂不可发送',
    );
    return;
  }
  if (selectedEdit) {
    /** completed 保护编辑失败时的草稿和原消息。 */
    const completed = await options.composer.onEditText(selectedEdit, document);
    if (completed) options.resetEditingDraft();
    return;
  }
  if (pendingMedia || pendingFile) {
    await submitAttachmentDraft(
      options,
      plan,
      document,
      pendingMedia,
      pendingFile,
    );
    return;
  }
  await submitTextDraft(options, document);
}

/** 组合附件保持先清待发送状态、再调用页面唯一发送 action 的原顺序。 */
async function submitAttachmentDraft(
  options: UseChatComposerSubmissionOptions,
  plan: IMComposerSubmissionPlan,
  document: PresetEmojiDocument,
  pendingMedia: ReturnType<typeof useChatComposerAttachments>['pendingMedia'],
  pendingFile: File | null,
): Promise<void> {
  /** selectedQuote 固定组合发送提交瞬间的引用来源。 */
  const selectedQuote = options.composer.quoteMessage;
  /** visibleMentions 只包含当前正文仍可见的稳定用户身份。 */
  const visibleMentions = options.mentions.collect(document.text);
  options.attachments.clearPendingMedia();
  options.attachments.clearPendingFile();
  options.closePanel();
  /** completed 只在组合发送全部步骤成功后清空文本草稿。 */
  const completed = await options.composer.onSendSubmission(
    plan,
    document,
    visibleMentions,
    selectedQuote,
    pendingMedia,
    pendingFile,
  );
  if (completed && document.text) {
    options.updateDraftDocument({ text: '', entities: [] });
    options.mentions.clear();
    if (selectedQuote) options.composer.onCancelQuote();
  }
}

/** 无附件草稿按引用、提及、普通文本的 RN 优先级提交。 */
async function submitTextDraft(
  options: UseChatComposerSubmissionOptions,
  document: PresetEmojiDocument,
): Promise<void> {
  /** selectedQuote 固定纯文本提交瞬间的引用来源。 */
  const selectedQuote = options.composer.quoteMessage;
  options.closePanel();
  if (selectedQuote) {
    /** completed 保护失败发送时的草稿和引用来源。 */
    const completed = await options.composer.onSendQuote(
      selectedQuote,
      document.text,
    );
    if (completed) {
      options.updateDraftDocument({ text: '', entities: [] });
      options.composer.onCancelQuote();
    }
    return;
  }
  /** visibleMentions 只包含仍存在于提交正文中的用户选择。 */
  const visibleMentions = options.mentions.collect(document.text);
  if (visibleMentions.length) {
    /** completed 保护失败提及发送时的文本与 mention identity。 */
    const completed = await options.composer.onSendMention(
      document,
      visibleMentions,
    );
    if (completed) {
      options.updateDraftDocument({ text: '', entities: [] });
      options.mentions.clear();
    }
    return;
  }
  /** completed 只在 shared message 状态机确认成功后清空草稿。 */
  const completed = await options.composer.onSendText(document);
  if (completed) options.updateDraftDocument({ text: '', entities: [] });
}
