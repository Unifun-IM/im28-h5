import type {
  Message,
  WebIMContact,
  WebIMConversationListItem,
  WebIMJoinedGroup,
} from '@im28/im-sdk/web';

/** 首页搜索单项只携带稳定 route 所需的共享实体。 */
export type ConversationHomeSearchItem =
  | {
      readonly type: 'friend';
      readonly key: string;
      readonly title: string;
      readonly subtitle: string;
      readonly avatarURL: string;
      readonly conversationID: string;
    }
  | {
      readonly type: 'group';
      readonly key: string;
      readonly title: string;
      readonly subtitle: string;
      readonly avatarURL: string;
      readonly conversationID: string;
    }
  | {
      readonly type: 'message';
      readonly key: string;
      readonly title: string;
      readonly subtitle: string;
      readonly avatarURL: string;
      readonly conversationID: string;
      readonly messageID: string;
      readonly matchCount: number;
      readonly messagePosition: number;
    };

/** 首页搜索分区保留 RN 固定好友、群聊、聊天记录顺序。 */
export interface ConversationHomeSearchSection {
  readonly key: ConversationHomeSearchItem['type'];
  readonly title: string;
  readonly items: readonly ConversationHomeSearchItem[];
}

/** 首页搜索输入全部来自当前账号共享缓存。 */
export interface BuildConversationHomeSearchSectionsInput {
  readonly query: string;
  readonly contacts: readonly WebIMContact[];
  readonly groups: readonly WebIMJoinedGroup[];
  readonly conversations: readonly WebIMConversationListItem[];
  readonly messages: readonly Message[];
}

/** 搜索文本切片用于在 H5 视图中复刻 RN 命中着色。 */
export interface ConversationSearchTextSegment {
  readonly text: string;
  readonly highlighted: boolean;
}

