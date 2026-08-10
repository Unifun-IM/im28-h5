import type {
  Conversation,
  Message,
  WebIMConversationListItem,
} from '@im28/im-sdk/web';

/** 会话列表摘要同时标记草稿语义，供行组件使用 RN 对应颜色。 */
export interface ConversationListPreview {
  readonly isDraft: boolean;
  readonly text: string;
}

/** RN 会话预览中有固定文案的消息类型。 */
const MESSAGE_PREVIEW_LABELS: Readonly<Record<number, string>> = {
  102: '[图片]',
  103: '[语音]',
  104: '[视频]',
  105: '[文件]',
  108: '[名片]',
  109: '[位置]',
  110: '[自定义消息]',
  113: '[正在输入]',
  115: '[自定义表情]',
  1200: '新的好友申请',
};

/** 使用 RN 相同的 name -> title 回退顺序。 */
export function getConversationTitle(conversation: Conversation): string {
  return conversation.name?.trim() || conversation.targetID || '会话';
}

/** 将会话草稿和最新消息转换为 RN 会话行摘要。 */
export function getConversationListPreview(
  item: WebIMConversationListItem,
): ConversationListPreview {
  // draft 延续 RN 优先显示草稿的规则。
  const draft = item.conversation.draft?.trim();
  if (draft) {
    return { isDraft: true, text: draft };
  }
  return {
    isDraft: false,
    text: getMessagePreviewText(item.latestMessage),
  };
}

/** 静音会话用条数前缀表达未读，保持 RN 行内信息层级。 */
export function getConversationDisplayPreview(
  item: WebIMConversationListItem,
): ConversationListPreview {
  // preview 先处理草稿与具体消息类型。
  const preview = getConversationListPreview(item);
  // unread 只接受非负整数用于界面展示。
  const unread = Math.max(0, Math.trunc(item.conversation.unreadCount));
  if (preview.isDraft || !item.conversation.isMuted || unread <= 0) {
    return preview;
  }
  return { ...preview, text: `[${unread}条]${preview.text}` };
}

/** 按标题和当前摘要执行 RN 组件已有的本地搜索分支。 */
export function filterConversationListItems(
  items: readonly WebIMConversationListItem[],
  keyword: string,
): readonly WebIMConversationListItem[] {
  // query 统一 trim/lowercase，空值直接保留 Repository 排序。
  const query = keyword.trim().toLocaleLowerCase();
  if (!query) {
    return items;
  }
  return items.filter(item => {
    // searchableText 只组合用户当前可见的标题和摘要。
    const searchableText = `${getConversationTitle(item.conversation)} ${getConversationListPreview(item).text}`.toLocaleLowerCase();
    return searchableText.includes(query);
  });
}

/** 汇总非静音会话未读数，供 RN 标题“聊天(n)”展示。 */
export function getConversationUnreadTotal(
  items: readonly WebIMConversationListItem[],
): number {
  return items.reduce(
    (total, item) =>
      item.conversation.isMuted
        ? total
        : total + Math.max(0, Math.trunc(item.conversation.unreadCount)),
    0,
  );
}

/** 将未读数限制为 RN 会话 badge 的 999+ 上限。 */
export function formatConversationUnread(unreadCount: number): string {
  // unread 是经过界面容错后的非负整数。
  const unread = Math.max(0, Math.trunc(unreadCount));
  return unread > 999 ? '999+' : String(unread);
}

/** 将秒或毫秒时间戳格式化为 RN 会话列表时间。 */
export function formatConversationListTime(
  timestamp: number,
  now = new Date(),
): string {
  if (!timestamp) {
    return '';
  }
  // milliseconds 同时兼容 Gateway 秒和本地毫秒时间戳。
  const milliseconds =
    timestamp > 1_000_000_000_000 ? timestamp : timestamp * 1000;
  // date 是当前行最新消息的本地时间表示。
  const date = new Date(milliseconds);
  if (date.toDateString() === now.toDateString()) {
    return `今日 ${formatClock(date)}`;
  }
  // yesterday 只用于与 RN 相同的昨日标签判断。
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨日 ${formatClock(date)}`;
  }
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

/** 格式化固定两位小时和分钟。 */
function formatClock(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/** 将共享消息 body 映射为会话列表可读摘要。 */
function getMessagePreviewText(message: Message | null): string {
  if (!message || message.contentType === 0) {
    return '暂无消息';
  }
  if (message.status === 'revoked') {
    return '消息已撤回';
  }
  // knownLabel 对齐 RN 媒体和业务消息的固定摘要。
  const knownLabel = MESSAGE_PREVIEW_LABELS[message.contentType];
  if (knownLabel) {
    return knownLabel;
  }
  // payload 是 shared mapper 已归一化后的 Gateway message body。
  const payload = asRecord(message.payload);
  return (
    readNestedString(payload, 'text', 'text') ??
    readNestedString(payload, 'mention', 'text') ??
    readNestedString(payload, 'markdown', 'text') ??
    readNestedString(payload, 'quote', 'reply_text') ??
    readNestedString(payload, 'quote', 'text') ??
    readNestedString(payload, 'textElem', 'content') ??
    readNestedString(payload, 'textElem', 'text') ??
    readNestedString(payload, 'system', 'text') ??
    `[contentType=${message.contentType}]`
  );
}

/** 将未知值安全收窄为普通对象。 */
function asRecord(value: unknown): Readonly<Record<string, unknown>> {
  return value !== null && typeof value === 'object'
    ? (value as Readonly<Record<string, unknown>>)
    : {};
}

/** 从两层 Gateway body 路径读取非空字符串。 */
function readNestedString(
  source: Readonly<Record<string, unknown>>,
  ownerKey: string,
  valueKey: string,
): string | null {
  // owner 保存指定消息体分支的安全对象形态。
  const owner = asRecord(source[ownerKey]);
  // value 只接受可直接展示的字符串值。
  const value = owner[valueKey];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}
