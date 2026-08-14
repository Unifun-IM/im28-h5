import type {
  CustomEmoji,
  Message,
  MessageMention,
  IMComposerSubmissionPlan,
  PresetEmojiDocument,
  WebIMGroupMember,
} from '@im28/im-sdk/web';

import type { ChatAlbumSelectionItem } from './chat-attachment-selection.js';
import type { ChatVoiceRecordingStatus } from './useChatVoiceRecorder.js';
import type { ChatPendingForward } from './useChatForwardFlow.js';

/** Composer 的两个内嵌面板互斥且不承载发送状态。 */
export type ChatComposerPanel = 'actions' | 'emoji' | null;

/** 聊天页请求 Composer 插入一次稳定群成员提及。 */
export interface ChatComposerMentionRequest {
  readonly id: number;
  readonly member: WebIMGroupMember;
}

/** 转发预览向唯一 Composer 回传当前可发送选项。 */
export interface ChatForwardSelection {
  readonly sourceClientMsgIDs: readonly string[];
  readonly hideSenderName: boolean;
}

/** 待发送转发由普通 Composer 接管留言和显式发送。 */
export interface ChatComposerForwardDraft {
  readonly pending: ChatPendingForward;
  readonly recipientName: string;
  readonly onCancel: () => void;
  readonly onChangeTarget: (
    sourceClientMsgIDs: readonly string[],
    hideSenderName: boolean,
  ) => void;
  readonly onSubmit: (options: ChatForwardSelection & {
    readonly comment: string;
  }) => Promise<boolean>;
}

/** RN composer 对外只暴露页面编排所需的文档、媒体与提及 actions。 */
export interface ChatComposerProps {
  /** 页面从账号内 SQLite 恢复的未发送草稿。 */
  readonly initialDraftDocument: PresetEmojiDocument;
  /** 普通 Composer 草稿变化后交还页面持久化，编辑消息不触发。 */
  readonly onDraftDocumentChange: (document: PresetEmojiDocument) => void;
  /** 转发存在时在同一 Composer 顶部显示摘要并复用当前草稿输入。 */
  readonly forwardDraft: ChatComposerForwardDraft | null;
  readonly sending: boolean;
  readonly voiceRecordingStatus: ChatVoiceRecordingStatus;
  readonly voiceRecordingSeconds: number;
  readonly voiceRecordingLevel: number;
  readonly onSendText: (document: PresetEmojiDocument) => Promise<boolean>;
  readonly onSendMention: (
    document: PresetEmojiDocument,
    mentions: readonly MessageMention[],
  ) => Promise<boolean>;
  readonly mentionMembers: readonly WebIMGroupMember[];
  readonly canMentionAll: boolean;
  readonly currentUserID: string;
  readonly mentionRequest: ChatComposerMentionRequest | null;
  readonly editingMessage: Message | null;
  readonly onCancelEdit: () => void;
  readonly onEditText: (
    message: Message,
    document: PresetEmojiDocument,
  ) => Promise<boolean>;
  readonly quoteMessage: Message | null;
  readonly isGroup: boolean;
  readonly onCancelQuote: () => void;
  readonly onSendQuote: (sourceMessage: Message, text: string) => Promise<boolean>;
  readonly onSendAlbum: (items: readonly ChatAlbumSelectionItem[]) => Promise<void>;
  readonly onSendSubmission: (
    plan: IMComposerSubmissionPlan,
    document: PresetEmojiDocument,
    mentions: readonly MessageMention[],
    quoteMessage: Message | null,
    media: ChatAlbumSelectionItem | null,
    file: File | null,
  ) => Promise<boolean>;
  readonly showCallAction: boolean;
  readonly onOpenCallPicker: () => void;
  readonly onOpenCardPicker: () => void;
  readonly loadCachedCustomEmojis: () => Promise<readonly CustomEmoji[]>;
  readonly syncCustomEmojis: () => Promise<readonly CustomEmoji[]>;
  readonly onSendCustomEmoji: (emoji: CustomEmoji) => Promise<boolean>;
  readonly onManageCustomEmojis: () => void;
  readonly onVoiceRecordStart: () => void | Promise<void>;
  readonly onVoiceRecordSend: () => void | Promise<void>;
  readonly onVoiceRecordCancel: () => void | Promise<void>;
  readonly onError: (message: string) => void;
}