/** 按 RN 规则把好友、群聊和消息缓存聚合为三个结果分区。 */
export function buildConversationHomeSearchSections(
  input: BuildConversationHomeSearchSectionsInput,
): readonly ConversationHomeSearchSection[] {
  /** query 是所有字段匹配共用的小写关键词。 */
  const query = input.query.trim().toLocaleLowerCase();
  if (!query) return [];
  /** conversationByID 供消息结果关联真实会话。 */
  const conversationByID = new Map(input.conversations.map(item => [
    item.conversation.conversationID,
    item,
  ]));
  /** singleByUserID 只接受共享会话的单聊目标身份。 */
  const singleByUserID = new Map(input.conversations
    .filter(item => item.conversation.type === 'single')
    .map(item => [item.conversation.targetID, item]));
  /** groupByGroupID 同时覆盖 target 和 Gateway 已给出的 conversation ID。 */
  const groupByGroupID = new Map(input.conversations
    .filter(item => item.conversation.type === 'group')
    .map(item => [item.conversation.targetID, item]));
  /** friendItems 只展示存在真实会话且命中可见资料的好友。 */
  const friendItems: ConversationHomeSearchItem[] = input.contacts.flatMap(contact => {
    /** conversation 是点击后可打开的当前账号真实单聊。 */
    const conversation = singleByUserID.get(contact.userID);
    if (!conversation || !matchesSearchText(query, [
      contact.displayName,
      contact.nickname,
      contact.remark,
      contact.account,
      contact.phone,
      contact.email,
      contact.userID,
    ])) return [];
    return [{
      type: 'friend',
      key: `friend-${contact.userID}`,
      title: contact.displayName,
      subtitle: buildContactSubtitle(contact, query),
      avatarURL: contact.avatarURL,
      conversationID: conversation.conversation.conversationID,
    }];
  });
  /** groupItems 只展示已加入且存在真实会话的群。 */
  const groupItems: ConversationHomeSearchItem[] = input.groups.flatMap(group => {
    /** conversation 优先按群 ID，再按服务端会话 ID关联。 */
    const conversation = groupByGroupID.get(group.groupID) ??
      (group.conversationID ? conversationByID.get(group.conversationID) : undefined);
    if (!conversation || !matchesSearchText(query, [group.name, group.groupID])) return [];
    return [{
      type: 'group',
      key: `group-${group.groupID}`,
      title: group.name || group.groupID,
      subtitle: `群ID：${group.groupID}`,
      avatarURL: group.avatarURL,
      conversationID: conversation.conversation.conversationID,
    }];
  });
  /** messagesByConversation 统计每个会话的命中数并保留最早命中用于定位。 */
  const messagesByConversation = new Map<string, Message[]>();
  for (const message of input.messages) {
    if (!conversationByID.has(message.conversationID)) continue;
    /** current 保存同一会话此前收集的命中。 */
    const current = messagesByConversation.get(message.conversationID) ?? [];
    current.push(message);
    messagesByConversation.set(message.conversationID, current);
  }
  /** messageItems 每个会话只占一行，并显示真实命中数。 */
  const messageItems: ConversationHomeSearchItem[] = [...messagesByConversation.entries()]
    .map(([conversationID, messages]) => {
      /** conversation 来自当前账号缓存，前面已保证存在。 */
      const conversation = conversationByID.get(conversationID)!;
      /** target 选择最早命中，保持 RN 点击后定位更远消息的行为。 */
      const target = [...messages].sort(compareMessagePosition)[0]!;
      /** title 延续会话 name 到 targetID 的回退顺序。 */
      const title = conversation.conversation.name?.trim() ||
        conversation.conversation.targetID || '会话';
      return {
        type: 'message',
        key: `message-${conversationID}`,
        title,
        subtitle: `共${messages.length}条相关聊天记录`,
        avatarURL: conversation.conversation.faceURL?.trim() ?? '',
        conversationID,
        messageID: target.clientMsgID,
        matchCount: messages.length,
        messagePosition: readMessagePosition(target),
      };
    });
  /** sections 过滤空分区但不改变 RN 固定顺序。 */
  const sections: ConversationHomeSearchSection[] = [
    { key: 'friend', title: '好友', items: friendItems },
    { key: 'group', title: '群聊', items: groupItems },
    { key: 'message', title: '聊天记录', items: messageItems },
  ];
  return sections.filter(section => section.items.length > 0);
}

/** 合并消息搜索分页并按会话累计命中数、保留最远定位消息。 */
export function mergeConversationHomeSearchMessageSections(
  current: readonly ConversationHomeSearchSection[],
  incoming: readonly ConversationHomeSearchSection[],
): readonly ConversationHomeSearchSection[] {
  /** incomingMessageSection 只消费下一页聊天记录，好友和群聊仍由首页快照持有。 */
  const incomingMessageSection = incoming.find(section => section.key === 'message');
  if (!incomingMessageSection?.items.length) return current;
  /** currentMessageSection 保存已渲染的会话聚合结果。 */
  const currentMessageSection = current.find(section => section.key === 'message');
  /** mergedItems 按首次出现顺序保存消息会话行。 */
  const mergedItems = [...(currentMessageSection?.items ?? [])];
  /** indexByKey 让同一会话跨页命中合并到唯一行。 */
  const indexByKey = new Map(mergedItems.map((item, index) => [item.key, index]));
  /** item 逐项合并下一页中的规范消息会话投影。 */
  for (const item of incomingMessageSection.items) {
    if (item.type !== 'message') continue;
    /** existingIndex 定位同一会话已有聚合行。 */
    const existingIndex = indexByKey.get(item.key);
    /** existing 只允许消息项参与计数合并。 */
    const existing = existingIndex === undefined ? undefined : mergedItems[existingIndex];
    if (existingIndex === undefined || existing?.type !== 'message') {
      indexByKey.set(item.key, mergedItems.length);
      mergedItems.push(item);
      continue;
    }
    /** target 保留位置更远的消息，保持 RN 点击搜索结果的定位语义。 */
    const target = item.messagePosition < existing.messagePosition ? item : existing;
    /** matchCount 累加不同 SQLite 分页中的真实命中。 */
    const matchCount = existing.matchCount + item.matchCount;
    mergedItems[existingIndex] = {
      ...target,
      matchCount,
      subtitle: `共${matchCount}条相关聊天记录`,
    };
  }
  /** mergedMessageSection 替换或追加唯一聊天记录分区。 */
  const mergedMessageSection: ConversationHomeSearchSection = {
    key: 'message',
    title: '聊天记录',
    items: mergedItems,
  };
  return currentMessageSection
    ? current.map(section => section.key === 'message' ? mergedMessageSection : section)
    : [...current, mergedMessageSection];
}

