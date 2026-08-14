import type { CSSProperties } from 'react';
import { getIMAudioMessageIdentity, type Message } from '@im28/im-sdk/web';

import fileIconURL from '../../assets/rn/assets/icons/imm28/doc.svg';
import playIconURL from '../../assets/rn/assets/icons/imm28/play.solid.svg';
import phoneDisabledIconURL from '../../assets/rn/assets/icons/imm28/phone-disabled.dynamic.svg';
import phoneOutIconURL from '../../assets/rn/assets/icons/imm28/phone-out.dynamic.svg';
import speakIconURL from '../../assets/rn/assets/icons/imm28/speak.svg';
import videoCameraIconURL from '../../assets/rn/assets/icons/imm28/video-camera.dynamic.svg';
import videoCameraOffIconURL from '../../assets/rn/assets/icons/imm28/video-camera-off.dynamic.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import {
  getRNAvatarGradient,
  getRNAvatarInitial,
} from '../../components/rn-avatar-view.js';
import { ChatCustomEmojiMessageContent } from './ChatCustomEmojiMessageContent.js';
import { useChatMediaInteraction } from './ChatMediaInteractionProvider.js';
import type { ChatMessageView } from './chat-message-view.js';
import type { ChatQuoteSourceView } from './chat-quote-view.js';
import {
  getChatImageDisplayURL,
  normalizeChatMediaURL,
} from './chat-media-view.js';
import { getChatImageDisplaySize } from './chat-media-layout.js';
import {
  isSinglePresetEmojiText,
  PresetEmojiTextContent,
} from './PresetEmojiTextContent.js';
import './chat-message-content.css';

/** 消息正文接收已收窄的展示模型和显式动作。 */
interface ChatMessageContentProps {
  readonly view: ChatMessageView;
  readonly message: Message;
  readonly mine: boolean;
  readonly quoteSource: ChatQuoteSourceView | null;
  readonly onOpenQuotedMessage: (message: Message) => void;
  readonly onCopyLink: (url: string) => Promise<boolean>;
  readonly onStartCall?: (mediaType: 'audio' | 'video') => void;
  readonly onOpenCard?: (view: ChatMessageView) => void;
}

