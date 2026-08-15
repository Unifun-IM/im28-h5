import { describe, expect, it } from 'vitest';

import callProviderSource from './WebIMCallProvider.tsx?raw';
import outgoingStartupSource from './useWebIMOutgoingCallStartup.ts?raw';
import callDetailSource from '../pages/calls/CallDetailPage.tsx?raw';
import contactsActionsSource from '../pages/contacts/useContactsPageActions.ts?raw';

/** 通话启动契约阻止 Gateway 失败时提前进入无凭据活动页。 */
describe('Web IM call startup contract', () => {
  /** 呼出只有在共享信令和媒体启动成功后才能提交 UI owner。 */
  it('commits active call state and route after outgoing start succeeds', () => {
    /** startIndex 固定真实呼出启动语句位置。 */
    const startIndex = outgoingStartupSource.indexOf('await outgoing.start({');
    /** ownerIndex 固定活动通话 owner 提交位置。 */
    const ownerIndex = outgoingStartupSource.indexOf('callOwnerRef.current = outgoing;');
    /** routeIndex 固定活动通话路由提交位置。 */
    const routeIndex = outgoingStartupSource.indexOf("navigate('/calls/active');");
    expect(startIndex).toBeGreaterThan(-1);
    expect(ownerIndex).toBeGreaterThan(startIndex);
    expect(routeIndex).toBeGreaterThan(ownerIndex);
  });

  /** Provider 只能组合唯一呼出 owner，不得保留第二条 SDK 创建路径。 */
  it('keeps outgoing construction in the dedicated startup owner', () => {
    expect(callProviderSource).toContain('useWebIMOutgoingCallStartup({');
    expect(callProviderSource).not.toContain('createWebIMOutgoingCall');
    expect(callProviderSource).not.toContain('await outgoing.start({');
    expect(outgoingStartupSource).toContain('createWebIMCallMediaSession(mediaPort)');
    expect(outgoingStartupSource).toContain('startVersionRef.current !== startVersion');
  });

  /** 页面入口必须用全局错误 Toast 承载启动失败，不创建内联假活动态。 */
  it('reports outgoing start failures through the shared toast host', () => {
    expect(contactsActionsSource).toContain(
      "toast.error(readContactActionError(cause, '发起通话失败'))",
    );
    expect(callDetailSource).toContain('toast.error(readCallDetailError(cause))');
  });
});
