import type { Message } from '@im28/im-sdk/web';
import { describe, expect, it } from 'vitest';

import {
  buildChatSearchCalendarMonths,
  getChatSearchCalendarRange,
  getChatSearchFileExtension,
  groupChatSearchMessagesByMonth,
  readChatSearchIndexedRouteState,
} from './chat-search-indexed-view.js';

/** 构造只包含分类视图所需字段的缓存消息。 */
function createMessage(clientMsgID: string, sendTime: number): Message {
  return {
    clientMsgID,
    conversationID: 'conversation-1',
    senderID: 'user-1',
    direction: 'incoming',
    contentType: 101,
    status: 'received',
    sendTime,
    payload: { text: { text: clientMsgID } },
  };
}

describe('chat indexed search view', () => {
  it('groups newest messages by local month', () => {
    /** january 与 february 固定本地中午，避免时区跨日。 */
    const january = new Date(2026, 0, 15, 12).getTime();
    /** february 是更新月份。 */
    const february = new Date(2026, 1, 2, 12).getTime();
    expect(groupChatSearchMessagesByMonth([
      createMessage('jan', january),
      createMessage('feb', february),
    ])).toMatchObject([
      { key: '2026-02', messages: [{ clientMsgID: 'feb' }] },
      { key: '2026-01', messages: [{ clientMsgID: 'jan' }] },
    ]);
  });

  it('builds a three-month range and links a day to its oldest message', () => {
    /** baseMonth 固定为三月，查询窗口应从一月开始到四月结束。 */
    const baseMonth = new Date(2026, 2, 12, 12);
    /** older 与 newer 位于同一天，RN 点击应定位 older。 */
    const older = createMessage('older', new Date(2026, 1, 5, 9).getTime());
    /** newer 验证分组不会改变当天最早定位语义。 */
    const newer = createMessage('newer', new Date(2026, 1, 5, 10).getTime());
    expect(getChatSearchCalendarRange(baseMonth, 3)).toEqual({
      afterSendTime: new Date(2026, 0, 1).getTime(),
      beforeSendTime: new Date(2026, 3, 1).getTime(),
    });
    /** february 是三个月份中的第二项。 */
    const february = buildChatSearchCalendarMonths([newer, older], baseMonth, 3)[1];
    /** day 是有两条记录的 2 月 5 日。 */
    const day = february?.days.find(item => item.key === '2026-02-05');
    expect(day).toMatchObject({ messageCount: 2, firstMessage: { clientMsgID: 'older' } });
  });

  it('formats a bounded file extension label', () => {
    expect(getChatSearchFileExtension('report.pdf')).toBe('PDF');
    expect(getChatSearchFileExtension('README')).toBe('FILE');
  });

  it('restores bounded date and media route state', () => {
    /** dateParams 模拟加载更多月份后的可刷新日期地址。 */
    const dateParams = new URLSearchParams('view=date&months=5');
    expect(readChatSearchIndexedRouteState(dateParams, 3)).toEqual({
      page: 'date', monthCount: 5, mediaFilter: 'all',
    });
    /** mediaParams 保留视频筛选但忽略无关月份。 */
    const mediaParams = new URLSearchParams('view=media&filter=video&months=9999');
    expect(readChatSearchIndexedRouteState(mediaParams, 3)).toEqual({
      page: 'media', monthCount: 3, mediaFilter: 'video',
    });
  });

  it('rejects unknown indexed routes and unsafe query values', () => {
    /** unknownParams 不得凭 query 创建未实现页面。 */
    const unknownParams = new URLSearchParams('view=voice');
    expect(readChatSearchIndexedRouteState(unknownParams, 3)).toBeNull();
    /** unsafeParams 对负月份和未知筛选使用安全默认值。 */
    const unsafeParams = new URLSearchParams('view=file&months=-2&filter=gif');
    expect(readChatSearchIndexedRouteState(unsafeParams, 3)).toEqual({
      page: 'file', monthCount: 3, mediaFilter: 'all',
    });
  });
});
