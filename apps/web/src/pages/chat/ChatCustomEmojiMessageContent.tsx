import {
  useEffect,
  useMemo,
  useState,
  type SyntheticEvent,
} from 'react';

import { useChatMediaInteraction } from './ChatMediaInteractionProvider.js';
import {
  getChatImageDisplaySize,
  type ChatMediaDisplaySize,
} from './chat-media-layout.js';
import type { ChatMessageView } from './chat-message-view.js';
import { normalizeChatMediaURL } from './chat-media-view.js';

/** 已解析的自然尺寸按资源地址复用，避免聊天页重进时再次跳变。 */
const customEmojiNaturalSizeCache = new Map<string, ChatMediaDisplaySize>();

/** 自定义表情消息只接收已收窄的 type115 展示模型。 */
interface ChatCustomEmojiMessageContentProps {
  readonly view: ChatMessageView;
}

/** 有效快照尺寸按普通图片规则缩放，缺失尺寸时等待浏览器探测。 */
export function getChatCustomEmojiDisplaySize(
  width: number | undefined,
  height: number | undefined,
): ChatMediaDisplaySize | null {
  if (!isPositiveDimension(width) || !isPositiveDimension(height)) return null;
  return getChatImageDisplaySize(width, height);
}

/** 呈现保持真实比例的 type115 消息，并复用聊天页唯一媒体预览 owner。 */
export function ChatCustomEmojiMessageContent({
  view,
}: ChatCustomEmojiMessageContentProps) {
  /** media 提供当前聊天页唯一的短生命周期预览状态。 */
  const media = useChatMediaInteraction();
  /** mediaURL 先拒绝不能持久化或不安全的媒体协议。 */
  const mediaURL = normalizeChatMediaURL(view.mediaURL);
  /** snapshotSize 优先采用 Gateway 已持久化的真实尺寸。 */
  const snapshotSize = useMemo(
    () => getChatCustomEmojiDisplaySize(view.width, view.height),
    [view.height, view.width],
  );
  /** naturalSize 在旧消息缺少尺寸时复用本次运行期间的解码结果。 */
  const [naturalSize, setNaturalSize] = useState<ChatMediaDisplaySize | null>(
    () => snapshotSize ?? customEmojiNaturalSizeCache.get(mediaURL) ?? null,
  );
  /** loadFailed 将不可解码资源收敛为稳定文本，而不是浏览器破图。 */
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setNaturalSize(
      snapshotSize ?? customEmojiNaturalSizeCache.get(mediaURL) ?? null,
    );
    setLoadFailed(false);
  }, [mediaURL, snapshotSize]);

  /** displaySize 始终使用 RN 图片消息的 180px 比例缩放规则。 */
  const displaySize = useMemo(
    () => getChatCustomEmojiDisplaySize(naturalSize?.width, naturalSize?.height),
    [naturalSize],
  );

  /** 旧消息解码完成后缓存真实尺寸并切换到最终布局。 */
  function handleLoad(event: SyntheticEvent<HTMLImageElement>) {
    /** loadedSize 读取浏览器实际解码尺寸，不信任 CSS 盒尺寸。 */
    const loadedSize = getNaturalImageSize(event.currentTarget);
    if (!loadedSize || !mediaURL) return;
    customEmojiNaturalSizeCache.set(mediaURL, loadedSize);
    setNaturalSize(loadedSize);
  }

  if (!mediaURL) {
    return <span className="rn-chat-message-text is-unsupported">{view.text}</span>;
  }

  return (
    <button
      className={`rn-chat-media-action rn-chat-custom-emoji-action${displaySize ? '' : ' is-probing'}${loadFailed ? ' is-load-error' : ''}`}
      type="button"
      aria-label={loadFailed ? '自定义表情加载失败' : '预览自定义表情'}
      aria-busy={!displaySize && !loadFailed}
      disabled={loadFailed}
      onClick={() => media.openPreview(view)}
    >
      <img
        className="rn-chat-emoji-content"
        src={mediaURL}
        alt="自定义表情"
        {...(displaySize
          ? {
              width: displaySize.width,
              height: displaySize.height,
              style: displaySize,
            }
          : {})}
        onLoad={handleLoad}
        onError={() => setLoadFailed(true)}
      />
      <span className="rn-chat-custom-emoji-load-error">表情加载失败</span>
    </button>
  );
}

/** 从已解码图片读取有限正数尺寸。 */
function getNaturalImageSize(
  image: HTMLImageElement,
): ChatMediaDisplaySize | null {
  /** width 使用资源自然宽度，避免布局缩放反向污染缓存。 */
  const width = image.naturalWidth;
  /** height 使用资源自然高度，保持透明表情的原始画布比例。 */
  const height = image.naturalHeight;
  return isPositiveDimension(width) && isPositiveDimension(height)
    ? { width, height }
    : null;
}

/** 判断媒体宽高是否为有限正数。 */
function isPositiveDimension(value: number | undefined): value is number {
  return Number.isFinite(value) && (value ?? 0) > 0;
}
