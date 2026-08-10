/** SDK 视频发送需要的浏览器解码元数据。 */
export interface ChatVideoMetadata {
  readonly durationSeconds: number;
  readonly width: number;
  readonly height: number;
}

/** 可注入的最小 video element contract 便于无真实媒体测试。 */
export interface ChatVideoMetadataElement {
  preload: string;
  src: string;
  readonly duration: number;
  readonly videoWidth: number;
  readonly videoHeight: number;
  onloadedmetadata: ((event: Event) => void) | null;
  onerror: ((event: Event) => void) | null;
  load(): void;
  remove(): void;
}

/** 浏览器 URL 与 video element I/O 边界。 */
export interface ChatVideoMetadataDependencies {
  readonly createObjectURL: (file: File) => string;
  readonly revokeObjectURL: (url: string) => void;
  readonly createVideoElement: () => ChatVideoMetadataElement;
}

/** 读取本地视频时长和像素尺寸，失败时禁止进入上传阶段。 */
export function readChatVideoMetadata(
  file: File,
  dependencies: ChatVideoMetadataDependencies = BROWSER_VIDEO_METADATA_DEPENDENCIES,
): Promise<ChatVideoMetadata> {
  // objectURL 只用于本轮 metadata 解码，绝不写入消息或数据库。
  const objectURL = dependencies.createObjectURL(file);
  // video 是当前文件的短生命周期 metadata decoder。
  const video = dependencies.createVideoElement();
  return new Promise((resolve, reject) => {
    // settled 防止 timeout 与媒体事件重复完成 Promise。
    let settled = false;
    // timeout 避免损坏文件让 composer 永久保持 sending。
    const timeout = globalThis.setTimeout(
      () => finishWithError('视频信息读取超时'),
      15_000,
    );

    /** 回收 object URL、事件和隐藏 video element。 */
    function cleanup() {
      globalThis.clearTimeout(timeout);
      video.onloadedmetadata = null;
      video.onerror = null;
      video.remove();
      dependencies.revokeObjectURL(objectURL);
    }

    /** 以稳定用户文案结束失败分支。 */
    function finishWithError(message: string) {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(message));
    }

    /** 验证浏览器解码结果后返回 SDK 需要的精确字段。 */
    function finishWithMetadata() {
      if (settled) return;
      // metadata 拒绝无限时长或无画面的损坏视频。
      const metadata = normalizeChatVideoMetadata(video);
      if (!metadata) {
        finishWithError('无法读取视频信息');
        return;
      }
      settled = true;
      cleanup();
      resolve(metadata);
    }

    video.preload = 'metadata';
    video.onloadedmetadata = finishWithMetadata;
    video.onerror = () => finishWithError('无法读取视频信息');
    video.src = objectURL;
    video.load();
  });
}

/** 将 HTMLVideoElement 数值收敛为可发送的稳定整数元数据。 */
function normalizeChatVideoMetadata(
  video: ChatVideoMetadataElement,
): ChatVideoMetadata | null {
  // durationSeconds 保留小数供 SDK 按 RN 规则四舍五入。
  const durationSeconds = Number(video.duration);
  // width 和 height 是浏览器完成 metadata 解码后的原始像素。
  const width = Math.round(Number(video.videoWidth));
  const height = Math.round(Number(video.videoHeight));
  if (!Number.isFinite(durationSeconds) || durationSeconds < 0) return null;
  if (!Number.isFinite(width) || width <= 0) return null;
  if (!Number.isFinite(height) || height <= 0) return null;
  return { durationSeconds, width, height };
}

/** 生产默认依赖只使用浏览器标准 File/URL/video API。 */
const BROWSER_VIDEO_METADATA_DEPENDENCIES: ChatVideoMetadataDependencies = {
  createObjectURL: file => URL.createObjectURL(file),
  revokeObjectURL: url => URL.revokeObjectURL(url),
  createVideoElement: () => document.createElement('video'),
};
