import { useCallback } from 'react';
import type {
  Message,
  PresetEmojiDocument,
  WebIMSync,
} from '@im28/im-sdk/web';

import type { ChatAlbumSelectionItem } from './chat-attachment-selection.js';
import { readChatVideoMetadata } from './chat-video-metadata.js';

/** 页面 outgoing action 只依赖 shared facade 与浏览器媒体 metadata adapter。 */
interface UseChatOutgoingMessageActionsOptions {
  readonly conversationID: string;
  readonly onSending: (message: Message) => void;
  readonly runMessageOperation: (
    operation: (activeSync: WebIMSync) => Promise<void>,
  ) => Promise<void>;
}

/** ChatPage 消费的真实文本、媒体与失败重试 actions。 */
interface ChatOutgoingMessageActions {
  readonly sendText: (document: PresetEmojiDocument) => Promise<void>;
  readonly sendQuote: (sourceMessage: Message, text: string) => Promise<void>;
  readonly sendAlbum: (items: readonly ChatAlbumSelectionItem[]) => Promise<void>;
  readonly sendFile: (file: File) => Promise<void>;
  readonly sendAudio: (file: File, durationSeconds: number) => Promise<void>;
  readonly retry: (clientMsgID: string) => Promise<void>;
}

/** 将页面 outgoing actions 收敛到唯一 WebIMSync message facade。 */
export function useChatOutgoingMessageActions({
  conversationID,
  onSending,
  runMessageOperation,
}: UseChatOutgoingMessageActionsOptions): ChatOutgoingMessageActions {
  /** 发送真实文本并保留 preset entity document。 */
  const sendText = useCallback(
    (document: PresetEmojiDocument) =>
      runMessageOperation(async activeSync => {
        await activeSync.messages.sendText({
          conversationID,
          text: document.text,
          entities: document.entities,
        });
      }),
    [conversationID, runMessageOperation],
  );

  /** 发送 RN type114 引用并让 shared SDK 构造来源 body。 */
  const sendQuote = useCallback(
    (sourceMessage: Message, text: string) =>
      runMessageOperation(async activeSync => {
        await activeSync.messages.sendQuote({
          conversationID,
          sourceMessage,
          text,
          onSending,
        });
      }),
    [conversationID, onSending, runMessageOperation],
  );

  /** 按浏览器选择顺序逐张上传并发送图片或视频。 */
  const sendAlbum = useCallback(
    (items: readonly ChatAlbumSelectionItem[]) =>
      runMessageOperation(async activeSync => {
        for (const item of items) {
          // file 保留浏览器选择顺序和原始 Blob 身份。
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
            continue;
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
      }),
    [conversationID, onSending, runMessageOperation],
  );

  /** 发送普通文件并保留浏览器报告的 MIME 与精确字节数。 */
  const sendFile = useCallback(
    (file: File) =>
      runMessageOperation(async activeSync => {
        await activeSync.messages.sendFile({
          conversationID,
          source: file,
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          onSending,
        });
      }),
    [conversationID, onSending, runMessageOperation],
  );

  /** 发送浏览器录音文件并保留实际媒体格式和时长。 */
  const sendAudio = useCallback(
    (file: File, durationSeconds: number) =>
      runMessageOperation(async activeSync => {
        await activeSync.messages.sendAudio({
          conversationID,
          source: file,
          name: file.name,
          mimeType: file.type,
          size: file.size,
          durationSeconds,
          onSending,
        });
      }),
    [conversationID, onSending, runMessageOperation],
  );

  /** 让 shared SDK 从同一 SQLite failed row 恢复安全请求。 */
  const retry = useCallback(
    (clientMsgID: string) =>
      runMessageOperation(async activeSync => {
        await activeSync.messages.retry({ clientMsgID, onSending });
      }),
    [onSending, runMessageOperation],
  );

  return { sendText, sendQuote, sendAlbum, sendFile, sendAudio, retry };
}