/** 根据展示模型呈现文本、媒体、文件、名片和表情内容。 */
export function ChatMessageContent({
  view,
  message,
  mine,
  quoteSource,
  onOpenQuotedMessage,
  onCopyLink,
  onStartCall,
  onOpenCard,
}: ChatMessageContentProps) {
  // media 提供当前聊天页唯一的预览和音频 owner。
  const media = useChatMediaInteraction();
  if (view.kind === 'call') {
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
  if (view.kind === 'image') {
    // imageURL 保持缩略图展示，同时拒绝不安全协议。
    const imageURL = normalizeChatMediaURL(view.thumbnailURL || view.mediaURL);
    /** imageSize 按 Gateway 原始宽高复刻 RN 的 180px 比例缩放。 */
    const imageSize = getChatImageDisplaySize(view.width, view.height);
    /** previewURL 在缩略图失败时提供原图回退。 */
    const previewURL = normalizeChatMediaURL(view.mediaURL || view.thumbnailURL);
    /** fallbackURL 只在缩略图与原图都无法解码时转换权威原图。 */
    const fallbackURL = getChatImageDisplayURL(previewURL || imageURL);
    return imageURL ? (
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
          onLoad={event => {
            /** image 在历史消息缺少元数据时使用浏览器解码的真实宽高。 */
            if (view.width && view.height) return;
            /** naturalSize 补偿早期消息未持久化 width/height 的情况。 */
            const naturalSize = getChatImageDisplaySize(
              event.currentTarget.naturalWidth,
              event.currentTarget.naturalHeight,
            );
            event.currentTarget.style.width = `${naturalSize.width}px`;
            event.currentTarget.style.height = `${naturalSize.height}px`;
          }}
          onError={event => {
            /** image 先尝试同消息原图，再尝试 OSS JPEG 解码回退。 */
            const image = event.currentTarget;
            if (
              previewURL &&
              image.currentSrc !== previewURL &&
              image.dataset.originalAttempted !== 'true'
            ) {
              image.dataset.originalAttempted = 'true';
              image.src = previewURL;
              return;
            }
            if (
              fallbackURL &&
              image.currentSrc !== fallbackURL &&
              image.dataset.fallbackAttempted !== 'true'
            ) {
              image.dataset.fallbackAttempted = 'true';
              image.src = fallbackURL;
              return;
            }
            image.closest('.rn-chat-media-action')?.classList.add('is-load-error');
          }}
        />
        <span className="rn-chat-media-load-error">图片加载失败</span>
      </button>
    ) : (
      <span className="rn-chat-message-text">{view.text}</span>
    );
  }
  if (view.kind === 'video') {
    // playable 标记真实视频 URL 是否满足浏览器安全协议。
    const playable = Boolean(normalizeChatMediaURL(view.mediaURL));
    // thumbnailURL 使用相同协议白名单，失败时呈现稳定占位背景。
    const thumbnailURL = normalizeChatMediaURL(view.thumbnailURL);
    return (
      <button
        className="rn-chat-media-action rn-chat-video-content"
        type="button"
        aria-label={playable ? '播放视频' : '视频不可播放'}
        disabled={!playable}
        onClick={() => media.openPreview(view)}
      >
        {thumbnailURL ? <img src={thumbnailURL} alt="" /> : <span className="rn-chat-video-placeholder" />}
        <span className="rn-chat-play-badge"><RNAssetIcon assetURL={playIconURL} /></span>
        {view.detail ? <span>{view.detail}</span> : null}
      </button>
    );
  }
  if (view.kind === 'audio') {
    // playable 标记当前语音是否具有真实安全地址。
    const playable = Boolean(normalizeChatMediaURL(view.mediaURL));
    // active 标记唯一正在处理本条消息的音频实例。
    const active = media.activeAudioMessageID === getIMAudioMessageIdentity(message);
    // played 复用 Provider 的账号会话偏好与 RN localEx 兼容判断。
    const played = media.isAudioPlayed(message);
    // audioLabel 向辅助技术同步真实加载、播放和失败状态。
    const audioLabel = getAudioActionLabel(playable, active, media.audioState);
    return (
      <span className="rn-chat-audio-message-row">
        <button
        className={`rn-chat-media-action rn-chat-audio-action${active && media.audioState === 'playing' ? ' is-playing' : ''}${active && media.audioState === 'error' ? ' is-error' : ''}`}
        type="button"
        aria-label={audioLabel}
        aria-pressed={active && media.audioState === 'playing'}
        disabled={!playable}
        onClick={() => media.toggleAudio(message, view)}
      >
        <span className="rn-chat-audio-content">
          <RNAssetIcon assetURL={speakIconURL} />
          <span className="rn-chat-audio-duration">{view.detail || '0:00'}</span>
          {active && media.audioState === 'error' ? <span className="rn-chat-audio-error">播放失败</span> : null}
        </span>
        </button>
        {!mine && !played ? (
          <span className="rn-chat-audio-unread-dot" aria-label="未播放语音" />
        ) : null}
      </span>
    );
  }
  if (view.kind === 'file') {
    // downloadable 只在 payload 提供安全 URL 时启用预览。
    const downloadable = Boolean(normalizeChatMediaURL(view.mediaURL));
    return (
      <button
        className="rn-chat-media-action rn-chat-file-content"
        type="button"
        aria-label={downloadable ? `预览文件 ${view.text}` : '文件不可下载'}
        disabled={!downloadable}
        onClick={() => media.openPreview(view)}
      >
        <span className="rn-chat-file-copy">
          <strong>{view.text}</strong>
          {view.detail ? <span>{view.detail}</span> : null}
        </span>
        <span className="rn-chat-file-icon"><img src={fileIconURL} width="30" height="34" alt="" /></span>
      </button>
    );
  }
  if (view.kind === 'card') {
    return <ChatCardContent view={view} {...(onOpenCard ? { onOpen: onOpenCard } : {})} />;
  }
  if (view.kind === 'emoji') return <ChatCustomEmojiMessageContent view={view} />;
  if (view.kind === 'quote') {
    // sourceText 优先显示当前缓存来源，窗口外回退发送时快照。
    const sourceText = quoteSource?.text || view.detail || '引用消息';
    // sourceLabel 仅在真实来源已解析时展示，禁止猜测发送者。
    const sourceLabel = quoteSource?.label ? `${quoteSource.label}: ` : '';
    return (
      <>
        <button
          className={`rn-chat-quote${mine ? ' is-mine' : ''}`}
          type="button"
          disabled={!quoteSource?.message || quoteSource.deleted}
          onClick={() => {
            if (quoteSource?.message && !quoteSource.deleted) {
              onOpenQuotedMessage(quoteSource.message);
            }
          }}
        >
          {sourceLabel}{sourceText}
        </button>
        <span className="rn-chat-message-text">{view.text}</span>
      </>
    );
  }
  if (view.kind === 'text') {
    // largeEmoji 只在一个合法实体完整覆盖正文时生效。
    const largeEmoji = isSinglePresetEmojiText(view.text, view.entities);
    return (
      <>
        <PresetEmojiTextContent
          text={view.text}
          entities={view.entities}
          className="rn-chat-message-text"
          largeEmoji={largeEmoji}
          onCopyLink={onCopyLink}
        />
      </>
    );
  }
  return (
    <>
      {view.detail ? <span className={`rn-chat-quote${mine ? ' is-mine' : ''}`}>{view.detail}</span> : null}
      <span className={`rn-chat-message-text${view.kind === 'unsupported' ? ' is-unsupported' : ''}`}>{view.text}</span>
    </>
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

/** 使用真实身份快照呈现用户或群名片。 */
function ChatCardContent({
  view,
  onOpen,
}: {
  readonly view: ChatMessageView;
  readonly onOpen?: (view: ChatMessageView) => void;
}) {
  // avatarStyle 以真实卡片身份生成无图片时的 RN fallback。
  const avatarStyle = {
    '--chat-card-avatar-gradient': getRNAvatarGradient(view.detail || view.text),
  } as CSSProperties;
  return (
    <button
      className="rn-chat-card-content"
      type="button"
      aria-label={view.cardKind === 'group'
        ? `查看${view.text}的群聊卡片`
        : `查看${view.text}的个人资料`}
      disabled={!view.cardTargetID || !onOpen}
      onClick={() => onOpen?.(view)}
    >
      <span className="rn-chat-card-avatar" style={avatarStyle}>
        {getRNAvatarInitial(view.text)}
        {view.mediaURL ? <img src={view.mediaURL} alt="" /> : null}
      </span>
      <span><strong>{view.text}</strong>{view.detail ? <small>{view.detail}</small> : null}</span>
    </button>
  );
}
