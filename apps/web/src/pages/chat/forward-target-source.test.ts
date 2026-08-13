import { describe, expect, it, vi } from 'vitest';

import type { WebIMSync } from '@im28/im-sdk/web';
import {
  loadChatForwardTargets,
  resolveChatForwardTargetConversationID,
} from './forward-target-source.js';

/** 只构造共享 owner 当前测试需要的 facade 表面。 */
function createSyncStub(): WebIMSync {
  /** conversation 是目标加载和群会话解析共用的真实形状。 */
  const conversation = { conversationID: 'group-conversation', targetID: 'group-1', type: 'group', name: '测试群' };
  return {
    conversations: {
      listCached: vi.fn(async () => [conversation]),
      sync: vi.fn(async () => [conversation]),
    },
    contacts: {
      listCached: vi.fn(async () => [{ userID: 'friend-1', nickname: '好友', remark: '', displayName: '好友', avatarURL: '' }]),
      list: vi.fn(async () => [{ userID: 'friend-1', nickname: '好友', remark: '', displayName: '好友', avatarURL: '' }]),
    },
    groups: {
      listCached: vi.fn(async () => [{ groupID: 'group-1', conversationID: 'group-conversation', name: '测试群', avatarURL: '', memberCount: 2 }]),
      sync: vi.fn(async () => [{ groupID: 'group-1', conversationID: 'group-conversation', name: '测试群', avatarURL: '', memberCount: 2 }]),
    },
    peerProfile: {
      openConversation: vi.fn(async () => ({ conversationID: 'single-conversation' })),
    },
  } as unknown as WebIMSync;
}

describe('shared forward target source', () => {
  it('二维码分享关闭最近会话加载但仍读取好友和群缓存', async () => {
    /** sync 记录 facade 调用，确保页面不会再复制加载规则。 */
    const sync = createSyncStub();
    /** cached 保存网络刷新前的真实候选快照。 */
    const cached = vi.fn();
    const result = await loadChatForwardTargets({ sync, includeRecent: false, onCached: cached });
    expect(sync.conversations.listCached).not.toHaveBeenCalled();
    expect(sync.conversations.sync).not.toHaveBeenCalled();
    expect(cached).toHaveBeenCalledWith(expect.objectContaining({ recent: [] }));
    expect(result.contacts[0]?.userID).toBe('friend-1');
    expect(result.groups[0]?.groupID).toBe('group-1');
  });

  it('好友和群目标都解析成 facade 验证后的真实会话', async () => {
    /** sync 提供单聊打开和群聊 cache 两条 canonical 路径。 */
    const sync = createSyncStub();
    await expect(resolveChatForwardTargetConversationID(sync, {
      key: 'friend:friend-1', kind: 'friend', id: 'friend-1', conversationID: '', title: '好友', description: '', avatarURL: '',
    })).resolves.toBe('single-conversation');
    await expect(resolveChatForwardTargetConversationID(sync, {
      key: 'group:group-1', kind: 'group', id: 'group-1', conversationID: 'group-conversation', title: '测试群', description: '', avatarURL: '',
    })).resolves.toBe('group-conversation');
  });
});
