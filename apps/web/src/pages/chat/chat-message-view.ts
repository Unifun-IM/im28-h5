import type { Message, PresetEmojiEntity } from '@im28/im-sdk/web';
import { getChatAutoDeleteSystemText } from './chat-auto-delete-system-view.js';
/** Chat 消息正文在浏览器中的受控呈现类型。 */
export type ChatMessageViewKind =
  | 'system'
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'file'
  | 'card'
  | 'emoji'
  | 'quote'
  | 'unsupported';

/** 从 Gateway message body 安全提取的只读展示模型。 */
export interface ChatMessageView {
  readonly kind: ChatMessageViewKind;
  readonly text: string;
  readonly detail?: string;
  readonly mediaURL?: string;
  readonly thumbnailURL?: string;
  readonly emojiID?: string;
  readonly quoteMessageID?: string;
  readonly entities?: readonly PresetEmojiEntity[];
}

/** RN 居中呈现的群系统消息类型集合。 */
const GROUP_SYSTEM_MESSAGE_TYPES = new Set([
  1501, 1502, 1504, 1507, 1508, 1509, 1510, 1511, 1512, 1513, 1514,
  1515, 1519, 1520, 1521, 1701,
]);

/** 缺少完整成员资料时仍可稳定展示的 RN 系统文案。 */
const SYSTEM_MESSAGE_FALLBACKS: Readonly<Record<number, string>> = {
  1201: '你们已经成为好友，可以开始聊天了',
  1501: '群聊已创建',
  1502: '群资料已更新',
  1504: '群成员退出群聊',
  1507: '群主已转让',
  1508: '群成员已被移出群聊',
  1509: '新成员加入群聊',
  1510: '新成员加入群聊',
  1511: '群聊已解散',
  1512: '群成员已被禁言',
  1513: '群成员已解除禁言',
  1514: '已开启全员禁言',
  1515: '已关闭全员禁言',
  1519: '群公告已更新',
  1520: '群名称已更新',
  1521: '群简介已更新',
  1701: '阅后即焚设置已更新',
};

/** 将共享 Message body 映射为 RN 对应的消息正文类别。 */
export function getChatMessageView(
  message: Message,
  isGroup: boolean,
  currentUserID = '',
): ChatMessageView {
  if (message.status === 'revoked') {
    return { kind: 'system', text: '消息已撤回' };
  }
  if (message.status === 'deleted_local') {
    return { kind: 'system', text: '消息已删除' };
  }
  // body 是 shared mapper 保存的 Gateway MessageBody。
  const body = asRecord(message.payload);
  // systemText 优先使用服务端兼容文案，业务判断仍基于 contentType。
  const systemText = readNestedString(body, 'system', 'text');
  if (message.contentType === 1701) {
    return {
      kind: 'system',
      text:
        getChatAutoDeleteSystemText(message, currentUserID) ||
        systemText ||
        SYSTEM_MESSAGE_FALLBACKS[1701] ||
        '消息自动删除设置已更新',
    };
  }
  if (
    message.contentType === 1201 ||
    (isGroup && GROUP_SYSTEM_MESSAGE_TYPES.has(message.contentType))
  ) {
    return {
      kind: 'system',
      text:
        systemText ||
        SYSTEM_MESSAGE_FALLBACKS[message.contentType] ||
        '群通知',
    };
  }
  if (message.contentType === 102) {
    // image 读取第一张图，与 RN 当前单图气泡主路径一致。
    const image = readFirstRecord(asRecord(body.image).list);
    return {
      kind: 'image',
      text: '[图片]',
      mediaURL: readString(image.url),
      thumbnailURL: readString(image.thumbnail_url) || readString(image.url),
    };
  }
  if (message.contentType === 103) {
    // audio 使用协议中的真实 URL 和秒数形成可播放语音气泡。
    const audio = asRecord(body.audio ?? body.sound);
    return {
      kind: 'audio',
      text: '[语音]',
      mediaURL: readString(audio.url),
      detail: formatDuration(readNumber(audio.duration_seconds ?? audio.duration)),
    };
  }
  if (message.contentType === 104) {
    // video 保留真实缩略图和时长，不创建无 owner 的播放动作。
    const video = asRecord(body.video);
    return {
      kind: 'video',
      text: '[视频]',
      mediaURL: readString(video.url),
      thumbnailURL: readString(video.thumbnail_url),
      detail: formatDuration(readNumber(video.duration_seconds)),
    };
  }
  if (message.contentType === 105) {
    // file 保留已持久化 URL 和元数据，浏览器平台层负责预览下载。
    const file = asRecord(body.file);
    return {
      kind: 'file',
      text: readString(file.name) || '文件',
      detail: formatFileSize(file.size_bytes),
      mediaURL: readString(file.url),
    };
  }
  if (message.contentType === 108) {
    return readCardMessageView(body);
  }
  if (message.contentType === 115) {
    // emoji URL 是 Gateway 消息快照，可直接作为只读内容展示。
    const emoji = asRecord(body.emoji);
    return {
      kind: 'emoji',
      text: '[表情]',
      emojiID: readString(emoji.emoji_id),
      mediaURL: readString(emoji.url),
    };
  }
  if (message.contentType === 114) {
    // quote 保留来源稳定 ID、发送时快照和回复正文三个独立字段。
    const quote = asRecord(body.quote);
    return {
      kind: 'quote',
      text: readString(quote.reply_text) || '引用消息',
      detail: readString(quote.text),
      quoteMessageID: readString(quote.msg_id),
    };
  }
  if (message.contentType === 113) {
    return { kind: 'system', text: '对方正在输入' };
  }
  // text 覆盖文本、@、Markdown 和兼容 OpenIM textElem。
  const text =
    readNestedText(body, 'text', 'text') ||
    readNestedText(body, 'mention', 'text') ||
    readNestedText(body, 'markdown', 'text') ||
    readNestedText(body, 'textElem', 'content') ||
    readNestedText(body, 'textElem', 'text');
  if (text) {
    return {
      kind: 'text',
      text,
      ...(message.entities?.length ? { entities: message.entities } : {}),
    };
  }
  // customText 仅提取协议可见文案，不解析为可交互通话能力。
  const customText = readCustomMessageText(body);
  if (customText) {
    return { kind: 'text', text: customText };
  }
  return {
    kind: 'unsupported',
    text: `[暂不支持的消息 · ${message.contentType}]`,
  };
}

