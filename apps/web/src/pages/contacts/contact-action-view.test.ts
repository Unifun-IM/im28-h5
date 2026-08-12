import { describe, expect, it } from 'vitest';

import {
  createContactCardShareLocationState,
  getContactActionMenuState,
  readContactCardShareLocationState,
} from './contact-action-view.js';

/** contact 提供联系人动作纯逻辑所需的完整稳定字段。 */
const contact = {
  userID: 'friend-1',
  displayName: '好友一',
  nickname: '好友一',
  remark: '',
  account: 'friend-one',
  phone: '',
  email: '',
  avatarURL: 'https://example.com/avatar.png',
  isStarred: false,
  addedAt: '',
} as const;

describe('contact action view', () => {
  it('keeps the RN bubble inside the viewport and flips below near the top', () => {
    /** menu 是顶部长按点的最终气泡状态。 */
    const menu = getContactActionMenuState({
      contact,
      point: { x: 8, y: 20 },
      viewportWidth: 320,
      viewportHeight: 640,
    });
    expect(menu).toMatchObject({ left: 8, top: 32, placement: 'below' });
  });

  it('places the RN bubble above when enough space is available', () => {
    /** menu 是底部长按点的最终气泡状态。 */
    const menu = getContactActionMenuState({
      contact,
      point: { x: 300, y: 500 },
      viewportWidth: 320,
      viewportHeight: 640,
    });
    expect(menu).toMatchObject({ left: 144, top: 264, placement: 'above' });
  });

  it('round-trips valid card route state and rejects mismatched users', () => {
    /** state 是路由允许携带的公开名片投影。 */
    const state = createContactCardShareLocationState(contact);
    expect(readContactCardShareLocationState(state, 'friend-1')).toEqual(state);
    expect(readContactCardShareLocationState(state, 'friend-2')).toBeNull();
    expect(readContactCardShareLocationState({}, 'friend-1')).toBeNull();
  });
});