/** 维护最多十条、去重且最近优先的搜索历史。 */
export function updateConversationSearchHistory(
  history: readonly string[],
  query: string,
  limit = 10,
): readonly string[] {
  /** normalizedQuery 禁止空白历史进入 preference。 */
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return history;
  return [normalizedQuery, ...history.filter(item => item !== normalizedQuery)]
    .slice(0, Math.max(0, limit));
}

/** 判断异步搜索结果是否仍属于页面最新请求。 */
export function isCurrentConversationSearchRequest(
  currentRequestID: number,
  candidateRequestID: number,
): boolean {
  return currentRequestID === candidateRequestID;
}

/** 按 RN 规则进行大小写不敏感、支持多处命中的文本切片。 */
export function splitConversationSearchHighlightedText(
  text: string,
  keyword: string,
): readonly ConversationSearchTextSegment[] {
  /** query 去掉提交关键词两端空白。 */
  const query = keyword.trim();
  if (!text || !query) return text ? [{ text, highlighted: false }] : [];
  /** lowerText 只用于定位，不改变原始展示字符。 */
  const lowerText = text.toLocaleLowerCase();
  /** lowerQuery 与 RN 一致执行大小写不敏感匹配。 */
  const lowerQuery = query.toLocaleLowerCase();
  /** segments 保留命中与未命中文本的原始顺序。 */
  const segments: ConversationSearchTextSegment[] = [];
  /** cursor 指向下一次查找起点。 */
  let cursor = 0;
  while (cursor < text.length) {
    /** matchIndex 是本轮关键词命中的起始位置。 */
    const matchIndex = lowerText.indexOf(lowerQuery, cursor);
    if (matchIndex < 0) {
      segments.push({ text: text.slice(cursor), highlighted: false });
      break;
    }
    if (matchIndex > cursor) {
      segments.push({ text: text.slice(cursor, matchIndex), highlighted: false });
    }
    /** matchEnd 保留与提交关键词等长的原文片段。 */
    const matchEnd = matchIndex + query.length;
    segments.push({ text: text.slice(matchIndex, matchEnd), highlighted: true });
    cursor = matchEnd;
  }
  return segments;
}

/** 判断查询是否命中任一用户可见字段。 */
function matchesSearchText(query: string, values: readonly string[]): boolean {
  return values.some(value => value.toLocaleLowerCase().includes(query));
}

/** 根据命中字段提供 RN 搜索行副标题。 */
function buildContactSubtitle(contact: WebIMContact, query: string): string {
  /** candidates 按账号、手机号、邮箱、ID 的可辨认顺序检查。 */
  const candidates: readonly [string, string][] = [
    ['账号', contact.account],
    ['手机号', contact.phone],
    ['邮箱', contact.email],
    ['ID', contact.userID],
  ];
  /** matched 是第一个实际命中查询的资料字段。 */
  const matched = candidates.find(([, value]) =>
    value.toLocaleLowerCase().includes(query));
  return matched ? `${matched[0]}：${matched[1]}` : `ID：${contact.userID}`;
}

/** 按稳定 seq 优先、发送时间回退比较消息位置。 */
function compareMessagePosition(left: Message, right: Message): number {
  return readMessagePosition(left) - readMessagePosition(right);
}

/** 读取消息定位顺序，优先稳定 seq 并回退发送时间。 */
function readMessagePosition(message: Message): number {
  return message.seq ?? message.sendTime;
}
