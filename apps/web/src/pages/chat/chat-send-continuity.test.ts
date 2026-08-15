import { describe, expect, it } from 'vitest';

import composerSource from './ChatComposer.tsx?raw';
import inputRowSource from './ChatComposerInputRow.tsx?raw';
import pageSource from './ChatPage.tsx?raw';
import unreadSource from './useChatUnreadNavigation.ts?raw';

/** 聊天连续发送契约锁定焦点和本端消息强制跟随最新。 */
describe('chat send continuity', () => {
  it('keeps the textarea focused across pointer submit and async completion', () => {
    expect(inputRowSource).toContain('onPointerDown={preventComposerSubmitBlur}');
    expect(inputRowSource).toContain('readOnly={sending}');
    expect(inputRowSource).not.toContain('disabled={sending}\n            className');
    expect(composerSource).toContain('restoreTextFocusAfterSendRef');
    expect(composerSource).toContain('textarea.focus({ preventScroll: true })');
  });

  it('requests latest positioning before the local sending entity enters state', () => {
    expect(pageSource).toContain('unreadNavigation.requestLatestForOutgoingMessage();');
    expect(unreadSource).toContain('forceLatestAfterOutgoingRef.current = true');
    expect(unreadSource).toContain('shouldChatFollowLatest(');
  });

  it('debounces read reporting until scrolling has stopped', () => {
    expect(unreadSource).toContain('scheduleVisibleUnreadReport');
    expect(unreadSource).toContain('CHAT_UNREAD_READ_IDLE_MS');
    expect(unreadSource).not.toContain('reportVisibleUnread(container);\n  }, [listRef');
  });
});
