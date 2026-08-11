import type { WebIMConversationListItem } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import { getConversationDisplayPreview } from './conversation-list-view.js';

/** 构造带插画表情实体的静音会话缓存项。 */
function createMutedConversationItem(): WebIMConversationListItem {
  return {
    conversation: {
      conversationID: 'single_user-2',
      type: 'single',
      targetID: 'user-2',
      unreadCount: 3,
      isMuted: true,
      updatedAt: 1,
    },
    latestMessage: {
      clientMsgID: 'message-1',
      conversationID: 'single_user-2',
      senderID: 'user-2',
      direction: 'incoming',
      contentType: 101,
      status: 'received',
      sendTime: 1,
      entities: [
        {
          type: 'preset_emoji',
          offset: 2,
          length: '😎'.length,
          packID: 'im28-preset-v1',
          presetID: 'smiling-face-with-sunglasses',
        },
      ],
      payload: { text: { text: ' A😎B ' } },
    },
    unreadMention: null,
  };
}

// 会话摘要 contract 锁定免打扰前缀后的实体位置。
describe('conversation list preset emoji preview', () => {
  /** 验证实体随最终可见前缀同步平移。 */
  it('projects entity offsets into muted unread text', () => {
    /** preview 是列表行最终消费的可见模型。 */
    const preview = getConversationDisplayPreview(createMutedConversationItem());
    expect(preview.text).toBe('[3条] A😎B ');
    expect(preview.entities).toEqual([
      {
        type: 'preset_emoji',
        offset: '[3条] A'.length,
        length: '😎'.length,
        packID: 'im28-preset-v1',
        presetID: 'smiling-face-with-sunglasses',
      },
    ]);
  });

  /** 验证消息级 user mention 转成 RN 的 @我 提示且不被静音前缀覆盖。 */
  it('projects a current-user mention before muted unread text', () => {
    /** item 复用静音会话并切换为群聊 mention 消息。 */
    const item = createMutedConversationItem();
    /** mentionItem 保存 Gateway 映射后的稳定身份和昵称快照。 */
    const mentionItem: WebIMConversationListItem = {
      conversation: {
        ...item.conversation,
        conversationID: 'group_group-1',
        type: 'group',
        targetID: 'group-1',
      },
      latestMessage: item.latestMessage ? {
        ...item.latestMessage,
        conversationID: 'group_group-1',
        contentType: 106,
        mentions: [{ type: 'user', userID: 'current-user', nickname: '小王' }],
        payload: { mention: { text: '@小王 明天集合' } },
      } : null,
      unreadMention: null,
    };
    /** preview 是会话行最终消费的提醒摘要。 */
    const preview = getConversationDisplayPreview(mentionItem, 'current-user');
    expect(preview.text).toBe('[有人@我]@我 明天集合');
  });

  /** 验证较新的普通消息不会覆盖未读窗口内最近一条 @ 当前用户。 */
  it('projects an older unread mention with its cached group sender name', () => {
    /** baseItem 提供最新普通消息和群会话未读状态。 */
    const baseItem = createMutedConversationItem();
    /** mentionItem 由 shared facade 同时提供最近未读 mention 与成员名称。 */
    const mentionItem: WebIMConversationListItem = {
      conversation: {
        ...baseItem.conversation,
        conversationID: 'group_group-1',
        type: 'group',
        targetID: 'group-1',
      },
      latestMessage: baseItem.latestMessage ? {
        ...baseItem.latestMessage,
        conversationID: 'group_group-1',
        clientMsgID: 'ordinary-latest',
        payload: { text: { text: '最后一条普通消息' } },
      } : null,
      unreadMention: {
        senderDisplayName: '最近的人',
        message: {
          clientMsgID: 'mention-recent',
          conversationID: 'group_group-1',
          senderID: 'sender-recent',
          direction: 'incoming',
          contentType: 106,
          status: 'received',
          sendTime: 20,
          seq: 20,
          mentions: [{ type: 'user', userID: 'current-user', nickname: '小王' }],
          payload: { mention: { text: '@小王 再看这里' } },
        },
      },
    };

    expect(getConversationDisplayPreview(mentionItem, 'current-user').text)
      .toBe('[有人@我]最近的人：@我 再看这里');
  });

  /** 验证草稿仍高于 shared unread mention，避免改变 RN 第一优先级。 */
  it('keeps a draft above the unread mention projection', () => {
    /** baseItem 复用稳定会话和消息字段。 */
    const baseItem = createMutedConversationItem();
    /** draftItem 同时包含草稿与未读 mention。 */
    const draftItem: WebIMConversationListItem = {
      ...baseItem,
      conversation: { ...baseItem.conversation, draft: '待发送草稿' },
      unreadMention: {
        message: {
          ...baseItem.latestMessage!,
          mentions: [{ type: 'all' }],
        },
      },
    };
    expect(getConversationDisplayPreview(draftItem, 'current-user'))
      .toEqual({ isDraft: true, text: '待发送草稿' });
  });

  /** 验证 @所有人使用独立提醒前缀。 */
  it('projects an all-member mention', () => {
    /** item 复用基础消息并构造群聊 @所有人。 */
    const item = createMutedConversationItem();
    /** mentionItem 保存 all target，不依赖正文文本猜测权限。 */
    const mentionItem: WebIMConversationListItem = {
      conversation: {
        ...item.conversation,
        conversationID: 'group_group-1',
        type: 'group',
        targetID: 'group-1',
        isMuted: false,
      },
      latestMessage: item.latestMessage ? {
        ...item.latestMessage,
        conversationID: 'group_group-1',
        contentType: 106,
        mentions: [{ type: 'all', nickname: '所有人' }],
        payload: { mention: { text: '@所有人 请看公告' } },
      } : null,
      unreadMention: null,
    };
    expect(getConversationDisplayPreview(mentionItem, 'current-user').text)
      .toBe('[所有人]@所有人 请看公告');
  });
});
