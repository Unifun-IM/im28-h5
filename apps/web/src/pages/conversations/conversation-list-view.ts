import type {
  Conversation,
  Message,
  PresetEmojiEntity,
  WebIMConversationListItem,
} from '@im28/im-sdk/web';
import {
  formatIMUserDisplayName,
  getIMFriendAddedMessageText,
  isIMGroupSystemMessageType,
  parseIMGroupSystemMessagePresentation,
  projectPresetEmojiEntitiesToDisplayText,
  readIMConversationDraftDocument,
} from '@im28/im-sdk/web';
import { isConversationAtSelfPreview } from './conversation-unread-view.js';

/** 会话列表摘要同时标记草稿语义，供行组件使用 RN 对应颜色。 */
export interface ConversationListPreview {
  readonly isDraft: boolean;
  readonly text: string;
  readonly entities?: readonly PresetEmojiEntity[];
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
  /** cachedName 允许旧缓存中保留完整用户 ID，但不把它直接暴露给用户。 */
  const cachedName = conversation.name?.trim() ?? '';
  if (conversation.type === 'single' && (!cachedName || cachedName === conversation.targetID)) {
    return formatIMUserDisplayName(conversation.targetID) || '会话';
  }
  return cachedName || conversation.targetID || '会话';
}

/** 将会话草稿和最新消息转换为 RN 会话行摘要。 */
export function getConversationListPreview(
  item: WebIMConversationListItem,
  currentUserID = '',
): ConversationListPreview {
  // draft 延续 RN 优先显示草稿的规则。
  /** draftDocument 由 SDK 唯一解释正文与专用 SQLite entity 列。 */
  const draftDocument = readIMConversationDraftDocument(item.conversation);
  if (draftDocument.text) {
    return {
      isDraft: true,
      text: draftDocument.text,
      ...(draftDocument.entities.length
        ? { entities: draftDocument.entities }
        : {}),
    };
  }
  /** message 在当前账号存在有效未读提醒时优先于最新普通消息。 */
  const message = currentUserID.trim() && item.unreadMention
    ? item.unreadMention.message
    : item.latestMessage;
  /** preview 是消息类型和 entity 已完成基础投影的摘要。 */
  const preview: ConversationListPreview = {
    isDraft: false,
    text: getMessagePreviewText(message, currentUserID),
    ...(message?.entities?.length
      ? { entities: message.entities }
      : {}),
  };
  /** mentionPreview 继续优先承载 RN 的 @我/所有人专用前缀。 */
  const mentionPreview = projectMentionPreview(
    item,
    message,
    preview,
    currentUserID,
  );
  if (mentionPreview !== preview) return mentionPreview;
  return projectGroupSenderPreview(item, message, preview, currentUserID);
}

/** 静音会话用条数前缀表达未读，保持 RN 行内信息层级。 */
export function getConversationDisplayPreview(
  item: WebIMConversationListItem,
  currentUserID = '',
): ConversationListPreview {
  // preview 先处理草稿与具体消息类型。
  const preview = getConversationListPreview(item, currentUserID);
  // unread 只接受非负整数用于界面展示。
  const unread = Math.max(0, Math.trunc(item.conversation.unreadCount));
  if (
    preview.isDraft ||
    isConversationAtSelfPreview(preview.text) ||
    !item.conversation.isMuted ||
    unread <= 0
  ) {
    return preview;
  }
  /** text 是用户最终看到的免打扰前缀与正文组合。 */
  const text = `[${unread}条]${preview.text}`;
  return {
    ...preview,
    text,
    entities: projectPresetEmojiEntitiesToDisplayText({
      sourceText: preview.text,
      sourceEntities: preview.entities ?? [],
      displayText: text,
    }),
  };
}

