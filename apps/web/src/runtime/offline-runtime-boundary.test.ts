import { describe, expect, it } from 'vitest';

import appSource from '../app/App.tsx?raw';
import offlineChatSource from '../pages/chat/OfflineChatPage.tsx?raw';
import chatBubbleSource from '../pages/chat/ChatMessageBubble.tsx?raw';
import chatHeaderSource from '../pages/chat/ChatHeader.tsx?raw';
import offlineConversationsSource from '../pages/conversations/OfflineConversationsPage.tsx?raw';
import conversationRowSource from '../pages/conversations/ConversationRow.tsx?raw';
import boundarySource from './OfflineRuntimeBoundary.tsx?raw';

/** 冷启动离线 H5 壳必须保持 cache-only 路由与 mutation 隔离。 */
describe('offline runtime H5 boundary', () => {
  /** 离线边界必须包在 runtime 内并位于 call provider 外。 */
  it('does not mount the online call and tab application while offline', () => {
    expect(appSource).toContain('<OfflineRuntimeBoundary>');
    expect(appSource.indexOf('<OfflineRuntimeBoundary>')).toBeLessThan(
      appSource.indexOf('<WebIMCallProvider>'),
    );
    expect(boundarySource).toContain("snapshot.state === 'offline-readonly'");
    expect(boundarySource).toContain("snapshot.state === 'offline-validating'");
    expect(boundarySource).toContain('path="/conversations"');
    expect(boundarySource).toContain('path="/conversations/:conversationID"');
    expect(boundarySource).toContain('<Navigate to="/conversations" replace />');
  });

  /** 页面只能消费 minimal reader，禁止复制 storage、token 或完整 sync owner。 */
  it('uses only the runtime offline reader for cached list and history', () => {
    // pageSource 合并两个离线页面的完整 source contract。
    const pageSource = `${offlineConversationsSource}\n${offlineChatSource}`;
    expect(pageSource).toContain('reader.conversations.listCachedItems');
    expect(pageSource).toContain('reader.messages.getCachedHistory');
    expect(pageSource).not.toMatch(
      /getSync\(|sessionStorage|localStorage|indexedDB|accessToken|refreshToken|WebSocket|GatewayHTTPClient/,
    );
  });

  /** 重试只通过 SDK lifecycle，浏览器 online 事件不能直接宣称成功。 */
  it('treats browser online as a reconnect signal and keeps local sign-out', () => {
    expect(boundarySource).toContain('await runtime.reconnect()');
    expect(boundarySource).toContain("addEventListener('online', handleOnline)");
    expect(boundarySource).toContain('await runtime.signOut()');
    expect(boundarySource).toContain('<button type="button" onClick={() => void signOut()}>');
    expect(boundarySource).not.toContain('navigator.onLine');
  });

  /** 只读参数必须移除列表长按和聊天动作入口且不改变在线默认值。 */
  it('removes mutation actions while preserving online defaults', () => {
    expect(offlineConversationsSource).toContain('actionsEnabled={false}');
    expect(conversationRowSource).toContain('actionsEnabled = true');
    expect(offlineChatSource).toContain('readOnly');
    expect(chatHeaderSource).toContain('readOnly = false');
    expect(chatHeaderSource).toContain('!readOnly && conversation');
    expect(chatBubbleSource).toContain('multiSelecting || readOnly ? bubble');
    expect(chatBubbleSource).toContain('mine && !readOnly');
  });
});
