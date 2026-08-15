import type { SyntheticEvent } from 'react';
import { getIMAudioMessageIdentity, type Message } from '@im28/im-sdk/web';

import fileIconURL from '../../assets/rn/assets/icons/imm28/doc.svg';
import playIconURL from '../../assets/rn/assets/icons/imm28/play.solid.svg';
import phoneDisabledIconURL from '../../assets/rn/assets/icons/imm28/phone-disabled.dynamic.svg';
import phoneOutIconURL from '../../assets/rn/assets/icons/imm28/phone-out.dynamic.svg';
import speakIconURL from '../../assets/rn/assets/icons/imm28/speak.svg';
import videoCameraIconURL from '../../assets/rn/assets/icons/imm28/video-camera.dynamic.svg';
import videoCameraOffIconURL from '../../assets/rn/assets/icons/imm28/video-camera-off.dynamic.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { useChatMediaInteraction } from './ChatMediaInteractionProvider.js';
import { getChatImageDisplaySize } from './chat-media-layout.js';
import {
  getChatImageDisplayURL,
  normalizeChatMediaURL,
} from './chat-media-view.js';
import type { ChatMessageView } from './chat-message-view.js';

/** 媒体正文只接收已归一化展示模型、原消息和显式页面动作。 */
interface ChatMediaMessageContentProps {
  readonly view: ChatMessageView;
  readonly message: Message;
  readonly mine: boolean;
  readonly onStartCall?: (mediaType: 'audio' | 'video') => void;
}

/** 媒体消息类别用于总分发器识别纯展示族。 */
const CHAT_MEDIA_MESSAGE_KINDS = new Set<ChatMessageView['kind']>([
  'call',
  'image',
  'video',
  'audio',
  'file',
]);

/** 判断展示模型是否应交给媒体正文 owner。 */
export function isChatMediaMessageView(view: ChatMessageView): boolean {
  return CHAT_MEDIA_MESSAGE_KINDS.has(view.kind);
}

/** 将媒体消息分发给单一职责的类型组件。 */
export function ChatMediaMessageContent(props: ChatMediaMessageContentProps) {
  if (props.view.kind === 'call') return <ChatCallMessageContent {...props} />;
  if (props.view.kind === 'image') return <ChatImageMessageContent {...props} />;
  if (props.view.kind === 'video') return <ChatVideoMessageContent {...props} />;
  if (props.view.kind === 'audio') return <ChatAudioMessageContent {...props} />;
  if (props.view.kind === 'file') return <ChatFileMessageContent {...props} />;
  return null;
}

/** 呈现历史通话记录并把回拨交给页面既有 RTC owner。 */
function ChatCallMessageContent({
  view,
  mine,
  onStartCall,
}: ChatMediaMessageContentProps) {
  /** mediaType 缺失时保持展示但禁止回拨。 */
  const mediaType = view.callMediaType;
  /** iconURL 复刻 RN 对已取消/已拒绝记录使用禁用图标的规则。 */
  const iconURL = mediaType === 'video'
    ? view.callUnanswered ? videoCameraOffIconURL : videoCameraIconURL
    : view.callUnanswered ? phoneDisabledIconURL : phoneOutIconURL;
  return (
    <button
      className={`rn-chat-call-message${mine ? ' is-mine' : ' is-peer'}`}
      type="button"
      aria-label={onStartCall
        ? mediaType === 'video' ? '拨打视频电话' : '拨打语音电话'
        : mediaType === 'video' ? '视频通话记录' : '语音通话记录'}
      disabled={!mediaType || !onStartCall}
      onClick={() => {
        if (mediaType && onStartCall) onStartCall(mediaType);
      }}
    >
      <span>{view.text}</span>
      <RNAssetIcon assetURL={iconURL} />
    </button>
  );
}

/** 呈现图片缩略图并保持原图和 OSS 解码回退链。 */
function ChatImageMessageContent({ view }: ChatMediaMessageContentProps) {
  /** media 提供当前聊天页唯一预览 owner。 */
  const media = useChatMediaInteraction();
  /** imageURL 保持缩略图展示，同时拒绝不安全协议。 */
  const imageURL = normalizeChatMediaURL(view.thumbnailURL || view.mediaURL);
  /** imageSize 按 Gateway 原始宽高复刻 RN 的 180px 比例缩放。 */
  const imageSize = getChatImageDisplaySize(view.width, view.height);
  /** previewURL 在缩略图失败时提供原图回退。 */
  const previewURL = normalizeChatMediaURL(view.mediaURL || view.thumbnailURL);
  /** fallbackURL 只在缩略图与原图都无法解码时转换权威原图。 */
  const fallbackURL = getChatImageDisplayURL(previewURL || imageURL);
  if (!imageURL) return <span className="rn-chat-message-text">{view.text}</span>;
  return (
    <button
      className="rn-chat-media-action"
      type="button"
      aria-label="预览图片"
      disabled={!previewURL}
      onClick={() => media.openPreview(view)}
    >
      <img
        className="rn-chat-media-image"
        src={imageURL}
        alt="图片消息"
        width={imageSize.width}
        height={imageSize.height}
        style={imageSize}
        onLoad={event => handleChatImageLoad(event, view)}
        onError={event => handleChatImageError(event, previewURL, fallbackURL)}
      />
      <span className="rn-chat-media-load-error">图片加载失败</span>
    </button>
  );
}

