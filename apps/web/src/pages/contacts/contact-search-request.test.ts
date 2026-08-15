import { describe, expect, it } from 'vitest';

import { isCurrentInteractionRequest } from '../../components/interaction/index.js';
import pageSource from './ContactSearchPage.tsx?raw';
import stateOwnerSource from './useContactSearchPageState.ts?raw';

/** 联系人服务器搜索只允许最后一次关键词和 Tab 请求更新页面。 */
describe('contact search server request ownership', () => {
  it('accepts only the latest request generation', () => {
    expect(isCurrentInteractionRequest(6, 6)).toBe(true);
    expect(isCurrentInteractionRequest(7, 6)).toBe(false);
  });

  it('invalidates pending work on input changes and does not block tab switches', () => {
    expect(stateOwnerSource).toContain('serverSearchRequestIDRef.current += 1;');
    expect(stateOwnerSource).toContain(
      'isCurrentInteractionRequest(serverSearchRequestIDRef.current, requestID)',
    );
    expect(stateOwnerSource).not.toContain('normalizedKeyword || loadingServer) return');
  });

  it('dismisses the keyboard without coupling Enter to a server search', () => {
    expect(pageSource).toContain('enterKeyHint="search"');
    expect(pageSource).toContain('shouldDismissContactSearchKeyboard({');
    expect(pageSource).toContain('event.currentTarget.blur();');
    expect(pageSource).not.toContain('onKeyDown={() => void runServerSearch');
  });
});
