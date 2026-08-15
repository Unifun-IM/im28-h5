import { describe, expect, it } from 'vitest';

/** flowSource 用于确认转发编排不再直接恢复缓存。 */
import flowSource from './useChatForwardFlow.ts?raw';
/** pendingSource 用于确认待发送恢复链集中在唯一 Hook。 */
import pendingSource from './useChatPendingForward.ts?raw';

/** 待转发缓存恢复必须有唯一 owner，发送编排不得重新持有读取链。 */
describe('chat pending forward owner', () => {
  it('将稳定来源 ID、缓存恢复和发送者名称解析集中到专用 Hook', () => {
    expect(flowSource).toContain('useChatPendingForward({');
    expect(flowSource).not.toContain("export type { ChatPendingForward }");
    expect(flowSource).not.toContain('getCachedByClientMsgIDs');
    expect(flowSource).not.toContain('resolveChatForwardSenderNames');
    expect(pendingSource).toContain('sync.messages.getCachedByClientMsgIDs(routeState.sourceClientMsgIDs)');
    expect(pendingSource).toContain('sync.conversations.listCached({ limit: 500 })');
    expect(pendingSource).toContain('sync.groupMembers.listCached(sourceConversation.targetID)');
    expect(pendingSource).toContain('resolveChatForwardSenderNames(cached, {');
  });

  it('恢复 owner 不接管 Router、目标选择或最终发送 facade', () => {
    expect(pendingSource).not.toMatch(/useNavigate|useLocation|prepareChatForwardTargetDestination/);
    expect(pendingSource).not.toContain('messages.forward');
    expect(flowSource).toContain('activeSync.messages.forward({');
    expect(flowSource).toContain('navigate(destination.pathname, { state: destination.state })');
  });
});