/** 使用 RN 的短时钟格式呈现消息时间。 */
export function formatChatMessageTime(timestamp: number): string {
  if (!timestamp) return '';
  // date 同时兼容 Gateway 秒时间戳和本地毫秒时间戳。
  const date = new Date(toMilliseconds(timestamp));
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
}

/** 将名片结构转换为只读卡片摘要。 */
function readCardMessageView(
  body: Readonly<Record<string, unknown>>,
): ChatMessageView {
  // card 是 Gateway 规范的 user/group union。
  const card = asRecord(body.card);
  // group 优先于 user 读取群卡片字段。
  const group = asRecord(card.group);
  if (Object.keys(group).length) {
    return {
      kind: 'card',
      text: readString(group.title) || readString(group.group_id) || '群聊名片',
      detail: readString(group.group_id),
      mediaURL: readString(group.avatar_url),
    };
  }
  // user 保存用户名片快照。
  const user = asRecord(card.user);
  return {
    kind: 'card',
    text: readString(user.nickname) || readString(user.user_id) || '个人名片',
    detail: readString(user.user_id),
    mediaURL: readString(user.avatar_url),
  };
}

/** 从 custom.data 的 JSON 快照读取通话等业务可见文案。 */
function readCustomMessageText(
  body: Readonly<Record<string, unknown>>,
): string {
  // custom 保存 key 与 JSON string data。
  const custom = asRecord(body.custom);
  // rawData 只接受协议规定的字符串。
  const rawData = readString(custom.data);
  if (!rawData) return '';
  try {
    // parsed 用于读取服务端已冻结的 status_text/reason。
    const parsed = asRecord(JSON.parse(rawData));
    return (
      readString(parsed.status_text) ||
      readString(parsed.reason) ||
      (readString(custom.key).startsWith('rtc.call.') ? '[通话]' : '')
    );
  } catch {
    return '';
  }
}

/** 格式化语音或视频秒数。 */
function formatDuration(value: number): string {
  if (value <= 0) return '';
  // seconds 仅保留非负整数。
  const seconds = Math.max(0, Math.round(value));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/** 格式化文件字节大小。 */
function formatFileSize(value: unknown): string {
  // size 同时兼容 uint64 string 和 number。
  const size = readNumber(value);
  if (size <= 0) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

/** 秒或毫秒时间戳统一转换为毫秒。 */
function toMilliseconds(timestamp: number): number {
  return timestamp > 1_000_000_000_000 ? timestamp : timestamp * 1000;
}

/** 将未知值安全收窄为普通对象。 */
function asRecord(value: unknown): Readonly<Record<string, unknown>> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Readonly<Record<string, unknown>>)
    : {};
}

/** 从未知数组读取首个对象。 */
function readFirstRecord(value: unknown): Readonly<Record<string, unknown>> {
  return Array.isArray(value) ? asRecord(value[0]) : {};
}

/** 从两层消息体路径读取非空字符串。 */
function readNestedString(
  source: Readonly<Record<string, unknown>>,
  ownerKey: string,
  valueKey: string,
): string {
  // owner 是指定 body 分支的安全对象。
  const owner = asRecord(source[ownerKey]);
  return readString(owner[valueKey]);
}

/** 从消息正文路径读取非空原文，避免破坏实体 UTF-16 偏移。 */
function readNestedText(
  source: Readonly<Record<string, unknown>>,
  ownerKey: string,
  valueKey: string,
): string {
  // owner 是指定正文分支的安全对象。
  const owner = asRecord(source[ownerKey]);
  // value 仅用空白判断有效性，返回时保留协议原文。
  const value = owner[valueKey];
  return typeof value === 'string' && value.trim() ? value : '';
}

/** 将未知值收窄为去空白字符串。 */
function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** 将未知数值转换为有限 number。 */
function readNumber(value: unknown): number {
  // numberValue 统一处理 number 与 uint64 string。
  const numberValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}
