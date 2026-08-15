import type { WebIMGroupApplication, WebIMSync } from '@im28/im-sdk/web';
import { describe, expect, it, vi } from 'vitest';

import { readChatGroupApplicationCount } from './useChatGroupApplicationCount.js';
import hookSource from './useChatGroupApplicationCount.ts?raw';

/** 创建头部计数测试使用的最小审核记录。 */
function createApplication(
  overrides: Partial<WebIMGroupApplication> = {},
): WebIMGroupApplication {
  return {
    applicationID: 'a1', groupID: 'g1', groupName: '群聊', groupAvatarURL: '', ownerUserID: 'owner',
    requesterUserID: 'u1', requesterName: '用户', requesterAvatarURL: '', inviterUserID: '', type: 'apply',
    sourceType: '', message: '', status: 'pending', createdAt: '', handledAt: '', ...overrides,
  };
}

/** 创建只暴露群申请列表的测试 facade。 */
function createSync(applications: readonly WebIMGroupApplication[]) {
  /** list 模拟 shared facade 的一次权威读取。 */
  const list = vi.fn().mockResolvedValue(applications);
  return { sync: { groupApplications: { list } } as unknown as WebIMSync, list };
}

// 聊天头部只统计当前群的待处理申请。
describe('readChatGroupApplicationCount', () => {
  it('过滤其他群和已处理申请', async () => {
    /** fixture 覆盖目标 pending、目标 accepted 和其他群。 */
    const fixture = createSync([
      createApplication(),
      createApplication({ applicationID: 'a2', status: 'accepted' }),
      createApplication({ applicationID: 'a3', groupID: 'g2' }),
    ]);
    expect(await readChatGroupApplicationCount(
      fixture.sync,
      'g1',
    )).toBe(1);
    expect(fixture.list).toHaveBeenCalledWith({ pageSize: 100 });
  });

  it('单聊不读取群申请 facade', async () => {
    /** fixture 用调用次数证明非群聊没有额外网络请求。 */
    const fixture = createSync([]);
    expect(await readChatGroupApplicationCount(
      fixture.sync,
      '',
    )).toBe(0);
    expect(fixture.list).not.toHaveBeenCalled();
  });

  it('草稿只改变会话对象引用时不重新触发审核列表', () => {
    expect(hookSource).toContain("const groupID = conversation?.type === 'group' ? conversation.targetID.trim() : ''");
    expect(hookSource).toContain('}, [dataVersion, groupID, sync]);');
    expect(hookSource).not.toContain('}, [conversation, dataVersion, sync]);');
  });
});
