import type {
  CustomEmoji,
  Message,
  MessageMention,
  PresetEmojiDocument,
  WebIMGroupMember,
} from '@im28/im-sdk/web';

import type { ChatAlbumSelectionItem } from './chat-attachment-selection.js';
import type { ChatVoiceRecordingStatus } from './useChatVoiceRecorder.js';

/** RN composer 对外只暴露页面编排所需的文档、媒体与提及 actions。 */
export interface ChatComposerProps {
  readonly sending: boolean;
  readonly voiceRecordingStatus: ChatVoiceRecordingStatus;
  readonly voiceRecordingSeconds: number;
  readonly onSendText: (document: PresetEmojiDocument) => Promise<void>;
  readonly onSendMention: (
    document: PresetEmojiDocument,
    mentions: readonly MessageMention[],
  ) => Promise<void>;
  readonly mentionMembers: readonly WebIMGroupMember[];
  readonly canMentionAll: boolean;
  readonly currentUserID: string;
  readonly editingMessage: Message | null;
  readonly onCancelEdit: () => void;
  readonly onEditText: (
    message: Message,
    document: PresetEmojiDocument,
  ) => Promise<boolean>;
  readonly quoteMessage: Message | null;
  readonly isGroup: boolean;
  readonly onCancelQuote: () => void;
  readonly onSendQuote: (sourceMessage: Message, text: string) => Promise<void>;
  readonly onSendAlbum: (items: readonly ChatAlbumSelectionItem[]) => Promise<void>;
  readonly onSendFile: (file: File) => Promise<void>;
  readonly loadCachedCustomEmojis: () => Promise<readonly CustomEmoji[]>;
  readonly syncCustomEmojis: () => Promise<readonly CustomEmoji[]>;
  readonly onSendCustomEmoji: (emoji: CustomEmoji) => Promise<boolean>;
  readonly onManageCustomEmojis: () => void;
  readonly onVoiceRecordStart: () => void | Promise<void>;
  readonly onVoiceRecordSend: () => void | Promise<void>;
  readonly onVoiceRecordCancel: () => void | Promise<void>;
  readonly onError: (message: string) => void;
}
