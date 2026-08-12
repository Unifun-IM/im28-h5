/** 浏览器铃声元素只暴露通话提示音所需的最小能力。 */
export interface WebCallToneAudio {
  loop: boolean;
  currentTime: number;
  play(): Promise<void>;
  pause(): void;
}

/** 注入 Audio 构造与定时器，保证自动播放策略可独立验证。 */
export interface WebCallToneDependencies {
  createAudio(sourceURL: string): WebCallToneAudio;
  setTimeout(callback: () => void, delayMs: number): ReturnType<typeof setTimeout>;
  clearTimeout(timer: ReturnType<typeof setTimeout>): void;
}

/** H5 全局来电 Provider 消费的提示音控制器。 */
export interface WebCallToneController {
  startCalling(): Promise<boolean>;
  resumeCalling(): Promise<boolean>;
  stopCalling(): void;
  playHangup(): Promise<void>;
  dispose(): void;
}

/** 挂断提示音与 RN 保持一秒上限，避免浏览器后台长时间占用。 */
const HANGUP_TONE_DURATION_MS = 1000;

/** 创建浏览器提示音控制器，播放失败以 blocked 返回而不阻塞信令。 */
export function createWebCallToneController(
  callingToneURL: string,
  hangupToneURL: string,
  dependencies: WebCallToneDependencies = createBrowserToneDependencies(),
): WebCallToneController {
  /** callingAudio 复用唯一循环来电音元素。 */
  const callingAudio = dependencies.createAudio(callingToneURL);
  /** hangupAudio 复用唯一短挂断音元素。 */
  const hangupAudio = dependencies.createAudio(hangupToneURL);
  /** hangupTimer 限制挂断音最长播放时间。 */
  let hangupTimer: ReturnType<typeof setTimeout> | null = null;
  callingAudio.loop = true;
  hangupAudio.loop = false;

  /** 停止并重置指定音频元素。 */
  const resetAudio = (audio: WebCallToneAudio): void => {
    audio.pause();
    audio.currentTime = 0;
  };

  /** 清除挂断音停止计时器。 */
  const clearHangupTimer = (): void => {
    if (!hangupTimer) return;
    dependencies.clearTimeout(hangupTimer);
    hangupTimer = null;
  };

  /** 尝试播放来电音，false 表示浏览器要求用户手势恢复。 */
  const playCalling = async (): Promise<boolean> => {
    clearHangupTimer();
    resetAudio(hangupAudio);
    try {
      await callingAudio.play();
      return true;
    } catch {
      return false;
    }
  };

  /** 停止来电循环但不影响后续用户手势重试。 */
  const stopCalling = (): void => {
    resetAudio(callingAudio);
  };

  /** 播放挂断短音，失败时保持静默且不回滚拒绝动作。 */
  const playHangup = async (): Promise<void> => {
    stopCalling();
    clearHangupTimer();
    resetAudio(hangupAudio);
    try {
      await hangupAudio.play();
      hangupTimer = dependencies.setTimeout(() => {
        resetAudio(hangupAudio);
        hangupTimer = null;
      }, HANGUP_TONE_DURATION_MS);
    } catch {
      resetAudio(hangupAudio);
    }
  };

  /** 释放所有音频和定时器。 */
  const dispose = (): void => {
    clearHangupTimer();
    resetAudio(callingAudio);
    resetAudio(hangupAudio);
  };

  return {
    startCalling: playCalling,
    resumeCalling: playCalling,
    stopCalling,
    playHangup,
    dispose,
  };
}

/** 映射真实浏览器 Audio 与 window timer。 */
function createBrowserToneDependencies(): WebCallToneDependencies {
  return {
    createAudio: sourceURL => new Audio(sourceURL),
    setTimeout: (callback, delayMs) => window.setTimeout(callback, delayMs),
    clearTimeout: timer => window.clearTimeout(timer),
  };
}
