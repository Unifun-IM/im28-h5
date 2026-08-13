import { describe, expect, it, vi } from 'vitest';
import type { Conversation, WebIMJoinedGroup, WebIMSync } from '@im28/im-sdk/web';
import { createGroupPermissionsFixture } from '../../test-fixtures/group-permissions.js';

import { loadGroupProfileSource } from './group-profile-source.js';

/** 构造 source loader 使用的群会话。 */
function createConversation(type: Conversation['type'] = 'group'): Conversation {
  return {
    conversationID: 'conversation-group-1',
    type,
    targetID: 'group-1',
    name: '群聊',
    unreadCount: 0,
    updatedAt: 1,
  };
}

/** 构造 source loader 使用的 shared 群快照。 */
function createGroup(name: string): WebIMJoinedGroup {
  return {
    groupID: 'group-1',
    conversationID: 'conversation-group-1',
    name,
    avatarURL: '',
    introduction: '',
    announcement: '',
    announcementVersion: '',
    memberCount: 3,
    ownerUserID: 'owner',
    currentUserRole: 'member',
    permissions: createGroupPermissionsFixture('member'),
    canEditAnnouncement: false,
    canMentionAll: false,
    isCreatedByCurrentUser: false,
    status: 'active',
  };
}

/** 用最小 facade 构造群资料 loader 依赖。 */
function createSync(options: {
  readonly cachedConversations: readonly Conversation[];
  readonly remoteConversations?: readonly Conversation[];
  readonly cachedGroups?: readonly WebIMJoinedGroup[];
  readonly remoteGroups?: readonly WebIMJoinedGroup[];
}): WebIMSync {
  return {
    conversations: {
      listCached: vi.fn(async () => options.cachedConversations),
      sync: vi.fn(async () => options.remoteConversations ?? options.cachedConversations),
    },
    groups: {
      listCached: vi.fn(async () => options.cachedGroups ?? []),
      sync: vi.fn(async () => options.remoteGroups ?? options.cachedGroups ?? []),
    },
  } as unknown as WebIMSync;
}

describe('group profile source loader', () => {
  it('先投影缓存群资料再返回权威刷新结果', async () => {
    /** onCached 记录 cache-first 页面投影。 */
    const onCached = vi.fn();
    /** source 必须使用同一会话对应的 refreshed 群。 */
    const source = await loadGroupProfileSource({
      sync: createSync({
        cachedConversations: [createConversation()],
        cachedGroups: [createGroup('缓存群名')],
        remoteGroups: [createGroup('最新群名')],
      }),
      conversationID: 'conversation-group-1',
      onCached,
    });
    expect(onCached).toHaveBeenCalledWith(expect.objectContaining({ group: expect.objectContaining({ name: '缓存群名' }) }));
    expect(source.group.name).toBe('最新群名');
  });

  it('深链缺少缓存会话时只通过 canonical conversation sync 恢复', async () => {
    /** sync 允许真实深链在缓存为空时恢复。 */
    const sync = createSync({
      cachedConversations: [],
      remoteConversations: [createConversation()],
      remoteGroups: [createGroup('远端群名')],
    });
    await expect(loadGroupProfileSource({ sync, conversationID: 'conversation-group-1' })).resolves.toMatchObject({
      group: { name: '远端群名' },
    });
    expect(sync.conversations.sync).toHaveBeenCalledTimes(1);
  });

  it('拒绝单聊和缺失群快照，不能从 route 伪造群二维码', async () => {
    /** singleSync 证明单聊 target 不会进入群资料。 */
    const singleSync = createSync({ cachedConversations: [createConversation('single')] });
    await expect(loadGroupProfileSource({ sync: singleSync, conversationID: 'conversation-group-1' })).rejects.toThrow('群聊不存在');
    /** missingGroupSync 证明缺失群快照时 fail-visible。 */
    const missingGroupSync = createSync({ cachedConversations: [createConversation()] });
    await expect(loadGroupProfileSource({ sync: missingGroupSync, conversationID: 'conversation-group-1' })).rejects.toThrow('群资料不存在');
  });
});
