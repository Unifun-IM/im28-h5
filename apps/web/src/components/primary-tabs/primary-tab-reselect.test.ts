import { describe, expect, it } from 'vitest';

import {
  isPrimaryConversationTabDoublePress,
  PRIMARY_CONVERSATION_TAB_DOUBLE_PRESS_MS,
  shouldRequestPrimaryConversationTabReselect,
} from './primary-tab-reselect.js';

/** 主标签双击回归锁定 RN 320ms 边界和异常时间保护。 */
describe('primary conversation tab reselect', () => {
  /** 边界内和边界值都应触发。 */
  it('accepts the RN double-press window', () => {
    expect(isPrimaryConversationTabDoublePress(1_000, 1_319)).toBe(true);
    expect(isPrimaryConversationTabDoublePress(1_000, 1_000 + PRIMARY_CONVERSATION_TAB_DOUBLE_PRESS_MS)).toBe(true);
  });

  /** 首次、超时和时钟倒退都不得触发。 */
  it('rejects first, stale, and reversed presses', () => {
    expect(isPrimaryConversationTabDoublePress(0, 100)).toBe(false);
    expect(isPrimaryConversationTabDoublePress(1_000, 1_321)).toBe(false);
    expect(isPrimaryConversationTabDoublePress(1_000, 999)).toBe(false);
  });

  /** 只有已选消息页、存在未读且命中双击窗口才请求当前页动作。 */
  it('requires selected chats with unread messages before requesting the page action', () => {
    expect(shouldRequestPrimaryConversationTabReselect(true, 2, 1_000, 1_200)).toBe(true);
    expect(shouldRequestPrimaryConversationTabReselect(false, 2, 1_000, 1_200)).toBe(false);
    expect(shouldRequestPrimaryConversationTabReselect(true, 0, 1_000, 1_200)).toBe(false);
    expect(shouldRequestPrimaryConversationTabReselect(true, 2, 1_000, 1_400)).toBe(false);
  });
});
