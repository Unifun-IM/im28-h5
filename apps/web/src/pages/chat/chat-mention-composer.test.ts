import { describe, expect, it } from 'vitest';

import {
  buildChatMentionPickerItems,
  collectVisibleChatMentions,
  getActiveChatMentionQuery,
  insertChatMention,
} from './chat-mention-composer.js';

// 群聊提及 helper 对齐 RN 的查询、候选和可见身份规则。
describe('chat mention composer', () => {
  it('只识别光标前最后一个无空白 @ 查询', () => {
    expect(getActiveChatMentionQuery('你好 @张', 5)).toEqual({ start: 3, end: 5, query: '张' });
    expect(getActiveChatMentionQuery('你好 @张 三', 7)).toBeNull();
  });

  it('所有人优先并过滤自己和昵称查询', () => {
    /** members 提供稳定 SDK DTO。 */
    const members = [
      {
        groupID: 'g1',
        userID: 'self',
        nickname: '自己',
        avatarURL: '',
        role: 'member' as const,
        roleLevel: 20,
      },
      {
        groupID: 'g1',
        userID: 'u2',
        nickname: '用户B',
        avatarURL: '',
        role: 'admin' as const,
        roleLevel: 60,
      },
    ];
    expect(buildChatMentionPickerItems({
      members,
      selfID: 'self',
      canMentionAll: true,
      query: '',
    }).map(item => item.label)).toEqual(['所有人', '用户B']);
    expect(buildChatMentionPickerItems({
      members,
      selfID: 'self',
      canMentionAll: true,
      query: '用户',
    }).map(item => item.label)).toEqual(['用户B']);
  });

  it('替换查询、保留后缀并只发送仍可见的目标', () => {
    /** query 指向中间草稿的 @用。 */
    const query = getActiveChatMentionQuery('前 @用 后', 4)!;
    /** result 使用用户B替换查询。 */
    const result = insertChatMention(
      { text: '前 @用 后', entities: [] },
      query,
      {
        key: 'user:u2',
        label: '用户B',
        description: 'u2',
        avatarURL: '',
        mention: { key: 'user:u2', type: 'user', userID: 'u2', nickname: '用户B' },
      },
    );
    expect(result.document.text).toBe('前 @用户B  后');
    expect(collectVisibleChatMentions(result.document.text, [
      { key: 'user:u2', type: 'user', userID: 'u2', nickname: '用户B' },
      { key: 'user:u3', type: 'user', userID: 'u3', nickname: '用户C' },
    ], false)).toEqual([{ type: 'user', userID: 'u2', nickname: '用户B' }]);
  });
});
