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
});