/** 将消息级 mention 身份投影为 RN 会话列表提醒。 */
function projectMentionPreview(
  item: WebIMConversationListItem,
  message: Message | null,
  preview: ConversationListPreview,
  currentUserID: string,
): ConversationListPreview {
  /** userID 为空时禁止用展示文本猜测当前账号。 */
  const userID = currentUserID.trim();
  /** message 只接受 shared facade 选出的稳定 mention 身份。 */
  if (!userID || item.conversation.type !== 'group' || !message?.mentions?.length) {
    return preview;
  }
  /** mention 优先识别 @所有人，否则查找当前用户稳定 ID。 */
  const mention = message.mentions.find(target => target.type === 'all') ??
    message.mentions.find(target => target.type === 'user' && target.userID === userID);
  if (!mention) return preview;
  /** bodyText 将当前用户的历史昵称快照替换为 RN 的 @我。 */
  const bodyText = mention.type === 'user' && mention.nickname
    ? replaceMentionNickname(preview.text, mention.nickname)
    : preview.text;
  /** unreadSenderDisplayName 只属于同一未读 mention 快照。 */
  const unreadSenderDisplayName = item.unreadMention?.message.clientMsgID === message.clientMsgID
    ? item.unreadMention.senderDisplayName?.trim()
    : '';
  /** latestSenderDisplayName 只在当前消息就是最新消息时作为 shared 缓存回退。 */
  const latestSenderDisplayName = item.latestMessage?.clientMsgID === message.clientMsgID
    ? message.senderID.trim() === userID
      ? '我'
      : item.latestSenderDisplayName?.trim()
    : '';
  /** senderDisplayName 优先使用未读窗口对应的精确发送人快照。 */
  const senderDisplayName = unreadSenderDisplayName || latestSenderDisplayName;
  /** messageText 对齐 RN 群摘要的“发送人：正文”格式。 */
  const messageText = senderDisplayName
    ? `${senderDisplayName}：${bodyText}`
    : bodyText;
  /** prefix 区分群发提醒与单人提醒。 */
  const prefix = mention.type === 'all' ? '[所有人]' : '[有人@我]';
  /** text 是会话行最终可见摘要。 */
  const text = `${prefix}${messageText}`;
  return {
    ...preview,
    text,
    ...(preview.entities?.length
      ? {
          entities: projectPresetEmojiEntitiesToDisplayText({
            sourceText: preview.text,
            sourceEntities: preview.entities,
            displayText: text,
          }),
        }
      : {}),
  };
}

/** 为普通群最新消息补入 RN 的发送人前缀并同步表情区间。 */
function projectGroupSenderPreview(
  item: WebIMConversationListItem,
  message: Message | null,
  preview: ConversationListPreview,
  currentUserID: string,
): ConversationListPreview {
  if (
    item.conversation.type !== 'group' ||
    !message ||
    message.contentType === 0 ||
    message.status === 'revoked' ||
    isIMGroupSystemMessageType(message.contentType) ||
    parseIMGroupSystemMessagePresentation(message, currentUserID) ||
    getIMFriendAddedMessageText(message.contentType)
  ) {
    return preview;
  }
  /** senderName 对本人固定显示“我”，其他成员只消费 SDK 已解析名称。 */
  const senderName = message.senderID.trim() === currentUserID.trim() &&
    currentUserID.trim()
    ? '我'
    : item.latestSenderDisplayName?.trim() ?? '';
  if (!senderName) return preview;
  /** text 是群会话行最终展示的发送人和正文组合。 */
  const text = `${senderName}：${preview.text}`;
  return {
    ...preview,
    text,
    ...(preview.entities?.length
      ? {
          entities: projectPresetEmojiEntitiesToDisplayText({
            sourceText: preview.text,
            sourceEntities: preview.entities,
            displayText: text,
          }),
        }
      : {}),
  };
}

/** 将当前用户的 mention 昵称快照替换为统一 @我 文案。 */
function replaceMentionNickname(text: string, nickname: string): string {
  /** token 只替换带 @ 前缀的完整快照，避免误改普通正文昵称。 */
  const token = `@${nickname.trim()}`;
  return token === '@' ? text : text.split(token).join('@我');
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

/** 按 RN 循环规则选择当前可见位置之后的下一条未读会话。 */
export function getNextUnreadConversationID(
  items: readonly WebIMConversationListItem[],
  lastTargetConversationID: string,
  firstVisibleIndex: number,
): string {
  /** unreadItems 保留列表原顺序和索引，手动未读也视为未读状态。 */
  const unreadItems = items.flatMap((item, index) => (
    Math.max(0, Math.trunc(item.conversation.unreadCount)) > 0 ||
    item.conversation.manualUnread === true
      ? [{ conversationID: item.conversation.conversationID, index }]
      : []
  ));
  if (!unreadItems.length) return '';
  /** lastTargetIndex 存在时直接循环到下一条未读。 */
  const lastTargetIndex = unreadItems.findIndex(
    item => item.conversationID === lastTargetConversationID,
  );
  if (lastTargetIndex >= 0) {
    return unreadItems[(lastTargetIndex + 1) % unreadItems.length]?.conversationID ?? '';
  }
  /** nextVisible 优先选首个可见会话之后的未读项，无结果则回到第一条。 */
  const nextVisible = unreadItems.find(item => item.index > firstVisibleIndex);
  return (nextVisible ?? unreadItems[0])?.conversationID ?? '';
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
function getMessagePreviewText(message: Message | null, currentUserID: string): string {
  if (!message || message.contentType === 0) {
    return '暂无消息';
  }
  if (message.status === 'revoked') {
    return '消息已撤回';
  }
  /** groupSystem 与聊天页共用 SDK 结构化系统文案 owner。 */
  const groupSystem = parseIMGroupSystemMessagePresentation(message, currentUserID);
  if (groupSystem) return groupSystem.text;
  /** friendAddedText 与聊天页共用 SDK 的 type1201 固定投影。 */
  const friendAddedText = getIMFriendAddedMessageText(message.contentType);
  if (friendAddedText) return friendAddedText;
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
  return typeof value === 'string' && value.trim() ? value : null;
}
