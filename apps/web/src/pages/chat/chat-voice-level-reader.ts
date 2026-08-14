/** 浏览器音量采样器只向 UI 暴露归一化电平和释放动作。 */
export interface ChatVoiceLevelReader {
  read(): number;
  dispose(): void;
}

/** 不支持 Web Audio 时保持稳定静音电平，不伪造录音动效。 */
export const SILENT_CHAT_VOICE_LEVEL_READER: ChatVoiceLevelReader = {
  read: () => 0,
  dispose: () => undefined,
};

/** 使用 Web Audio analyser 读取真实麦克风 RMS 音量。 */
export function createBrowserChatVoiceLevelReader(
  stream: unknown,
): ChatVoiceLevelReader {
  try {
    /** webkitAudioContext 兼容仍未暴露标准构造器的 Safari。 */
    const AudioContextConstructor = globalThis.AudioContext ??
      Reflect.get(globalThis, 'webkitAudioContext') as typeof AudioContext | undefined;
    if (!AudioContextConstructor) return SILENT_CHAT_VOICE_LEVEL_READER;
    /** audioContext 只服务当前录音会话的实时电平。 */
    const audioContext = new AudioContextConstructor();
    /** analyser 提供低成本时域样本，不参与录音文件编码。 */
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    /** source 把当前麦克风流接入 analyser，但不连接扬声器。 */
    const source = audioContext.createMediaStreamSource(stream as MediaStream);
    source.connect(analyser);
    /** samples 在每次 UI tick 内复用，避免持续分配数组。 */
    const samples = new Uint8Array(analyser.fftSize);
    return {
      read: () => {
        analyser.getByteTimeDomainData(samples);
        /** sumSquares 累计以 128 为静音中心的归一化振幅平方。 */
        let sumSquares = 0;
        for (const sample of samples) {
          /** amplitude 是当前样本的 -1..1 波形振幅。 */
          const amplitude = (sample - 128) / 128;
          sumSquares += amplitude * amplitude;
        }
        /** rms 乘以经验增益后收敛为 HUD 使用的 0..1 电平。 */
        const rms = Math.sqrt(sumSquares / samples.length);
        return Math.min(1, Math.max(0, rms * 4));
      },
      dispose: () => {
        source.disconnect();
        void audioContext.close().catch(() => undefined);
      },
    };
  } catch {
    return SILENT_CHAT_VOICE_LEVEL_READER;
  }
}

/** 防御平台采样异常并将电平约束到 0..1。 */
export function readChatVoiceLevel(reader: ChatVoiceLevelReader): number {
  try {
    /** level 是平台读数的有限数值投影。 */
    const level = reader.read();
    return Number.isFinite(level) ? Math.min(1, Math.max(0, level)) : 0;
  } catch {
    return 0;
  }
}

/** 释放音量采样器且不让浏览器 cleanup 异常遮蔽录音终态。 */
export function disposeChatVoiceLevelReader(reader: ChatVoiceLevelReader): void {
  try {
    reader.dispose();
  } catch {
    // Web Audio cleanup 是 best effort，媒体流仍由 recorder 终态释放。
  }
}
