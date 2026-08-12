/** RN 图片消息最大展示边宽度。 */
const CHAT_IMAGE_MAX_WIDTH = 180;
/** RN 语音气泡最小宽度。 */
const CHAT_AUDIO_MIN_WIDTH = 88;
/** RN 语音气泡最大宽度。 */
const CHAT_AUDIO_MAX_WIDTH = 236;
/** RN 语音前段快速增长的时长边界。 */
const CHAT_AUDIO_FRONT_SECONDS = 10;
/** RN 语音前段占总宽度增长的比例。 */
const CHAT_AUDIO_FRONT_PROGRESS = 0.7;
/** RN 单条语音最大有效时长。 */
const CHAT_AUDIO_MAX_SECONDS = 60;

/** 聊天媒体确定性展示尺寸。 */
export interface ChatMediaDisplaySize {
  readonly width: number;
  readonly height: number;
}

/** 按 RN 规则限制图片宽度并保持原始宽高比。 */
export function getChatImageDisplaySize(
  width: number | undefined,
  height: number | undefined,
): ChatMediaDisplaySize {
  if (!isPositiveDimension(width) || !isPositiveDimension(height)) {
    return { width: CHAT_IMAGE_MAX_WIDTH, height: CHAT_IMAGE_MAX_WIDTH };
  }
  /** displayWidth 禁止放大小图并限制大图最大宽度。 */
  const displayWidth = Math.min(width, CHAT_IMAGE_MAX_WIDTH);
  return {
    width: Math.round(displayWidth),
    height: Math.round((displayWidth * height) / width),
  };
}

/** 按 RN 的 1-10 秒快增长、10-60 秒慢增长曲线计算语音宽度。 */
export function getChatAudioBubbleWidth(
  durationSeconds: number | undefined,
): number {
  /** duration 将缺失值收敛为最短一秒气泡。 */
  const duration = Math.max(1, Math.round(durationSeconds || 0));
  /** clampedDuration 拒绝超过协议上限的视觉外溢。 */
  const clampedDuration = Math.min(duration, CHAT_AUDIO_MAX_SECONDS);
  /** progress 与 RN 两阶段增长公式保持一致。 */
  const progress = clampedDuration <= CHAT_AUDIO_FRONT_SECONDS
    ? ((clampedDuration - 1) / (CHAT_AUDIO_FRONT_SECONDS - 1)) *
      CHAT_AUDIO_FRONT_PROGRESS
    : CHAT_AUDIO_FRONT_PROGRESS +
      ((clampedDuration - CHAT_AUDIO_FRONT_SECONDS) /
        (CHAT_AUDIO_MAX_SECONDS - CHAT_AUDIO_FRONT_SECONDS)) *
        (1 - CHAT_AUDIO_FRONT_PROGRESS);
  return Math.round(
    CHAT_AUDIO_MIN_WIDTH +
      (CHAT_AUDIO_MAX_WIDTH - CHAT_AUDIO_MIN_WIDTH) * progress,
  );
}

/** 判断媒体宽高是否为有限正数。 */
function isPositiveDimension(value: number | undefined): value is number {
  return Number.isFinite(value) && (value ?? 0) > 0;
}
