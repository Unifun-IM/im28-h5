import type { WebIMFriendApplication } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import {
  buildFriendApplicationEntries,
  canAcceptFriendApplication,
  getFriendApplicationMessageText,
  getFriendApplicationSourceText,
  getFriendApplicationStatusText,
} from './friend-application-view.js';

/** 创建字段完整的好友申请 fixture。 */
function createApplication(
  overrides: Partial<WebIMFriendApplication> = {},
): WebIMFriendApplication {
  return {
    applicationID: 'app-1', requesterID: 'u-1', targetID: 'self', direction: 'incoming',
    userID: 'u-1', displayName: '用户一', avatarURL: '', message: '', sourceType: 'user_id',
    status: 'pending', isRead: false, createdAt: '2026-08-09T00:00:00+08:00', handledAt: '',
    ...overrides,
  };
}

// 好友申请页面纯展示规则回归。
describe('friend application view', () => {
  it('按可见字段搜索并生成日期分组', () => {
    // now 固定三天边界，避免测试依赖系统时间。
    const now = Date.parse('2026-08-10T12:00:00+08:00');
    // entries 只保留命中账号 ID 的最近记录。
    const entries = buildFriendApplicationEntries([
      createApplication(),
      createApplication({ applicationID: 'old', userID: 'old-id', displayName: '旧用户', createdAt: '2026-07-01T00:00:00+08:00' }),
    ], 'U-1', now);
    expect(entries.map(entry => entry.type === 'section' ? entry.title : entry.application.applicationID))
      .toEqual(['最近三天', 'app-1']);
  });

  it('映射 incoming 来源和空消息', () => {
    // application 使用群聊来源且没有验证消息。
    const application = createApplication({ sourceType: 'group' });
    expect(getFriendApplicationSourceText(application)).toBe('通过群聊添加');
    expect(getFriendApplicationMessageText(application)).toBe('请求添加你为好友');
  });

  it('映射 outgoing 来源、消息和状态', () => {
    // application 表示当前用户发出的申请。
    const application = createApplication({ direction: 'outgoing', message: '你好', status: 'accepted' });
    expect(getFriendApplicationSourceText(application)).toBe('我申请添加对方');
    expect(getFriendApplicationMessageText(application)).toBe('我：你好');
    expect(getFriendApplicationStatusText(application.status)).toBe('已添加');
  });

  it('只允许接受 incoming pending 申请', () => {
    expect(canAcceptFriendApplication(createApplication())).toBe(true);
    expect(canAcceptFriendApplication(createApplication({ direction: 'outgoing' }))).toBe(false);
    expect(canAcceptFriendApplication(createApplication({ status: 'rejected' }))).toBe(false);
    expect(getFriendApplicationStatusText('expired')).toBe('已过期');
  });

  it('待处理优先跨越日期时生成唯一 section key', () => {
    // now 固定在新旧记录分界之后。
    const now = Date.parse('2026-08-10T12:00:00+08:00');
    // entries 模拟旧 pending 排在新 accepted 前的 RN 顺序。
    const entries = buildFriendApplicationEntries([
      createApplication({ applicationID: 'old-pending', createdAt: '2026-07-01T00:00:00+08:00' }),
      createApplication({ applicationID: 'new-accepted', status: 'accepted', createdAt: '2026-08-10T00:00:00+08:00' }),
    ], '', now);
    // sectionKeys 在标题重复出现时仍必须满足 React key 唯一性。
    const sectionKeys = entries.filter(entry => entry.type === 'section').map(entry => entry.key);
    expect(new Set(sectionKeys).size).toBe(sectionKeys.length);
  });
});
