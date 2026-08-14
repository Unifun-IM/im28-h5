import type { WebIMGroupApplication } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import {
  buildGroupApplicationEntries,
  buildGroupVerificationEntries,
  countPendingGroupApplications,
  getGroupApplicationSourceText,
  getGroupApplicationStatusText,
} from './group-application-view.js';

/** 创建可覆写的群申请测试记录。 */
function createApplication(
  overrides: Partial<WebIMGroupApplication> = {},
): WebIMGroupApplication {
  return {
    applicationID: 'a1', groupID: 'g1', groupName: '研发群', groupAvatarURL: '', ownerUserID: 'self',
    requesterUserID: 'u1', requesterName: '小明', requesterAvatarURL: '', inviterUserID: '', type: 'apply',
    sourceType: 'search_id', message: '申请加入', status: 'pending', createdAt: '2026-08-10T00:00:00+08:00', handledAt: '',
    ...overrides,
  };
}

// 群申请纯视图规则回归。
describe('group application view', () => {
  it('只聚合待处理申请并按数量排序', () => {
    // entries 模拟两个群和一条已处理记录。
    const entries = buildGroupVerificationEntries([
      createApplication(),
      createApplication({ applicationID: 'a2', requesterUserID: 'u2' }),
      createApplication({ applicationID: 'a3', groupID: 'g2', groupName: '产品群', ownerUserID: 'other' }),
      createApplication({ applicationID: 'a4', groupID: 'g3', status: 'accepted' }),
    ], 'self', '');
    expect(entries.map(entry => [entry.groupID, entry.count])).toEqual([['g1', 2], ['g2', 1]]);
    expect(entries[0]).toMatchObject({ isOwner: true });
  });

  it('群索引支持名称和群 ID 搜索', () => {
    // applications 覆盖名称和 ID 两种查找方式。
    const applications = [createApplication(), createApplication({ applicationID: 'a2', groupID: 'team-2', groupName: '产品群' })];
    expect(buildGroupVerificationEntries(applications, 'self', '产品')).toHaveLength(1);
    expect(buildGroupVerificationEntries(applications, 'self', 'team-2')[0]?.groupName).toBe('产品群');
  });

  it('群管理入口只统计目标群待处理申请', () => {
    expect(countPendingGroupApplications([
      createApplication(),
      createApplication({ applicationID: 'a2', status: 'accepted' }),
      createApplication({ applicationID: 'a3', groupID: 'g2' }),
    ], 'g1')).toBe(1);
  });

  it('详情只保留目标群并支持申请人搜索', () => {
    // entries 只应出现 g1 的小明。
    const entries = buildGroupApplicationEntries([
      createApplication(),
      createApplication({ applicationID: 'a2', groupID: 'g2', requesterName: '小红' }),
    ], 'g1', '小明', Date.parse('2026-08-10T12:00:00+08:00'));
    expect(entries.filter(entry => entry.type === 'application')).toHaveLength(1);
  });

  it('待处理跨越日期时生成唯一 section key', () => {
    // entries 模拟旧 pending 排在新 accepted 前的 facade 顺序。
    const entries = buildGroupApplicationEntries([
      createApplication({ applicationID: 'old', createdAt: '2026-07-01T00:00:00+08:00' }),
      createApplication({ applicationID: 'new', status: 'accepted' }),
    ], 'g1', '', Date.parse('2026-08-10T12:00:00+08:00'));
    // keys 在标题重复出现时仍满足 React 唯一性。
    const keys = entries.filter(entry => entry.type === 'section').map(entry => entry.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('映射申请、邀请和处理状态文案', () => {
    expect(getGroupApplicationSourceText(createApplication())).toBe('搜索ID');
    expect(getGroupApplicationSourceText(createApplication({ type: 'invite' }))).toContain('研发群');
    expect(getGroupApplicationStatusText(createApplication({ status: 'accepted' }))).toBe('已添加');
    expect(getGroupApplicationStatusText(createApplication({ type: 'invite', status: 'rejected' }))).toBe('已失效');
  });
});
