import { describe, expect, it } from 'vitest';

import type { ChatForwardTarget } from './forward-target-view.js';
import { toIMMessageCard } from './ChatCardPickerDialog.js';

/** 构造选择器目标并允许测试覆盖客户端类型。 */
function createTarget(
  input: Partial<ChatForwardTarget>,
): ChatForwardTarget {
  return {
    key: 'friend:user-2',
    kind: 'friend',
    id: 'user-2',
    conversationID: '',
    title: '用户二',
    description: '好友 · user-2',
    avatarURL: 'https://cdn.example/user.png',
    ...input,
  };
}

// 名片选择器只把真实好友或群目标交给 shared SDK contract。
describe('chat card picker', () => {
  /** 好友目标映射为用户名片稳定身份与展示快照。 */
  it('maps a friend target to a user card', () => {
    expect(toIMMessageCard(createTarget({}))).toEqual({
      type: 'user',
      userID: 'user-2',
      nickname: '用户二',
      avatarURL: 'https://cdn.example/user.png',
    });
  });

  /** 群目标映射为群名片且不携带会话约定身份。 */
  it('maps a group target to a group card', () => {
    expect(toIMMessageCard(createTarget({
      key: 'group:group-2',
      kind: 'group',
      id: 'group-2',
      conversationID: 'sg_group-2',
      title: '第二群',
      description: '群聊 · 3人',
      avatarURL: '',
    }))).toEqual({
      type: 'group',
      groupID: 'group-2',
      groupName: '第二群',
      avatarURL: '',
    });
  });

  /** 最近会话目标不能绕过用户和群两类名片边界。 */
  it('rejects a recent conversation target', () => {
    expect(() => toIMMessageCard(createTarget({ kind: 'conversation' })))
      .toThrow('名片目标类型不可用');
  });
});
