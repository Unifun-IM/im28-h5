import { useRef, useState, type ChangeEvent } from 'react';
import { shouldStageIMComposerMedia } from '@im28/im-sdk/web';

import {
  validateChatAlbumSelection,
  validateChatFile,
  type ChatAlbumSelectionItem,
} from './chat-attachment-selection.js';

/** 附件选择 hook 只持有浏览器 input 和 RN 对齐校验。 */
interface UseChatComposerAttachmentsOptions {
  readonly draftText: string;
  readonly onSendAlbum: (
    items: readonly ChatAlbumSelectionItem[],
  ) => Promise<void>;
  readonly onClosePanel: () => void;
  readonly onError: (message: string) => void;
}

/** 将浏览器文件选择职责从 composer 视图中隔离。 */
export function useChatComposerAttachments({
  draftText,
  onSendAlbum,
  onClosePanel,
  onError,
}: UseChatComposerAttachmentsOptions) {
  // pendingMedia 对齐 RN：有草稿且单选媒体时等待一次显式提交。
  const [pendingMedia, setPendingMedia] = useState<ChatAlbumSelectionItem | null>(null);
  // pendingFile 对齐 RN：普通文件选择后始终等待一次显式提交。
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  // albumInputRef 触发浏览器多图选择器。
  const albumInputRef = useRef<HTMLInputElement>(null);
  // cameraInputRef 触发浏览器后置相机或单张图片捕获选择器。
  const cameraInputRef = useRef<HTMLInputElement>(null);
  // fileInputRef 触发浏览器单文件选择器。
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** 校验浏览器相册结果后按原顺序交给页面 facade caller。 */
  async function selectAlbum(event: ChangeEvent<HTMLInputElement>) {
    // files 立即复制，随后清空 input 允许重复选择同一文件。
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = '';
    onClosePanel();
    if (!files.length) return;
    try {
      // items 先完成数量、类型与大小校验，再决定立即发送或待发送。
      const items = validateChatAlbumSelection(files);
      if (shouldStageIMComposerMedia(draftText, items.length)) {
        setPendingMedia(items[0] ?? null);
        return;
      }
      await onSendAlbum(items);
    } catch (cause) {
      onError(readSelectionError(cause));
    }
  }

  /** 校验浏览器拍照结果后复用唯一图片发送链。 */
  async function selectCamera(event: ChangeEvent<HTMLInputElement>) {
    // file 固定相机 input 的唯一结果，取消拍照不产生错误。
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    onClosePanel();
    if (!file) return;
    try {
      // items 复用相册校验，拍照仍保持单媒体语义。
      const items = validateChatAlbumSelection([file]);
      if (shouldStageIMComposerMedia(draftText, items.length)) {
        setPendingMedia(items[0] ?? null);
        return;
      }
      await onSendAlbum(items);
    } catch (cause) {
      onError(readSelectionError(cause));
    }
  }

  /** 校验普通文件后交给唯一 SDK sendFile caller。 */
  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    // file 固定本轮第一个选择结果。
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    onClosePanel();
    if (!file) return;
    try {
      setPendingFile(validateChatFile(file));
    } catch (cause) {
      onError(readSelectionError(cause));
    }
  }

  return {
    albumInputRef,
    cameraInputRef,
    fileInputRef,
    pendingMedia,
    pendingFile,
    selectAlbum,
    selectCamera,
    selectFile,
    clearPendingMedia: () => setPendingMedia(null),
    clearPendingFile: () => setPendingFile(null),
  };
}

/** 将选择器异常转换为不包含本地路径的用户文案。 */
function readSelectionError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '附件选择失败';
}
