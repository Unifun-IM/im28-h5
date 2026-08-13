import { describe, expect, it } from 'vitest';
import { IMError, type WebIMRuntimeSnapshot } from '@im28/im-sdk/web';

import {
  createAuthLoginRequest,
  createAuthRegisterRequest,
  submitAuthLogin,
} from './auth-login-submission.js';

/** 创建认证成功后的最小公开 runtime snapshot。 */
function createSnapshot(userID: string): WebIMRuntimeSnapshot {
  return {
    state: 'connecting',
    userID,
    dataVersion: 0,
    relationshipVersion: 0,
    incomingCall: { phase: 'idle', call: null, revision: 0 },
  };
}

/** 创建 Gateway 未注册业务错误。 */
function createUnregisteredError(): IMError {
  return new IMError({
    code: 'GATEWAY_API_ERROR',
    message: 'account not registered',
    source: 'transport',
    cause: { code: 20002 },
  });
}

describe('auth login submission', () => {
  it('builds phone login and register requests from one form snapshot', () => {
    // input 模拟手机号 route 的同一时刻字段。
    const input = {
      mode: 'phone' as const,
      account: '13800138000',
      credential: '666666',
      phoneAreaCode: '+86',
    };
    expect(createAuthLoginRequest(input)).toEqual({
      type: 'phone',
      account: '13800138000',
      phone_area_code: '+86',
      verification_code: '666666',
    });
    expect(createAuthRegisterRequest(input)).toEqual(createAuthLoginRequest(input));
  });

  it('does not auto-register an account-password login failure', async () => {
    // registerCalls 证明账号登录没有隐藏注册分支。
    let registerCalls = 0;
    // runtime 只实现提交编排依赖的两个端口。
    const runtime = {
      login: async () => { throw new Error('wrong password'); },
      register: async () => { registerCalls += 1; return createSnapshot('unexpected'); },
    };
    // result 必须保留真实登录错误。
    const result = await submitAuthLogin({
      runtime,
      mode: 'account',
      loginRequest: { type: 'account', account: 'account01', password: 'Password1' },
      registerRequest: null,
    });
    expect(result.type).toBe('failed');
    expect(registerCalls).toBe(0);
  });

  it('registers phone only after the structured unregistered error', async () => {
    // registerRequest 捕获默认用户路径提交的真实字段。
    const registerRequest = {
      type: 'phone',
      account: '13800138000',
      phone_area_code: '+86',
      verification_code: '666666',
    } as const;
    // runtime 模拟 login 20002 后 register 成功。
    const runtime = {
      login: async () => { throw createUnregisteredError(); },
      register: async () => createSnapshot('user-new'),
    };
    await expect(submitAuthLogin({
      runtime,
      mode: 'phone',
      loginRequest: registerRequest,
      registerRequest,
    })).resolves.toEqual({ type: 'registered', userID: 'user-new' });
  });

  it('returns the original request only when register requires invite code', async () => {
    // registerRequest 包含只允许内存传递的验证码。
    const registerRequest = {
      type: 'email',
      account: 'user@example.com',
      verification_code: '666666',
    } as const;
    // runtime 模拟后端明确要求邀请码。
    const runtime = {
      login: async () => { throw createUnregisteredError(); },
      register: async () => { throw new Error('invite code required'); },
    };
    await expect(submitAuthLogin({
      runtime,
      mode: 'email',
      loginRequest: registerRequest,
      registerRequest,
    })).resolves.toEqual({
      type: 'invite-required',
      sourceMode: 'email',
      request: registerRequest,
    });
  });
});
