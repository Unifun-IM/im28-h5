import { describe, expect, it } from 'vitest';

import {
  createAuthOnboardingMarkerStore,
  resolveAuthOnboardingRoute,
  type AuthOnboardingStorage,
  type AuthPendingRegistration,
} from './auth-onboarding-state.js';

/** 测试隔离使用的同步内存 Storage。 */
class MemoryStorage implements AuthOnboardingStorage {
  // records 仅保存当前测试写入值。
  readonly records = new Map<string, string>();

  /** 读取单个 marker。 */
  getItem(key: string): string | null {
    return this.records.get(key) ?? null;
  }

  /** 覆盖单个 marker。 */
  setItem(key: string, value: string): void {
    this.records.set(key, value);
  }

  /** 删除单个 marker。 */
  removeItem(key: string): void {
    this.records.delete(key);
  }
}

/** 创建含验证码的内存 pending registration。 */
function createPendingRegistration(): AuthPendingRegistration {
  return {
    sourceMode: 'phone',
    request: {
      type: 'phone',
      account: '13800138000',
      phone_area_code: '+86',
      verification_code: '666666',
    },
  };
}

describe('auth onboarding state', () => {
  it('persists only account marker fields and drops extra secrets', () => {
    // storage 捕获真实序列化结果。
    const storage = new MemoryStorage();
    // store 执行生产同构读写。
    const store = createAuthOnboardingMarkerStore(storage);
    // unsafeMarker 模拟结构类型 caller 附带了不允许持久化的 secret。
    const unsafeMarker = {
      userID: ' user-1 ',
      sourceMode: 'phone' as const,
      verificationCode: '666666',
    };
    store.write(unsafeMarker);
    // serialized 证明 marker 中没有验证码、账号或 token。
    const serialized = [...storage.records.values()][0] ?? '';
    expect(JSON.parse(serialized)).toEqual({ userID: 'user-1', sourceMode: 'phone' });
    expect(serialized).not.toContain('666666');
    expect(store.read()).toEqual({ userID: 'user-1', sourceMode: 'phone' });
  });

  it('fails closed for corrupted or mismatched markers', () => {
    // storage 注入损坏 marker。
    const storage = new MemoryStorage();
    // store 负责拒绝错误结构。
    const store = createAuthOnboardingMarkerStore(storage);
    storage.setItem('im28.web.auth.onboarding', '{broken');
    expect(store.read()).toBeNull();
    store.write({ userID: 'user-1', sourceMode: 'email' });
    expect(resolveAuthOnboardingRoute({
      stage: 'complete-profile',
      userID: 'user-2',
      marker: store.read(),
      pendingRegistration: null,
      sourceMode: 'email',
    })).toEqual({ allow: false, redirectTo: '/conversations' });
  });

  it('allows invite only while the memory pending request exists', () => {
    // pendingRegistration 模拟同一 React 树内尚未丢失的验证码。
    const pendingRegistration = createPendingRegistration();
    expect(resolveAuthOnboardingRoute({
      stage: 'invite',
      userID: null,
      marker: null,
      pendingRegistration,
      sourceMode: 'phone',
    })).toEqual({ allow: true });
    expect(resolveAuthOnboardingRoute({
      stage: 'invite',
      userID: null,
      marker: null,
      pendingRegistration: null,
      sourceMode: 'email',
    })).toEqual({ allow: false, redirectTo: '/auth/email' });
  });

  it('allows complete profile only for the authenticated marker account', () => {
    // marker 表示注册成功且尚未完成 onboarding 的账号。
    const marker = { userID: 'user-1', sourceMode: 'account' } as const;
    expect(resolveAuthOnboardingRoute({
      stage: 'complete-profile',
      userID: 'user-1',
      marker,
      pendingRegistration: null,
      sourceMode: 'account',
    })).toEqual({ allow: true });
    expect(resolveAuthOnboardingRoute({
      stage: 'complete-profile',
      userID: null,
      marker,
      pendingRegistration: null,
      sourceMode: 'account',
    })).toEqual({ allow: false, redirectTo: '/auth/phone' });
  });
});
