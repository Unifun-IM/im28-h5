import { useRef, type ChangeEvent } from 'react';

import {
  validateChatAlbumSelection,
  validateChatFile,
  type ChatAlbumSelectionItem,
} from './chat-attachment-selection.js';

/** 附件选择 hook 只持有浏览器 input 和 RN 对齐校验。 */
interface UseChatComposerAttachmentsOptions {
  readonly onSendAlbum: (
    items: readonly ChatAlbumSelectionItem[],
  ) => Promise<void>;
  readonly onSendFile: (file: File) => Promise<void>;
  readonly onClosePanel: () => void;
  readonly onError: (message: string) => void;
}

/** 将浏览器文件选择职责从 composer 视图中隔离。 */
export function useChatComposerAttachments({
  onSendAlbum,
  onSendFile,
  onClosePanel,
  onError,
}: UseChatComposerAttachmentsOptions) {
  // albumInputRef 触发浏览器多图选择器。
  const albumInputRef = useRef<HTMLInputElement>(null);
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
      await onSendAlbum(validateChatAlbumSelection(files));
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
      await onSendFile(validateChatFile(file));
    } catch (cause) {
      onError(readSelectionError(cause));
    }
  }

  return { albumInputRef, fileInputRef, selectAlbum, selectFile };
}

/** 将选择器异常转换为不包含本地路径的用户文案。 */
function readSelectionError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '附件选择失败';
}
