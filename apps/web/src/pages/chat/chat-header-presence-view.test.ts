import { describe, expect, it } from 'vitest';

import { buildChatHeaderPresenceView } from './chat-header-presence-view.js';

describe('chat header presence view', () => {
  it('单聊按明确状态展示在线或离线', () => {
    expect(buildChatHeaderPresenceView({
      conversation: { type: 'single', targetID: 'peer-1' },
      onlineByID: { 'peer-1': true },
      groupMemberUserIDs: [],
      showGroupOnlineStatus: false,
    })).toEqual({ text: '在线', dot: 'online' });
    expect(buildChatHeaderPresenceView({
      conversation: { type: 'single', targetID: 'peer-1' },
      onlineByID: { 'peer-1': false },
      groupMemberUserIDs: [],
      showGroupOnlineStatus: false,
    })).toEqual({ text: '离线', dot: 'offline' });
  });

  it('单聊状态未返回时保留头部高度但隐藏圆点', () => {
    expect(buildChatHeaderPresenceView({
      conversation: { type: 'single', targetID: 'peer-1' },
      onlineByID: {},
      groupMemberUserIDs: [],
      showGroupOnlineStatus: false,
    })).toEqual({ text: '', dot: 'hidden' });
  });

  it('普通群去重统计明确在线成员', () => {
    expect(buildChatHeaderPresenceView({
      conversation: { type: 'group', targetID: 'group-1' },
      onlineByID: { 'user-1': true, 'user-2': false, 'user-3': true },
      groupMemberUserIDs: ['user-1', 'user-2', 'user-3', 'user-1'],
      showGroupOnlineStatus: true,
    })).toEqual({ text: '2人在线', dot: 'online' });
  });

  it('非普通群隐藏在线人数和圆点', () => {
    expect(buildChatHeaderPresenceView({
      conversation: { type: 'group', targetID: 'group-1' },
      onlineByID: { 'user-1': true },
      groupMemberUserIDs: ['user-1'],
      showGroupOnlineStatus: false,
    })).toEqual({ text: '', dot: 'none' });
  });
});
