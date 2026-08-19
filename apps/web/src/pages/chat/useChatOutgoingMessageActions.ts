import { useCallback } from 'react';
import type {
  IMComposerSubmissionPlan,
  Message,
  MessageMention,
  PresetEmojiDocument,
  WebIMSync,
} from '@im28/im-sdk/web';

import type { ChatAlbumSelectionItem } from './chat-attachment-selection.js';
import { readChatVideoMetadata } from './chat-video-metadata.js';

/** 页面 outgoing action 只依赖 shared facade 与浏览器媒体 metadata adapter。 */
interface UseChatOutgoingMessageActionsOptions {
  readonly conversationID: string;
  readonly groupID: string;
  readonly onSending: (message: Message) => void;
  readonly runMessageOperation: (
    operation: (activeSync: WebIMSync) => Promise<void>,
  ) => Promise<boolean>;
}

/** ChatPage 消费的真实文本、媒体与失败重试 actions。 */
interface ChatOutgoingMessageActions {
  readonly sendText: (document: PresetEmojiDocument) => Promise<boolean>;
  readonly sendMention: (
    document: PresetEmojiDocument,
    mentions: readonly MessageMention[],
  ) => Promise<boolean>;
  readonly sendQuote: (sourceMessage: Message, text: string) => Promise<boolean>;
  readonly sendAlbum: (items: readonly ChatAlbumSelectionItem[]) => Promise<void>;
  readonly sendAudio: (file: File, durationSeconds: number) => Promise<void>;
  readonly sendSubmission: (
    plan: IMComposerSubmissionPlan,
    document: PresetEmojiDocument,
    mentions: readonly MessageMention[],
    quoteMessage: Message | null,
    media: ChatAlbumSelectionItem | null,
    file: File | null,
  ) => Promise<boolean>;
  readonly retry: (clientMsgID: string) => Promise<void>;
}

/** 将页面 outgoing actions 收敛到唯一 WebIMSync message facade。 */
export function useChatOutgoingMessageActions({
  conversationID,
  groupID,
  onSending,
  runMessageOperation,
}: UseChatOutgoingMessageActionsOptions): ChatOutgoingMessageActions {
  /** 发送真实文本并保留 preset entity document。 */
  const sendText = useCallback(
    (document: PresetEmojiDocument) =>
      runMessageOperation(async activeSync => {
        await sendTextDocument(activeSync, conversationID, document, onSending);
      }),
    [conversationID, onSending, runMessageOperation],
  );

  /** 发送 RN type106 群聊提及并让 SDK 持有 body/cache 语义。 */
  const sendMention = useCallback(
    (document: PresetEmojiDocument, mentions: readonly MessageMention[]) =>
      runMessageOperation(async activeSync => {
        await sendMentionDocument(
          activeSync,
          conversationID,
          groupID,
          document,
          mentions,
          onSending,
        );
      }),
    [conversationID, groupID, onSending, runMessageOperation],
  );

  /** 发送 RN type114 引用并让 shared SDK 构造来源 body。 */
  const sendQuote = useCallback(
    (sourceMessage: Message, text: string) =>
      runMessageOperation(async activeSync => {
        await sendQuoteText(
          activeSync,
          conversationID,
          sourceMessage,
          text,
          onSending,
        );
      }),
    [conversationID, onSending, runMessageOperation],
  );

  /** 按浏览器选择顺序逐张上传并发送图片或视频。 */
  const sendAlbum = useCallback(
    async (items: readonly ChatAlbumSelectionItem[]) => {
      await runMessageOperation(async activeSync => {
        for (const item of items) {
          await sendAlbumItem(activeSync, conversationID, item, onSending);
        }
      });
    },
    [conversationID, onSending, runMessageOperation],
  );

  /** 发送浏览器录音文件并保留实际媒体格式和时长。 */
  const sendAudio = useCallback(
    async (file: File, durationSeconds: number) => {
      await runMessageOperation(async activeSync => {
        await activeSync.messages.sendAudio({
          conversationID,
          source: file,
          name: file.name,
          mimeType: file.type,
          size: file.size,
          durationSeconds,
          onSending,
        });
      });
    },
    [conversationID, onSending, runMessageOperation],
  );

  /** 按共享 Composer 计划在同一 operation 内串行发送附件与文本。 */
  const sendSubmission = useCallback(
    (
      plan: IMComposerSubmissionPlan,
      document: PresetEmojiDocument,
      mentions: readonly MessageMention[],
      quoteMessage: Message | null,
      media: ChatAlbumSelectionItem | null,
      file: File | null,
    ) => runMessageOperation(async activeSync => {
      for (const step of plan.steps) {
        if (step === 'media' && media) {
          await sendAlbumItem(activeSync, conversationID, media, onSending);
          continue;
        }
        if (step === 'file' && file) {
          await activeSync.messages.sendFile({
            conversationID,
            source: file,
            name: file.name,
            mimeType: file.type || 'application/octet-stream',
            size: file.size,
            onSending,
          });
          continue;
        }
        if (step !== 'text') continue;
        if (quoteMessage) {
          await sendQuoteText(
            activeSync,
            conversationID,
            quoteMessage,
            plan.text,
            onSending,
          );
          continue;
        }
        if (mentions.length) {
          await sendMentionDocument(
            activeSync,
            conversationID,
            groupID,
            { text: plan.text, entities: document.entities },
            mentions,
            onSending,
          );
          continue;
        }
        await sendTextDocument(
          activeSync,
          conversationID,
          { text: plan.text, entities: document.entities },
          onSending,
        );
      }
    }),
    [conversationID, groupID, onSending, runMessageOperation],
  );

  /** 让 shared SDK 从同一 SQLite failed row 恢复安全请求。 */
  const retry = useCallback(
    async (clientMsgID: string) => {
      await runMessageOperation(async activeSync => {
        await activeSync.messages.retry({ clientMsgID, onSending });
      });
    },
    [onSending, runMessageOperation],
  );

  return {
    sendText,
    sendMention,
    sendQuote,
    sendAlbum,
    sendAudio,
    sendSubmission,
    retry,
  };
}

