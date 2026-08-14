import type { Conversation, WebIMConversationSync } from '@im28/im-sdk/web';

import { getConversationTitle } from '../conversations/conversation-list-view.js';

/** H5 清空 scope 直接从共享 facade 推导，禁止复制协议枚举。 */
export type ChatClearHistoryScope = Parameters<
  WebIMConversationSync['clear']
>[0]['scope'];

/** RN 清空确认层所需的稳定文案和权限投影。 */
export interface ChatClearHistorySheetView {
  readonly hint: string;
  readonly selfLabel: string;
  readonly allLabel: string;
  readonly showAll: boolean;
  readonly allScope: 'both' | 'all_members';
}

/** 根据共享会话类型和已确认权限生成 RN 同源清空选项。 */
export function buildChatClearHistorySheetView(
  conversation: Conversation,
  canClearForAll: boolean,
): ChatClearHistorySheetView {
  /** title 只用于单聊确认文案，缺失时保持稳定回退。 */
  const title = getConversationTitle(conversation);
  if (conversation.type === 'group') {
    return {
      hint: '你确定要清空当前群聊记录 ?',
      selfLabel: '仅在我的设备中删除',
      allLabel: '为我和所有群成员删除',
      showAll: canClearForAll,
      allScope: 'all_members',
    };
  }
  return {
    hint: `你确定要删除与 ${title} 的聊天记录 ?`,
    selfLabel: '仅在我的设备中删除',
    allLabel: `为我和 ${title} 删除`,
    showAll: true,
    allScope: 'both',
  };
}

/** 页面确认后只调用聚合 sync 的共享清空 facade。 */
export function clearChatHistory(
  conversations: Pick<WebIMConversationSync, 'clear'>,
  conversationID: string,
  scope: ChatClearHistoryScope,
): Promise<Conversation> {
  return conversations.clear({ conversationID, scope });
}
