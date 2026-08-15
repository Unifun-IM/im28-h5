import { describe, expect, it } from 'vitest';

import pageSource from './ChatPage.tsx?raw';
import surfaceSource from './ChatPageSurface.tsx?raw';
import cacheSource from './useChatPageCacheState.ts?raw';
import composerSource from './useChatPageComposerState.ts?raw';
import headerSource from './useChatPageHeaderState.ts?raw';
import messageOperationsSource from './useChatPageMessageOperations.ts?raw';
import transientSource from './useChatPageTransientActions.ts?raw';

/** ChatPage 只编排独立 owner，不重新持有其 mutation 与瞬时状态。 */
describe('chat page action owners', () => {
  it('页面只编排 hooks，稳定 JSX 由唯一 Surface owner 持有', () => {
    expect(pageSource).toContain('<ChatPageSurface');
    expect(pageSource).not.toMatch(/<ChatComposer|<ChatMessageList|<ChatTargetPickerModal/);
    expect(surfaceSource).toContain('<ChatComposer');
    expect(surfaceSource).toContain('<ChatMessageList');
    expect(surfaceSource.match(/<ChatTargetPickerModal/g)).toHaveLength(2);
    expect(surfaceSource).not.toMatch(/useState|useEffect|GatewayHTTPClient|WebIMRuntime/);
  });

  it('消息 operation 保留失败投影、SQLite 回读和 busy 释放顺序', () => {
    expect(pageSource).toContain('useChatPageMessageOperations({');
    expect(pageSource).not.toContain('setSending(');
    expect(messageOperationsSource).toContain('await operation(sync)');
    expect(messageOperationsSource).toContain('onSendError(cause)');
    expect(messageOperationsSource).toContain('sync.messages.getCachedHistory({');
    expect(messageOperationsSource).toContain('limit: Math.max(50, messageCount)');
    expect(messageOperationsSource.indexOf('onMessagesReloaded(cached)'))
      .toBeLessThan(messageOperationsSource.indexOf('setSending(false)'));
  });

  it('通话与名片弹层自行跟随会话重置且只在真实发送成功后关闭', () => {
    expect(pageSource).toContain('useChatPageTransientActions({');
    expect(cacheSource).not.toContain('onReset');
    expect(transientSource).toContain('useEffect(() => setVisible(false), [conversationID])');
    expect(transientSource).toContain('await activeSync.messages.sendCard({');
    expect(transientSource).toContain('if (completed) setVisible(false)');
    expect(transientSource).toContain('await startOutgoingCall({');
  });

  it('Composer 与聊天头部状态由各自 owner 投影', () => {
    expect(pageSource).toContain('useChatPageComposerState({');
    expect(pageSource).toContain('useChatPageHeaderState({');
    expect(composerSource).toContain('sync.conversations.saveDraft(conversationID, document)');
    expect(composerSource).toContain('setMentionRequest({ id: mentionRequestSequenceRef.current, member })');
    expect(headerSource).toContain('useObservedUserPresence({');
    expect(headerSource).toContain('useChatGroupApplicationCount(conversation, sync, dataVersion)');
  });
});
