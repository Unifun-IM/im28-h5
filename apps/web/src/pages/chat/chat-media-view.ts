import type { ChatMessageView } from './chat-message-view.js';

/** 聊天媒体预览覆盖图片、视频、文件和纯自定义表情四类真实 payload。 */
export type ChatMediaPreviewKind = 'image' | 'video' | 'file' | 'emoji';

/** 全屏媒体层消费的最小安全投影。 */
export interface ChatMediaPreview {
  readonly kind: ChatMediaPreviewKind;
  readonly url: string;
  readonly fallbackURL?: string;
  readonly title: string;
  readonly fileName?: string;
  readonly detail?: string;
}

/** 浏览器持久化消息允许重新访问的远端媒体协议。 */
const ALLOWED_MEDIA_PROTOCOLS = new Set(['https:', 'http:']);

/** 允许浏览器使用 OSS 图片处理转换源文件格式的公开域名规则。 */
const ALIYUN_OSS_HOST_PATTERN = /(?:^|\.)oss-[^.]+\.aliyuncs\.com$/i;

/** OSS 签名参数不能在客户端追加图片处理参数。 */
const OSS_SIGNATURE_PARAMETER_NAMES = new Set([
  'ossaccesskeyid',
  'signature',
  'x-oss-signature',
]);

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

/** 为公开 OSS 图片生成浏览器可解码的 JPEG 展示地址，其他来源保持原样。 */
export function getChatImageDisplayURL(
  value: string | undefined,
  targetWidth = 360,
): string {
  /** normalizedURL 先通过持久化媒体协议白名单。 */
  const normalizedURL = normalizeChatMediaURL(value);
  if (!normalizedURL) return '';
  /** parsed 用于判断域名、既有处理参数和签名约束。 */
  const parsed = new URL(normalizedURL);
  /** parameterNames 统一为小写以覆盖 OSS 两代签名字段。 */
  const parameterNames = new Set(
    Array.from(parsed.searchParams.keys(), key => key.toLowerCase()),
  );
  /** hasSignature 禁止修改依赖完整 query 签名的私有对象地址。 */
  const hasSignature = Array.from(OSS_SIGNATURE_PARAMETER_NAMES).some(name =>
    parameterNames.has(name),
  );
  if (
    !ALIYUN_OSS_HOST_PATTERN.test(parsed.hostname) ||
    parsed.searchParams.has('x-oss-process') ||
    hasSignature
  ) {
    return normalizedURL;
  }
  /** width 限制请求尺寸，避免异常输入放大 OSS 转码成本。 */
  const width = Math.min(2048, Math.max(1, Math.round(targetWidth)));
  /** separator 保留原有非签名 query，并追加 OSS 原生图片处理语法。 */
  const separator = parsed.search ? '&' : '?';
  return `${parsed.origin}${parsed.pathname}${parsed.search}${separator}x-oss-process=image/resize,w_${width}/format,jpg${parsed.hash}`;
}

/** 从可交互媒体消息构造全屏预览动作，非法地址时 fail-closed。 */
export function getChatMediaPreview(
  view: ChatMessageView,
): ChatMediaPreview | null {
  if (view.kind === 'image') {
    // url 优先使用原图，保留 GIF 动画和服务端原始格式。
    /** sourceURL 保留下载动作需要的原始消息媒体地址。 */
    const sourceURL = normalizeChatMediaURL(view.mediaURL || view.thumbnailURL);
    /** fallbackURL 仅在浏览器无法解码原图时使用 OSS JPEG 投影。 */
    const fallbackURL = getChatImageDisplayURL(sourceURL, 2048);
    return sourceURL
      ? {
          kind: 'image',
          url: sourceURL,
          ...(fallbackURL !== sourceURL ? { fallbackURL } : {}),
          title: '图片预览',
        }
      : null;
  }
  if (view.kind === 'video') {
    // url 只接受真实视频地址，缩略图不能冒充可播放视频。
    const url = normalizeChatMediaURL(view.mediaURL);
    return url ? { kind: 'video', url, title: '视频预览' } : null;
  }
  if (view.kind === 'file') {
    // url 是文件下载与浏览器预览共用的唯一真实源。
    const url = normalizeChatMediaURL(view.mediaURL);
    return url
      ? {
          kind: 'file',
          url,
          title: '文件预览',
          fileName: view.text,
          ...(view.detail ? { detail: view.detail } : {}),
        }
      : null;
  }
  if (view.kind === 'emoji') {
    /** url 使用 type115 消息持久化的原始资源快照。 */
    const url = normalizeChatMediaURL(view.mediaURL);
    return url ? { kind: 'emoji', url, title: '自定义表情预览' } : null;
  }
  return null;
}

/** 从语音消息读取真实可播放地址，其他消息和非法协议返回空串。 */
export function getChatAudioURL(view: ChatMessageView): string {
  return view.kind === 'audio' ? normalizeChatMediaURL(view.mediaURL) : '';
}
