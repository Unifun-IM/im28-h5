import { describe, expect, it } from 'vitest';

import callProviderSource from './WebIMCallProvider.tsx?raw';
import terminalOwnerSource from './useWebIMCallRemoteTerminal.ts?raw';

/** 远端终态合同阻止信令订阅与 Provider 生命周期再次混写。 */
describe('Web IM remote terminal owner', () => {
  /** 唯一 Hook 必须按当前 call ID 和终态白名单消费信令。 */
  it('owns matching of terminal signals for the active call', () => {
    expect(terminalOwnerSource).toContain('TERMINAL_CALL_SIGNAL_KEYS');
    expect(terminalOwnerSource).toContain('runtime.subscribeCallSignals');
    expect(terminalOwnerSource).toContain('signal.callID === callID');
    expect(terminalOwnerSource).toContain('TERMINAL_CALL_SIGNAL_KEYS.has(signal.key)');
  });

  /** 远端终态处理必须保持媒体、提示音、清理和返回顺序。 */
  it('preserves the remote terminal lifecycle order', () => {
    /** terminalIndex 固定 SDK owner 接收终态的位置。 */
    const terminalIndex = terminalOwnerSource.indexOf('owner.handleRemoteTerminal()');
    /** toneIndex 固定挂断提示音位置。 */
    const toneIndex = terminalOwnerSource.indexOf('.then(() => playHangupTone())');
    /** disposeIndex 固定活动 owner 清理位置。 */
    const disposeIndex = terminalOwnerSource.indexOf('.then(() => disposeCurrent())');
    /** navigateIndex 固定返回来源会话位置。 */
    const navigateIndex = terminalOwnerSource.indexOf('.then(() => navigate(');
    expect(terminalIndex).toBeGreaterThan(-1);
    expect(toneIndex).toBeGreaterThan(terminalIndex);
    expect(disposeIndex).toBeGreaterThan(toneIndex);
    expect(navigateIndex).toBeGreaterThan(disposeIndex);
  });

  /** Provider 只装配唯一 Hook，不保留第二套信令订阅。 */
  it('removes the inline terminal subscriber from the provider', () => {
    expect(callProviderSource).toContain('useWebIMCallRemoteTerminal({');
    expect(callProviderSource).not.toContain('subscribeCallSignals');
    expect(callProviderSource).not.toContain('terminalKeys');
    expect(terminalOwnerSource).not.toContain('createWebIMIncomingCall');
    expect(terminalOwnerSource).not.toContain('createLiveKitCallMediaPort');
  });
});
