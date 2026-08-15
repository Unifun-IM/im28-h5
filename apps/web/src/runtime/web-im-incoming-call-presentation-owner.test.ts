import { describe, expect, it } from 'vitest';

import callProviderSource from './WebIMCallProvider.tsx?raw';
import presentationOwnerSource from './useWebIMIncomingCallPresentation.ts?raw';

/** 来电表现合同阻止提示音、资料恢复与媒体生命周期再次混写。 */
describe('Web IM incoming call presentation owner', () => {
  /** Provider 只消费来电表现 owner，不再直接创建提示音或恢复资料。 */
  it('keeps ringtone and profile presentation out of the call provider', () => {
    expect(callProviderSource).toContain('useWebIMIncomingCallPresentation({');
    expect(callProviderSource).not.toContain('createWebCallToneController');
    expect(callProviderSource).not.toContain('peerProfile.get');
    expect(callProviderSource).not.toContain("document.addEventListener('visibilitychange'");
  });

  /** 表现 owner 独占浏览器提示职责，但不得创建媒体或改变 SPA route。 */
  it('owns presentation without becoming a second call runtime', () => {
    expect(presentationOwnerSource).toContain('createWebCallToneController');
    expect(presentationOwnerSource).toContain('peerProfile.get');
    expect(presentationOwnerSource).toContain("document.addEventListener('visibilitychange'");
    expect(presentationOwnerSource).not.toContain('createWebIMIncomingCall');
    expect(presentationOwnerSource).not.toContain('createLiveKitCallMediaPort');
    expect(presentationOwnerSource).not.toContain('navigate(');
  });
});
