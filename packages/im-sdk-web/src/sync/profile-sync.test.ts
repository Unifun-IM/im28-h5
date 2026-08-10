import type { GatewayHTTPClient } from '@im28/im-sdk/web';
import { describe, expect, it, vi } from 'vitest';

import { createWebIMProfileSync } from './profile-sync.js';

/** 创建只实现 current-detail operation 的测试 Gateway client。 */
function createProfileGatewayClient(
  getCurrentUserDetail: GatewayHTTPClient['getCurrentUserDetail'],
  updateUserProfile: GatewayHTTPClient['updateUserProfile'] = async patch => ({
    user_id: 'user-me',
    ...patch,
  }),
): GatewayHTTPClient {
  return { getCurrentUserDetail, updateUserProfile } as GatewayHTTPClient;
}

describe('Web IM profile sync', () => {
  // 验证认证 facade 原样返回共享 GatewayUser contract。
  it('reads the authenticated current user profile', async () => {
    // getCurrentUserDetail 记录默认调用并返回确定性资料。
    const getCurrentUserDetail = vi.fn(async () => ({
      user_id: 'user-me',
      nickname: 'Alice',
      avatar_url: 'https://cdn.example.com/a.jpg',
    }));
    // profile 使用真实共享 client 方法而非页面数据拼装。
    const profile = createWebIMProfileSync({
      gatewayClient: createProfileGatewayClient(getCurrentUserDetail),
      getCurrentUserID: () => 'user-me',
    });

    await expect(profile.getCurrent()).resolves.toMatchObject({
      user_id: 'user-me',
      nickname: 'Alice',
    });
    expect(getCurrentUserDetail).toHaveBeenCalledOnce();
  });

  // 验证匿名读取在 Gateway 调用前 fail closed。
  it('rejects anonymous profile reads', async () => {
    // getCurrentUserDetail 不应在匿名路径触发。
    const getCurrentUserDetail = vi.fn(async () => ({ user_id: 'unexpected' }));
    // profile 绑定空认证 owner。
    const profile = createWebIMProfileSync({
      gatewayClient: createProfileGatewayClient(getCurrentUserDetail),
      getCurrentUserID: () => null,
    });

    await expect(profile.getCurrent()).rejects.toMatchObject({ code: 'PROFILE_AUTH_REQUIRED' });
    expect(getCurrentUserDetail).not.toHaveBeenCalled();
  });

  // 验证三个字段经同一个 shared update-profile operation 归一化提交。
  it('updates normalized nickname, gender and bio fields', async () => {
    // updateUserProfile 记录 facade 交给共享 Gateway client 的请求。
    const updateUserProfile = vi.fn(async patch => ({ user_id: 'user-me', ...patch }));
    // profile 使用认证 owner 和确定性 Gateway port。
    const profile = createWebIMProfileSync({
      gatewayClient: createProfileGatewayClient(async () => ({ user_id: 'user-me' }), updateUserProfile),
      getCurrentUserID: () => 'user-me',
    });

    await expect(profile.update({ nickname: ' Alice ', gender: 2, bio: ` ${'签'.repeat(105)} ` }))
      .resolves.toMatchObject({ nickname: 'Alice', gender: 2, bio: '签'.repeat(100) });
    expect(updateUserProfile).toHaveBeenCalledWith({
      nickname: 'Alice',
      gender: 2,
      bio: '签'.repeat(100),
    });
  });

  // 验证无效或匿名写入在网络前 fail closed。
  it('rejects invalid and anonymous updates before Gateway access', async () => {
    // updateUserProfile 不应接收任何无效请求。
    const updateUserProfile = vi.fn(async () => ({ user_id: 'unexpected' }));
    // authenticatedProfile 用于验证字段约束。
    const authenticatedProfile = createWebIMProfileSync({
      gatewayClient: createProfileGatewayClient(async () => ({ user_id: 'user-me' }), updateUserProfile),
      getCurrentUserID: () => 'user-me',
    });
    // anonymousProfile 用于验证认证门禁。
    const anonymousProfile = createWebIMProfileSync({
      gatewayClient: createProfileGatewayClient(async () => ({ user_id: 'user-me' }), updateUserProfile),
      getCurrentUserID: () => null,
    });

    await expect(authenticatedProfile.update({ nickname: '   ' })).rejects.toMatchObject({ code: 'PROFILE_NICKNAME_INVALID' });
    await expect(authenticatedProfile.update({})).rejects.toMatchObject({ code: 'PROFILE_UPDATE_EMPTY' });
    await expect(anonymousProfile.update({ bio: 'hello' })).rejects.toMatchObject({ code: 'PROFILE_AUTH_REQUIRED' });
    expect(updateUserProfile).not.toHaveBeenCalled();
  });
});
