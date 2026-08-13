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

/** 聊天页请求 Composer 插入一次稳定群成员提及。 */
export interface ChatComposerMentionRequest {
  readonly id: number;
  readonly member: WebIMGroupMember;
}

/** RN composer 对外只暴露页面编排所需的文档、媒体与提及 actions。 */
export interface ChatComposerProps {
  /** 页面从账号内 SQLite 恢复的未发送草稿。 */
  readonly initialDraftDocument: PresetEmojiDocument;
  /** 普通 Composer 草稿变化后交还页面持久化，编辑消息不触发。 */
  readonly onDraftDocumentChange: (document: PresetEmojiDocument) => void;
  readonly sending: boolean;
  readonly voiceRecordingStatus: ChatVoiceRecordingStatus;
  readonly voiceRecordingSeconds: number;
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
