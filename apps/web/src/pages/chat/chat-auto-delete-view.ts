import type {
  Conversation,
  ConversationAutoDeleteSeconds,
  WebIMJoinedGroup,
} from '@im28/im-sdk/web';

/** RN 自动删除选择页公开的选项。 */
export interface ChatAutoDeleteOption {
  readonly label: string;
  readonly seconds: ConversationAutoDeleteSeconds;
}

/** RN 页面只展示产品已启用的九个自动删除档位。 */
export const CHAT_AUTO_DELETE_OPTIONS: readonly ChatAutoDeleteOption[] = [
  { label: '停用定时删除', seconds: 0 },
  { label: '6小时', seconds: 21_600 },
  { label: '12小时', seconds: 43_200 },
  { label: '1天', seconds: 86_400 },
  { label: '3天', seconds: 259_200 },
  { label: '7天', seconds: 604_800 },
  { label: '1个月', seconds: 2_592_000 },
  { label: '3个月', seconds: 7_776_000 },
  { label: '6个月', seconds: 15_552_000 },
];

/** 判断当前会话快照是否允许展示自动删除管理入口。 */
export function canManageChatAutoDelete(
  conversation: Conversation,
  group: WebIMJoinedGroup | null,
): boolean {
  if (conversation.type !== 'group') return true;
  if (!group || group.groupID !== conversation.targetID) return false;
  return group.permissions.canClearMessages;
}

/** 将缓存秒数格式化为 RN 设置列表值。 */
export function formatChatAutoDeleteValue(seconds: number | undefined): string {
  /** option 只匹配页面明确展示的产品档位。 */
  const option = CHAT_AUTO_DELETE_OPTIONS.find(item => item.seconds === seconds);
  return option?.label ?? '未设置';
}

/** 将缓存值收窄为 RN 可提交档位，协议有效但未展示的值保持未选中。 */
export function normalizeChatAutoDeleteSelection(
  seconds: number | undefined,
): ConversationAutoDeleteSeconds | null {
  /** option 只接受 RN 页面当前允许显式提交的档位。 */
  const option = CHAT_AUTO_DELETE_OPTIONS.find(item => item.seconds === seconds);
  return option?.seconds ?? null;
}
