import {
  WEB_IM_IMAGE_MAX_BYTES,
  type IMMediaUploadInput,
} from '@im28/im-sdk/web';

/** RN 管理页一次最多选择的图片数量。 */
export const CUSTOM_EMOJI_PICK_LIMIT = 12;
/** Gateway 单账号最多保留的自定义表情数量。 */
export const CUSTOM_EMOJI_LIBRARY_LIMIT = 100;
/** 自定义表情选择器只接受 Gateway 支持的图片类型。 */
export const CUSTOM_EMOJI_FILE_ACCEPT = '.jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp';

/** 文件校验只依赖浏览器 File 的稳定元数据。 */
export interface CustomEmojiFileLike {
  readonly source: unknown;
  readonly name: string;
  readonly type: string;
  readonly size: number;
}

/** 将浏览器文件批次完整校验后转换为共享上传端口输入。 */
export function buildCustomEmojiUploadInputs(
  files: readonly CustomEmojiFileLike[],
  currentCount: number,
): readonly IMMediaUploadInput[] {
  // remaining 防止客户端明显超过账号容量。
  const remaining = Math.max(0, CUSTOM_EMOJI_LIBRARY_LIMIT - currentCount);
  if (!remaining) throw new TypeError('最多添加100个表情');
  if (!files.length) throw new TypeError('请选择表情图片');
  if (files.length > Math.min(CUSTOM_EMOJI_PICK_LIMIT, remaining)) {
    throw new TypeError(`本次最多选择${Math.min(CUSTOM_EMOJI_PICK_LIMIT, remaining)}张图片`);
  }
  return files.map(file => {
    // extension 只从文件名最后一个点后读取，交由 SDK 再次执行白名单校验。
    const extension = file.name.split('.').pop()?.trim().toLowerCase() ?? '';
    if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      throw new TypeError('仅支持 JPG、PNG、GIF、WEBP 图片');
    }
    if (!file.type.toLowerCase().startsWith('image/')) {
      throw new TypeError('所选文件不是图片');
    }
    if (!Number.isFinite(file.size) || file.size <= 0 || file.size > WEB_IM_IMAGE_MAX_BYTES) {
      throw new TypeError('单张表情图片不能超过10MB');
    }
    return {
      source: file.source,
      name: file.name,
      mimeType: file.type,
      size: file.size,
      extension,
    };
  });
}

/** 按点击先后切换删除选择并保留稳定编号。 */
export function toggleCustomEmojiSelection(
  selectedIDs: readonly string[],
  emojiID: string,
): readonly string[] {
  // normalizedID 阻止空 ID 进入选择状态。
  const normalizedID = emojiID.trim();
  if (!normalizedID) return selectedIDs;
  return selectedIDs.includes(normalizedID)
    ? selectedIDs.filter(item => item !== normalizedID)
    : [...selectedIDs, normalizedID];
}
