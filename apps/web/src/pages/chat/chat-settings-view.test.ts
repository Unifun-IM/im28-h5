import { describe, expect, it } from 'vitest';
import type {
  Conversation,
  WebIMGroupMember,
  WebIMJoinedGroup,
} from '@im28/im-sdk/web';

import {
  buildChatSettingsMemberViews,
  buildChatSettingsView,
} from './chat-settings-view.js';

/** 构造单聊或群聊设置测试使用的共享会话快照。 */
function createConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    conversationID: 'conversation-1',
    type: 'single',
    targetID: 'user-2',
    name: '小明',
    unreadCount: 0,
    updatedAt: 1,
    ...overrides,
  };
}

/** 构造群设置投影测试使用的标准化群缓存。 */
function createGroup(overrides: Partial<WebIMJoinedGroup> = {}): WebIMJoinedGroup {
  return {
    groupID: 'group-1',
    conversationID: 'conversation-group-1',
    name: '产品群',
    avatarURL: 'https://example.test/group.png',
    introduction: '',
    memberCount: 23,
    ownerUserID: 'owner-1',
    currentUserRole: 'member',
    canMentionAll: false,
    isCreatedByCurrentUser: false,
    status: 'active',
    ...overrides,
  };
}

describe('chat settings view', () => {
  it('keeps single-chat identity and RN search wording', () => {
    // view 验证单聊不会误读无关群缓存。
    const view = buildChatSettingsView(createConversation(), createGroup());
    expect(view).toMatchObject({
      isGroup: false,
      pageTitle: '聊天设置',
      searchLabel: '查看聊天记录',
      targetID: 'user-2',
      title: '小明',
      memberCount: 0,
      introduction: '',
      canClearForAll: true,
    });
  });

  it('prefers the matching joined-group snapshot', () => {
    // view 验证群名称、头像和人数来自 shared group facade。
    const view = buildChatSettingsView(createConversation({
      conversationID: 'conversation-group-1',
      type: 'group',
      targetID: 'group-1',
      name: '旧群名',
    }), createGroup({ introduction: '用于同步产品进度' }));
    expect(view).toMatchObject({
      isGroup: true,
      pageTitle: '群设置',
      searchLabel: '查找聊天内容',
      title: '产品群',
      avatarURL: 'https://example.test/group.png',
      memberCount: 23,
      introduction: '用于同步产品进度',
      canClearForAll: false,
    });
  });

  it('does not project an unrelated group introduction', () => {
    /** conversation 是群简介入口当前绑定的真实群会话。 */
    const conversation = createConversation({
      conversationID: 'conversation-group-1',
      type: 'group',
      targetID: 'group-1',
    });
    expect(buildChatSettingsView(
      conversation,
      createGroup({ groupID: 'other-group', introduction: '其他群简介' }),
    ).introduction).toBe('');
  });

  it('only exposes all-member clear for a matching owner or admin snapshot', () => {
    /** conversation 是当前设置页的真实群会话。 */
    const conversation = createConversation({
      conversationID: 'conversation-group-1',
      type: 'group',
      targetID: 'group-1',
    });
    expect(buildChatSettingsView(
      conversation,
      createGroup({ currentUserRole: 'admin' }),
    ).canClearForAll).toBe(true);
    expect(buildChatSettingsView(
      conversation,
      createGroup({ groupID: 'other-group', currentUserRole: 'owner' }),
    ).canClearForAll).toBe(false);
  });

  it('deduplicates invalid member pages without changing first order', () => {
    // members 包含重复和空身份，模拟异常分页输入。
    const members: WebIMGroupMember[] = [
      {
        groupID: 'group-1',
        userID: 'u1',
        remark: '好友备注',
        groupNickname: '群昵称',
        nickname: '甲',
        avatarURL: '',
        role: 'member',
        roleLevel: 20,
      },
      {
        groupID: 'group-1',
        userID: '',
        nickname: '空',
        avatarURL: '',
        role: 'member',
        roleLevel: 20,
      },
      {
        groupID: 'group-1',
        userID: 'u1',
        nickname: '重复',
        avatarURL: '',
        role: 'member',
        roleLevel: 20,
      },
      {
        groupID: 'group-1',
        userID: 'u2',
        nickname: '',
        avatarURL: '',
        role: 'admin',
        roleLevel: 60,
      },
    ];
    expect(buildChatSettingsMemberViews(members)).toEqual([
      { userID: 'u1', name: '好友备注', avatarURL: '' },
      { userID: 'u2', name: 'u2', avatarURL: '' },
    ]);
  });
});
