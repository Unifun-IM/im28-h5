import {
  WEB_IM_FILE_MAX_BYTES,
  WEB_IM_IMAGE_MAX_BYTES,
  WEB_IM_VIDEO_MAX_BYTES,
} from '@im28/im-sdk/web';

/** RN 相册一次选择的产品上限。 */
export const CHAT_ALBUM_SELECTION_LIMIT = 12;

/** H5 可稳定解码和预览的图片 MIME 集合。 */
const CHAT_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

/** H5 相册允许交给原生 video 元数据解析器的 MIME 集合。 */
const CHAT_VIDEO_MIME_TYPES = new Set([
  'video/mp4',
  'video/quicktime',
  'video/x-m4v',
  'video/webm',
]);

/** 隐藏相册 input 与校验集合共享的 accept contract。 */
export const CHAT_ALBUM_ACCEPT = [
  ...CHAT_IMAGE_MIME_TYPES,
  ...CHAT_VIDEO_MIME_TYPES,
].join(',');

/** 相册条目显式区分图片和视频，页面无需重复 MIME 判断。 */
export interface ChatAlbumSelectionItem {
  readonly kind: 'image' | 'video';
  readonly file: File;
}

/** 验证 mixed 相册数量、浏览器媒体类型与单文件大小。 */
export function validateChatAlbumSelection(
  files: readonly File[],
): readonly ChatAlbumSelectionItem[] {
  if (files.length > CHAT_ALBUM_SELECTION_LIMIT) {
    throw new Error(`一次最多选择 ${CHAT_ALBUM_SELECTION_LIMIT} 项内容`);
  }
  return files.map(validateChatAlbumFile);
}

/** 验证普通文件发送上限并保留浏览器原始 File。 */
export function validateChatFile(file: File): File {
  if (file.size > WEB_IM_FILE_MAX_BYTES) {
    throw new Error(`文件不能超过 ${formatMegabytes(WEB_IM_FILE_MAX_BYTES)}`);
  }
  return file;
}

/** 将固定字节上限转换为用户可读 MB 文案。 */
function formatMegabytes(bytes: number): string {
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}

/** 将单个浏览器 File 校验并收窄为相册媒体条目。 */
function validateChatAlbumFile(file: File): ChatAlbumSelectionItem {
  // mimeType 使用浏览器报告值，不按文件名伪造内容类型。
  const mimeType = file.type.toLowerCase();
  if (CHAT_IMAGE_MIME_TYPES.has(mimeType)) {
    if (file.size > WEB_IM_IMAGE_MAX_BYTES) {
      throw new Error(
        `图片不能超过 ${formatMegabytes(WEB_IM_IMAGE_MAX_BYTES)}`,
      );
    }
    return { kind: 'image', file };
  }
  if (CHAT_VIDEO_MIME_TYPES.has(mimeType)) {
    if (file.size > WEB_IM_VIDEO_MAX_BYTES) {
      throw new Error(
        `视频不能超过 ${formatMegabytes(WEB_IM_VIDEO_MAX_BYTES)}`,
      );
    }
    return { kind: 'video', file };
  }
  throw new Error(`暂不支持媒体格式：${file.name}`);
}
