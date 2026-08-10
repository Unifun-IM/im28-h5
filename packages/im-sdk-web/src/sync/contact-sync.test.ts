import type { GatewayHTTPClient, GatewayListFriendsRequest } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import { createWebIMContactSync } from './contact-sync.js';

/** 创建只实现好友列表 operation 的测试 Gateway client。 */
function createContactGatewayClient(
  listFriends: GatewayHTTPClient['listFriends'],
): GatewayHTTPClient {
  return { listFriends } as GatewayHTTPClient;
}

// 通讯录 facade 的 contract/behavior 回归。
describe('Web IM contact sync', () => {
  // 分页结果必须去重、归一化，并按好友添加时间倒序返回。
  it('lists all normalized contacts through the shared Gateway operation', async () => {
    // requests 记录分页参数，证明 facade 没有绕过共享 client。
    const requests: GatewayListFriendsRequest[] = [];
    // gatewayClient 返回两页含重复好友的确定性结果。
    const gatewayClient = createContactGatewayClient(async params => {
      // request 对齐共享 contract 允许省略 params 的签名。
      const request = params ?? {};
      requests.push(request);
      return request.page === 1
        ? {
            friends: [
              {
                friend_user_id: 'u-old',
                alias: '老朋友',
                created_at: '2025-01-01T00:00:00Z',
                user: { user_id: 'u-old', nickname: '原昵称' },
              },
              {
                friend_user_id: 'u-new',
                is_starred: true,
                created_at: '2026-01-01T00:00:00Z',
                user: { user_id: 'u-new', nickname: '新朋友', avatar_url: 'https://img.test/u-new.png' },
              },
            ],
            total: 3,
          }
        : {
            friends: [
              { friend_user_id: 'u-old', user: { user_id: 'u-old' } },
              { friend_user_id: 'u-third', user: { user_id: 'u-third', account: 'account-third' } },
            ],
            total: 3,
          };
    });
    // contacts 绑定认证用户并以 2 条 page size 拉取。
    const contacts = await createWebIMContactSync({
      gatewayClient,
      getCurrentUserID: () => 'current-user',
    }).list({ pageSize: 2 });

    expect(requests).toEqual([{ page: 1, page_size: 2 }, { page: 2, page_size: 2 }]);
    expect(contacts).toEqual([
      {
        userID: 'u-new',
        displayName: '新朋友',
        nickname: '新朋友',
        remark: '',
        avatarURL: 'https://img.test/u-new.png',
        isStarred: true,
        addedAt: '2026-01-01T00:00:00Z',
      },
      {
        userID: 'u-old',
        displayName: '老朋友',
        nickname: '原昵称',
        remark: '老朋友',
        avatarURL: '',
        isStarred: false,
        addedAt: '2025-01-01T00:00:00Z',
      },
      {
        userID: 'u-third',
        displayName: 'account-third',
        nickname: '',
        remark: '',
        avatarURL: '',
        isStarred: false,
        addedAt: '',
      },
    ]);
  });

  // 匿名调用必须在网络请求前失败，不能返回空列表伪装成功。
  it('rejects anonymous contact reads before Gateway access', async () => {
    // requestCount 证明匿名分支没有触发远端 operation。
    let requestCount = 0;
    // gatewayClient 仅用于检测误调用。
    const gatewayClient = createContactGatewayClient(async () => {
      requestCount += 1;
      return { friends: [] };
    });
    // contacts 使用空认证 owner。
    const contacts = createWebIMContactSync({
      gatewayClient,
      getCurrentUserID: () => null,
    });

    await expect(contacts.list()).rejects.toMatchObject({ code: 'CONTACT_AUTH_REQUIRED' });
    expect(requestCount).toBe(0);
  });
});
