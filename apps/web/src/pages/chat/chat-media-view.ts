import type { ChatMessageView } from './chat-message-view.js';

/** 聊天媒体预览只覆盖当前切片批准的图片和视频。 */
export type ChatMediaPreviewKind = 'image' | 'video';

/** 全屏媒体层消费的最小安全投影。 */
export interface ChatMediaPreview {
  readonly kind: ChatMediaPreviewKind;
  readonly url: string;
  readonly title: string;
}

/** 浏览器持久化消息允许重新访问的远端媒体协议。 */
const ALLOWED_MEDIA_PROTOCOLS = new Set(['https:', 'http:']);

/** 将消息媒体地址收窄为可由浏览器安全加载的绝对 HTTP(S) URL。 */
export function normalizeChatMediaURL(value: string | undefined): string {
  // candidate 保留服务端 URL 原值中的编码，仅去除两端空白。
  const candidate = value?.trim() ?? '';
  if (!candidate) return '';
  try {
    // parsed 拒绝相对地址和 javascript/data/blob 等不可持久化协议。
    const parsed = new URL(candidate);
    return ALLOWED_MEDIA_PROTOCOLS.has(parsed.protocol) ? parsed.href : '';
  } catch {
    return '';
  }
}

/** 从图片或视频消息构造全屏预览动作，非法地址时 fail-closed。 */
export function getChatMediaPreview(
  view: ChatMessageView,
): ChatMediaPreview | null {
  if (view.kind === 'image') {
    // url 优先使用原图，并兼容历史消息只保留缩略图的情况。
    const url = normalizeChatMediaURL(view.mediaURL || view.thumbnailURL);
    return url ? { kind: 'image', url, title: '图片预览' } : null;
  }
  if (view.kind === 'video') {
    // url 只接受真实视频地址，缩略图不能冒充可播放视频。
    const url = normalizeChatMediaURL(view.mediaURL);
    return url ? { kind: 'video', url, title: '视频预览' } : null;
  }
  return null;
}

/** 从语音消息读取真实可播放地址，其他消息和非法协议返回空串。 */
export function getChatAudioURL(view: ChatMessageView): string {
  return view.kind === 'audio' ? normalizeChatMediaURL(view.mediaURL) : '';
}