/** 发送普通文本，供单消息与组合提交共用同一 SDK 映射。 */
async function sendTextDocument(
  activeSync: WebIMSync,
  conversationID: string,
  document: PresetEmojiDocument,
  onSending: (message: Message) => void,
): Promise<void> {
  await activeSync.messages.sendText({
    conversationID,
    text: document.text,
    entities: document.entities,
    onSending,
  });
}

/** 发送群提及文本，供单消息与组合提交共用同一身份校验。 */
async function sendMentionDocument(
  activeSync: WebIMSync,
  conversationID: string,
  groupID: string,
  document: PresetEmojiDocument,
  mentions: readonly MessageMention[],
  onSending: (message: Message) => void,
): Promise<void> {
  if (!groupID) throw new Error('群聊会话不存在或尚未同步');
  await activeSync.groupMentions.send({
    groupID,
    conversationID,
    text: document.text,
    entities: document.entities,
    mentions,
    onSending,
  });
}

/** 发送引用文本，供单消息与组合提交共用 type114 facade。 */
async function sendQuoteText(
  activeSync: WebIMSync,
  conversationID: string,
  sourceMessage: Message,
  text: string,
  onSending: (message: Message) => void,
): Promise<void> {
  await activeSync.messages.sendQuote({
    conversationID,
    sourceMessage,
    text,
    onSending,
  });
}

/** 在组合提交和立即相册发送之间复用唯一媒体映射。 */
async function sendAlbumItem(
  activeSync: WebIMSync,
  conversationID: string,
  item: ChatAlbumSelectionItem,
  onSending: (message: Message) => void,
): Promise<void> {
  // file 保留浏览器选择结果的原始 Blob 身份。
  const { file } = item;
  if (item.kind === 'image') {
    await activeSync.messages.sendImage({
      conversationID,
      source: file,
      name: file.name,
      mimeType: file.type,
      size: file.size,
      onSending,
    });
    return;
  }
  // metadata 由标准 video decoder 在 SDK I/O 前读取。
  const metadata = await readChatVideoMetadata(file);
  await activeSync.messages.sendVideo({
    conversationID,
    source: file,
    name: file.name,
    mimeType: file.type,
    size: file.size,
    ...metadata,
    onSending,
  });
}
