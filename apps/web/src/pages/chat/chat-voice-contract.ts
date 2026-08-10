/** RN 录音过短门槛使用毫秒精确判断。 */
export const CHAT_VOICE_MIN_DURATION_MS = 2_000;
/** RN 语音在 60 秒自动结束并发送。 */
export const CHAT_VOICE_MAX_DURATION_MS = 60_000;
/** RN 上滑至少 56px 才进入取消态。 */
export const CHAT_VOICE_CANCEL_DISTANCE_PX = 56;

/** 判断 pointer 纵向移动是否达到 RN 取消门槛。 */
export function shouldCancelChatVoiceGesture(
  startY: number,
  currentY: number,
): boolean {
  return startY - currentY >= CHAT_VOICE_CANCEL_DISTANCE_PX;
}

/** 判断真实录音时间是否低于 RN 可发送门槛。 */
export function isChatVoiceRecordingTooShort(
  startedAt: number,
  endedAt: number,
): boolean {
  return endedAt - startedAt < CHAT_VOICE_MIN_DURATION_MS;
}
