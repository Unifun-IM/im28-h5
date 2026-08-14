import { describe, expect, it } from 'vitest';

import callProviderSource from './WebIMCallProvider.tsx?raw';
import callDetailSource from '../pages/calls/CallDetailPage.tsx?raw';
import contactsSource from '../pages/contacts/ContactsPage.tsx?raw';

/** 通话启动契约阻止 Gateway 失败时提前进入无凭据活动页。 */
describe('Web IM call startup contract', () => {
  /** 呼出只有在共享信令和媒体启动成功后才能提交 UI owner。 */
  it('commits active call state and route after outgoing start succeeds', () => {
    /** startIndex 固定真实呼出启动语句位置。 */
    const startIndex = callProviderSource.indexOf('await outgoing.start({');
    /** ownerIndex 固定活动通话 owner 提交位置。 */
    const ownerIndex = callProviderSource.indexOf('callOwnerRef.current = outgoing;');
    /** routeIndex 固定活动通话路由提交位置。 */
    const routeIndex = callProviderSource.indexOf("navigate('/calls/active');");
    expect(startIndex).toBeGreaterThan(-1);
    expect(ownerIndex).toBeGreaterThan(startIndex);
    expect(routeIndex).toBeGreaterThan(ownerIndex);
  });

  /** 页面入口必须用全局错误 Toast 承载启动失败，不创建内联假活动态。 */
  it('reports outgoing start failures through the shared toast host', () => {
    expect(contactsSource).toContain("toast.error(readContactActionError(cause, '发起通话失败'))");
    expect(callDetailSource).toContain('toast.error(readCallDetailError(cause))');
  });
});
