import { describe, expect, it } from 'vitest';

import { transitionWebIMRuntimeState } from './runtime-lifecycle.js';

// Web IM runtime 状态转换的纯逻辑测试集合。
describe('Web IM runtime lifecycle', () => {
  // 验证认证、连接、断线重连和退出的完整合法路径。
  it('transitions through the authenticated realtime lifecycle', () => {
    // 可变状态模拟 orchestrator 逐个派发 runtime 事件。
    let state = transitionWebIMRuntimeState('anonymous', 'auth_started');
    expect(state).toBe('authenticating');
    state = transitionWebIMRuntimeState(state, 'auth_succeeded');
    expect(state).toBe('authenticated');
    state = transitionWebIMRuntimeState(state, 'realtime_connecting');
    expect(state).toBe('connecting');
    state = transitionWebIMRuntimeState(state, 'realtime_connected');
    expect(state).toBe('online');
    state = transitionWebIMRuntimeState(state, 'realtime_disconnected');
    expect(state).toBe('reconnecting');
    state = transitionWebIMRuntimeState(state, 'realtime_connected');
    expect(state).toBe('online');
    state = transitionWebIMRuntimeState(state, 'signed_out');
    expect(state).toBe('anonymous');
  });

  // 验证 token 失效会把连接态强制收敛到匿名态。
  it('returns to anonymous when a realtime token expires', () => {
    expect(transitionWebIMRuntimeState('online', 'token_expired')).toBe(
      'anonymous',
    );
  });

  // 验证 runtime 不能绕过认证直接报告在线。
  it('rejects invalid lifecycle transitions', () => {
    expect(() =>
      transitionWebIMRuntimeState('anonymous', 'realtime_connected'),
    ).toThrowError(
      expect.objectContaining({ code: 'INVALID_LIFECYCLE_TRANSITION' }),
    );
  });
});
