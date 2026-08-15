import { describe, expect, it } from 'vitest';

import callContextSource from './WebIMCallContext.ts?raw';
import callProviderSource from './WebIMCallProvider.tsx?raw';
import runtimeIndexSource from './index.ts?raw';
import callDetailSource from '../pages/calls/CallDetailPage.tsx?raw';

/** 通话 Context 合同阻止公共消费契约再次与媒体生命周期混写。 */
describe('Web IM call context owner', () => {
  /** Context owner 独占公共类型、Context 实例和消费 Hook。 */
  it('owns the public call contract and hook', () => {
    expect(callContextSource).toContain('createContext<WebIMCallContextValue | null>');
    expect(callContextSource).toContain('export function useWebIMCall');
    expect(callContextSource).toContain('export interface WebIMCallContextValue');
    expect(callContextSource).not.toContain('createWebIMOutgoingCall');
    expect(callContextSource).not.toContain('createLiveKitCallMediaPort');
  });

  /** Provider 只装配 Context，不再声明第二份公共契约或消费 Hook。 */
  it('keeps the provider focused on call lifecycle', () => {
    expect(callProviderSource).toContain('<WebIMCallContext.Provider value={value}>');
    expect(callProviderSource).not.toContain('createContext');
    expect(callProviderSource).not.toContain('useContext');
    expect(callProviderSource).not.toContain('export interface WebIMCallContextValue');
    expect(callProviderSource).not.toContain('export function useWebIMCall');
  });

  /** 邻近 facade 是页面消费通话 Context 的唯一公开入口。 */
  it('exports the context contract through the runtime facade', () => {
    expect(runtimeIndexSource).toContain("from './WebIMCallContext.js'");
    expect(callDetailSource).toContain("from '../../runtime/index.js'");
    expect(callDetailSource).not.toContain("from '../../runtime/WebIMCallProvider.js'");
  });
});
