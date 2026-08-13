import { describe, expect, it } from 'vitest';

import { readBroadcastBackHref, readBroadcastRouteState } from './broadcast-route.js';

describe('broadcast route state', () => {
  it('keeps only stable deduplicated friend and group identities', () => {
    expect(readBroadcastRouteState({
      backHref: '/contacts',
      targets: [
        { kind: 'friend', targetID: ' user-1 ', title: '不应进入路由合同' },
        { kind: 'friend', targetID: 'user-1' },
        { kind: 'group', targetID: 'group-1' },
        { kind: 'unknown', targetID: 'bad' },
      ],
    })).toEqual({
      backHref: '/contacts',
      targets: [
        { kind: 'friend', targetID: 'user-1' },
        { kind: 'group', targetID: 'group-1' },
      ],
    });
  });

  it('fails closed without valid targets and restricts the back route', () => {
    expect(readBroadcastRouteState({ targets: [] })).toBeNull();
    expect(readBroadcastBackHref({ backHref: 'https://example.com' })).toBe('/conversations');
  });
});
