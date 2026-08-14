import { describe, expect, it } from 'vitest';

import callsPageSource from '../pages/calls/CallsPage.tsx?raw';
import layoutSource from './PrimaryTabsLayout.tsx?raw';
import { getPrimaryTabBarVisible } from './primary-tab-chrome.js';

describe('primary tab chrome', () => {
  it('keeps authenticated primary navigation visible outside call editing', () => {
    expect(getPrimaryTabBarVisible({
      activeTab: 'chats',
      callsChromeHidden: true,
      restoring: false,
      runtimeReady: true,
      userID: 'user-1',
    })).toBe(true);
    expect(getPrimaryTabBarVisible({
      activeTab: 'calls',
      callsChromeHidden: false,
      restoring: false,
      runtimeReady: true,
      userID: 'user-1',
    })).toBe(true);
  });

  it('hides primary navigation for call editing and unavailable runtime states', () => {
    expect(getPrimaryTabBarVisible({
      activeTab: 'calls',
      callsChromeHidden: true,
      restoring: false,
      runtimeReady: true,
      userID: 'user-1',
    })).toBe(false);
    expect(getPrimaryTabBarVisible({
      activeTab: 'calls',
      callsChromeHidden: false,
      restoring: true,
      runtimeReady: true,
      userID: 'user-1',
    })).toBe(false);
  });

  it('keeps the layout as chrome owner and restores it when CallsPage leaves', () => {
    expect(layoutSource).toContain('onChromeHiddenChange={setCallsChromeHidden}');
    expect(callsPageSource).toContain('onChromeHiddenChange?.(editing)');
    expect(callsPageSource).toContain('return () => onChromeHiddenChange?.(false)');
  });
});