/** 使用浏览器解码尺寸补偿早期缺少宽高元数据的图片。 */
function handleChatImageLoad(
  event: SyntheticEvent<HTMLImageElement>,
  view: ChatMessageView,
): void {
  if (view.width && view.height) return;
  /** naturalSize 使用浏览器解码后的真实宽高。 */
  const naturalSize = getChatImageDisplaySize(
    event.currentTarget.naturalWidth,
    event.currentTarget.naturalHeight,
  );
  event.currentTarget.style.width = `${naturalSize.width}px`;
  event.currentTarget.style.height = `${naturalSize.height}px`;
}

/** 图片加载失败时依次尝试原图和 OSS JPEG 投影。 */
function handleChatImageError(
  event: SyntheticEvent<HTMLImageElement>,
  previewURL: string,
  fallbackURL: string,
): void {
  /** image 是当前失败的真实 DOM 图片节点。 */
  const image = event.currentTarget;
  if (previewURL && image.currentSrc !== previewURL && image.dataset.originalAttempted !== 'true') {
    image.dataset.originalAttempted = 'true';
    image.src = previewURL;
    return;
  }
  if (fallbackURL && image.currentSrc !== fallbackURL && image.dataset.fallbackAttempted !== 'true') {
    image.dataset.fallbackAttempted = 'true';
    image.src = fallbackURL;
    return;
  }
  image.closest('.rn-chat-media-action')?.classList.add('is-load-error');
}

/** 呈现视频缩略图并把真实播放交给媒体预览 owner。 */
function ChatVideoMessageContent({ view }: ChatMediaMessageContentProps) {
  /** media 提供当前聊天页唯一预览 owner。 */
  const media = useChatMediaInteraction();
  /** playable 标记真实视频 URL 是否满足浏览器安全协议。 */
  const playable = Boolean(normalizeChatMediaURL(view.mediaURL));
  /** thumbnailURL 使用相同协议白名单，失败时呈现稳定占位背景。 */
  const thumbnailURL = normalizeChatMediaURL(view.thumbnailURL);
  return (
    <button className="rn-chat-media-action rn-chat-video-content" type="button"
      aria-label={playable ? '播放视频' : '视频不可播放'} disabled={!playable}
      onClick={() => media.openPreview(view)}>
      {thumbnailURL ? <img src={thumbnailURL} alt="" /> : <span className="rn-chat-video-placeholder" />}
      <span className="rn-chat-play-badge"><RNAssetIcon assetURL={playIconURL} /></span>
      {view.detail ? <span>{view.detail}</span> : null}
    </button>
  );
}

/** 呈现语音状态并复用页面唯一音频实例。 */
function ChatAudioMessageContent({ view, message, mine }: ChatMediaMessageContentProps) {
  /** media 提供当前聊天页唯一音频 owner。 */
  const media = useChatMediaInteraction();
  /** playable 标记当前语音是否具有真实安全地址。 */
  const playable = Boolean(normalizeChatMediaURL(view.mediaURL));
  /** active 标记唯一正在处理本条消息的音频实例。 */
  const active = media.activeAudioMessageID === getIMAudioMessageIdentity(message);
  /** played 复用 Provider 的账号会话偏好与 RN localEx 兼容判断。 */
  const played = media.isAudioPlayed(message);
  /** audioLabel 向辅助技术同步真实加载、播放和失败状态。 */
  const audioLabel = getAudioActionLabel(playable, active, media.audioState);
  return (
    <span className="rn-chat-audio-message-row">
      <button className={`rn-chat-media-action rn-chat-audio-action${active && media.audioState === 'playing' ? ' is-playing' : ''}${active && media.audioState === 'error' ? ' is-error' : ''}`}
        type="button" aria-label={audioLabel} aria-pressed={active && media.audioState === 'playing'}
        disabled={!playable} onClick={() => media.toggleAudio(message, view)}>
        <span className="rn-chat-audio-content">
          <RNAssetIcon assetURL={speakIconURL} />
          <span className="rn-chat-audio-duration">{view.detail || '0:00'}</span>
          {active && media.audioState === 'error' ? <span className="rn-chat-audio-error">播放失败</span> : null}
        </span>
      </button>
      {!mine && !played ? <span className="rn-chat-audio-unread-dot" aria-label="未播放语音" /> : null}
    </span>
  );
}

/** 根据真实音频状态生成辅助技术动作文案。 */
function getAudioActionLabel(
  playable: boolean,
  active: boolean,
  state: ReturnType<typeof useChatMediaInteraction>['audioState'],
): string {
  if (!playable) return '语音不可播放';
  if (!active) return '播放语音';
  if (state === 'playing') return '停止语音';
  if (state === 'loading') return '正在加载语音';
  if (state === 'error') return '重新播放语音';
  return '播放语音';
}

/** 呈现文件摘要并把真实预览下载交给媒体 owner。 */
function ChatFileMessageContent({ view }: ChatMediaMessageContentProps) {
  /** media 提供当前聊天页唯一文件预览 owner。 */
  const media = useChatMediaInteraction();
  /** downloadable 只在 payload 提供安全 URL 时启用预览。 */
  const downloadable = Boolean(normalizeChatMediaURL(view.mediaURL));
  return (
    <button className="rn-chat-media-action rn-chat-file-content" type="button"
      aria-label={downloadable ? `预览文件 ${view.text}` : '文件不可下载'}
      disabled={!downloadable} onClick={() => media.openPreview(view)}>
      <span className="rn-chat-file-copy">
        <strong>{view.text}</strong>
        {view.detail ? <span>{view.detail}</span> : null}
      </span>
      <span className="rn-chat-file-icon"><img src={fileIconURL} width="30" height="34" alt="" /></span>
    </button>
  );
}
