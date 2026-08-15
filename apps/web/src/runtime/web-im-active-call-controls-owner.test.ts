import { describe, expect, it } from 'vitest';

import callProviderSource from './WebIMCallProvider.tsx?raw';
import activeControlsSource from './useWebIMActiveCallControls.ts?raw';

/** 活动通话控制合同阻止清理顺序漂移或 Provider 恢复第二实现。 */
describe('Web IM active call controls owner', () => {
  /** dispose 必须先隔离旧 owner，再清空公开状态，最后释放 SDK owner。 */
  it('preserves active owner disposal order', () => {
    /** captureIndex 固定旧 owner 捕获位置。 */
    const captureIndex = activeControlsSource.indexOf('const owner = options.callOwnerRef.current;');
    /** detachIndex 固定全局 owner 摘除位置。 */
    const detachIndex = activeControlsSource.indexOf('options.callOwnerRef.current = null;');
    /** stateIndex 固定公开活动状态清空位置。 */
    const stateIndex = activeControlsSource.indexOf('setActiveCall(null);');
    /** disposeIndex 固定 SDK owner 最终释放位置。 */
    const disposeIndex = activeControlsSource.indexOf('if (owner) await owner.dispose();');
    expect(captureIndex).toBeGreaterThan(-1);
    expect(detachIndex).toBeGreaterThan(captureIndex);
    expect(stateIndex).toBeGreaterThan(detachIndex);
    expect(disposeIndex).toBeGreaterThan(stateIndex);
  });

  /** 结束通话必须先固定来源，再清理 owner，最后 replace 返回。 */
  it('returns to the captured conversation after disposal', () => {
    /** captureIndex 固定来源会话捕获位置。 */
    const captureIndex = activeControlsSource.indexOf("const returnConversationID = options.activeCall?.conversationID ?? '';");
    /** disposeIndex 固定完整清理调用位置。 */
    const disposeIndex = activeControlsSource.indexOf('await disposeCurrent();');
    /** routeIndex 固定返回路由提交位置。 */
    const routeIndex = activeControlsSource.indexOf('navigate(returnConversationID');
    expect(captureIndex).toBeGreaterThan(-1);
    expect(disposeIndex).toBeGreaterThan(captureIndex);
    expect(routeIndex).toBeGreaterThan(disposeIndex);
  });

  /** Provider 只消费控制面，不得保留清理和操作第二 owner。 */
  it('keeps active controls out of the provider', () => {
    expect(callProviderSource).toContain('useWebIMActiveCallControls({');
    expect(callProviderSource).not.toContain('const disposeCurrent = useCallback');
    expect(callProviderSource).not.toContain('const runActiveCall = useCallback');
    expect(activeControlsSource).not.toContain('createWebIMIncomingCall');
    expect(activeControlsSource).not.toContain('createWebIMOutgoingCall');
  });
});
