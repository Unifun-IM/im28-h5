import { normalizeChatMediaURL } from './chat-media-view.js';

/** 浏览器下载实现依赖，测试可替换全部外部 I/O。 */
export interface ChatMediaDownloadEnvironment {
  readonly fetchResource: (url: string) => Promise<Response>;
  readonly createObjectURL: (blob: Blob) => string;
  readonly releaseObjectURL: (url: string) => void;
  readonly triggerDownload: (url: string, fileName: string) => void;
  readonly requiresSynchronousDownload: boolean;
  readonly openExternal: (url: string) => boolean;
}

/** 下载请求只携带真实远端地址和建议文件名。 */
export interface ChatMediaDownloadRequest {
  readonly url: string;
  readonly fileName: string;
}

/** 默认浏览器环境集中持有 fetch、Blob URL、DOM 和窗口操作。 */
const browserDownloadEnvironment: ChatMediaDownloadEnvironment = {
  fetchResource: url => fetch(url, { credentials: 'omit' }),
  createObjectURL: blob => URL.createObjectURL(blob),
  releaseObjectURL: url => {
    // 延后一拍释放，确保 Safari 已消费同步 click 产生的下载 URL。
    setTimeout(() => URL.revokeObjectURL(url), 0);
  },
  triggerDownload: (url, fileName) => {
    // anchor 只在同步 click 周期内挂载，避免污染页面导航状态。
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.hidden = true;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  },
  // Safari 会在异步 fetch 后撤销下载所需的用户手势，必须同步提交远端 URL。
  requiresSynchronousDownload: isSafariBrowser(),
  openExternal: url => {
    // opened 在用户手势内同步创建，null 才能可靠表示弹窗被拦截。
    const opened = window.open('', '_blank');
    if (!opened) return false;
    opened.opener = null;
    opened.location.replace(url);
    return true;
  },
};

/** 清理服务端文件名中的路径和浏览器不兼容字符。 */
export function sanitizeChatDownloadName(value: string): string {
  // decoded 兼容 URL 编码文件名，非法编码保留原值。
  const decoded = safelyDecode(value.trim().split('/').pop() ?? '');
  return decoded.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').trim();
}

/** 从媒体 URL 推导文件名，缺失时使用明确类型兜底。 */
export function getChatMediaDownloadName(
  url: string,
  preferredName: string,
  fallbackName: string,
): string {
  // preferred 是文件消息提供的服务端名称。
  const preferred = sanitizeChatDownloadName(preferredName);
  if (preferred) return preferred;
  try {
    // pathnameName 从安全 URL 的最后一个 path segment 推导。
    const pathnameName = sanitizeChatDownloadName(new URL(url).pathname);
    return pathnameName || fallbackName;
  } catch {
    return fallbackName;
  }
}

/** 先验证 HTTP 响应并取得真实 Blob，再触发浏览器下载。 */
export async function downloadChatMedia(
  request: ChatMediaDownloadRequest,
  environment: ChatMediaDownloadEnvironment = browserDownloadEnvironment,
): Promise<void> {
  // url 必须通过与消息预览一致的协议白名单。
  const url = normalizeChatMediaURL(request.url);
  if (!url) throw new Error('文件地址不可用。');
  // fileName 禁止携带目录和控制字符。
  const fileName = sanitizeChatDownloadName(request.fileName) || '下载文件';
  if (environment.requiresSynchronousDownload) {
    // Safari 直接提交已校验的 HTTP(S) URL，由服务端 Content-Disposition 驱动保存。
    environment.triggerDownload(url, fileName);
    return;
  }
  // response 是下载是否真实完成的唯一网络证据。
  const response = await environment.fetchResource(url);
  if (!response.ok) throw new Error(`下载失败（HTTP ${response.status}）。`);
  // blob 由浏览器持有，不写入 SQLite 或额外离线缓存。
  const blob = await response.blob();
  // objectURL 只服务本次同步下载动作。
  const objectURL = environment.createObjectURL(blob);
  try {
    environment.triggerDownload(objectURL, fileName);
  } finally {
    environment.releaseObjectURL(objectURL);
  }
}

/** 识别需要保留同步用户手势的 Safari 浏览器，不包含 Chromium 衍生实现。 */
function isSafariBrowser(): boolean {
  // userAgent 在非浏览器测试环境中可能不存在。
  const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent;
  return /Safari/i.test(userAgent) && !/(Chrome|Chromium|CriOS|Edg|OPR|Android)/i.test(userAgent);
}

/** 在用户手势内用隔离标签页打开真实远端文件。 */
export function openChatMedia(
  url: string,
  environment: ChatMediaDownloadEnvironment = browserDownloadEnvironment,
): void {
  // safeURL 防止消息 payload 注入非 HTTP(S) scheme。
  const safeURL = normalizeChatMediaURL(url);
  if (!safeURL) throw new Error('文件地址不可用。');
  if (!environment.openExternal(safeURL)) {
    throw new Error('浏览器阻止了文件预览窗口。');
  }
}

/** 解码 URL 文件名，编码异常时保持原始文本。 */
function safelyDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
