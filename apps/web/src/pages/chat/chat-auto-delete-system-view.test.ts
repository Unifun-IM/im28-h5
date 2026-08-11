import type { Message } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import { getChatAutoDeleteSystemText } from './chat-auto-delete-system-view.js';

/** 构造 type1701 自动删除变更消息。 */
function createNotice(
  seconds: string,
  enabled: string,
  operatorUserID = 'operator-1',
): Message {
  return {
    clientMsgID: 'notice-1',
    conversationID: 'conversation-1',
    senderID: operatorUserID,
    direction: 'incoming',
    contentType: 1701,
    status: 'received',
    sendTime: 1,
    payload: {
      system: {
        event_type: 'conversation_auto_delete_changed',
        extra: {
          operator_user_id: operatorUserID,
          operator_nickname: '张三',
          auto_delete_seconds: seconds,
          enabled,
        },
      },
    },
  };
}

/** 1701 文案与 RN 当前身份和时长规则保持一致。 */
describe('chat auto delete system view', () => {
  /** 当前操作者显示“你”。 */
  it('renders current user enable notice', () => {
    expect(getChatAutoDeleteSystemText(createNotice('86400', 'true'), 'operator-1'))
      .toBe('你已设置消息在1天后自动删除');
  });

  /** 其他操作者显示服务端昵称且关闭文案不带时长。 */
  it('renders peer disable notice', () => {
    expect(getChatAutoDeleteSystemText(createNotice('0', 'false'), 'current-user'))
      .toBe('张三已关闭消息自动删除');
  });

  /** enabled 与秒数矛盾时必须降级而不是误导用户。 */
  it('rejects inconsistent metadata', () => {
    expect(getChatAutoDeleteSystemText(createNotice('604800', 'false'))).toBeNull();
  });
});
