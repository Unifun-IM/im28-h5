import {
  reconcilePresetEmojiEntitiesAfterTextChange,
  resolveIMGroupMemberDisplayName,
  type MessageMention,
  type PresetEmojiDocument,
  type WebIMGroupMember,
} from '@im28/im-sdk/web';

/** Composer 保存的稳定提及选择。 */
export interface ChatMentionSelection extends MessageMention {
  readonly key: string;
}

/** RN @候选面板使用的展示项。 */
export interface ChatMentionPickerItem {
  readonly key: string;
  readonly label: string;
  readonly description: string;
  readonly avatarURL: string;
  readonly mention: ChatMentionSelection;
}

/** 当前光标前未完成的 @ 查询区间。 */
export interface ChatActiveMentionQuery {
  readonly start: number;
  readonly end: number;
  readonly query: string;
}

/** 一次提及插入返回新文档和折叠光标。 */
export interface ChatMentionInsertResult {
  readonly document: PresetEmojiDocument;
  readonly cursor: number;
}

/** 查找当前光标前最后一个不含空白的 @ 查询。 */
export function getActiveChatMentionQuery(
  text: string,
  cursor: number,
): ChatActiveMentionQuery | null {
  /** safeCursor 限制在 UTF-16 文本范围。 */
  const safeCursor = Math.max(0, Math.min(text.length, Math.trunc(cursor)));
  /** prefix 隔离光标前内容，光标后文本不参与候选。 */
  const prefix = text.slice(0, safeCursor);
  /** start 是最后一个 @ 的 UTF-16 位置。 */
  const start = prefix.lastIndexOf('@');
  if (start < 0) return null;
  /** query 只允许连续无空白文本。 */
  const query = prefix.slice(start + 1);
  if (/\s/u.test(query)) return null;
  return { start, end: safeCursor, query };
}

/** 按 RN 顺序构造所有人和成员候选。 */
export function buildChatMentionPickerItems(options: {
  readonly members: readonly WebIMGroupMember[];
  readonly selfID: string;
  readonly canMentionAll: boolean;
  readonly query: string;
  readonly limit?: number;
}): readonly ChatMentionPickerItem[] {
  /** query 使用大小写不敏感匹配昵称和 user ID。 */
  const query = options.query.trim().toLocaleLowerCase();
  /** items 保持所有人优先、成员按 SDK cache 顺序。 */
  const items: ChatMentionPickerItem[] = [];
  if (options.canMentionAll && (!query || '所有人'.includes(query))) {
    items.push({
      key: 'all',
      label: '所有人',
      description: '通知群内所有成员',
      avatarURL: '',
      mention: { key: 'all', type: 'all', nickname: '所有人' },
    });
  }
  options.members
    .filter(member => member.userID !== options.selfID)
    .filter(member => {
      /** displayName 复用 SDK 的备注、群昵称、公开昵称优先级。 */
      const displayName = resolveIMGroupMemberDisplayName(member, member.userID);
      return !query || displayName.toLocaleLowerCase().includes(query) ||
        member.userID.toLocaleLowerCase().includes(query);
    })
    .slice(0, options.limit ?? 30)
    .forEach(member => {
      /** displayName 是 picker 与发送快照共用的当前可见名称。 */
      const displayName = resolveIMGroupMemberDisplayName(member, member.userID);
      items.push({
        key: `user:${member.userID}`,
        label: displayName,
        description: member.userID,
        avatarURL: member.avatarURL,
        mention: {
          key: `user:${member.userID}`,
          type: 'user',
          userID: member.userID,
          nickname: displayName,
        },
      });
    });
  return items;
}

/** 用完整提及标签替换当前 @ 查询并同步 preset entity 偏移。 */
export function insertChatMention(
  document: PresetEmojiDocument,
  query: ChatActiveMentionQuery,
  item: ChatMentionPickerItem,
): ChatMentionInsertResult {
  /** insertedText 与 RN 一致在名称后补空格。 */
  const insertedText = `@${item.label} `;
  /** text 保留光标后的原草稿。 */
  const text = `${document.text.slice(0, query.start)}${insertedText}${document.text.slice(query.end)}`;
  /** cursor 折叠到插入标签末尾。 */
  const cursor = query.start + insertedText.length;
  return {
    document: reconcilePresetEmojiEntitiesAfterTextChange(document, text),
    cursor,
  };
}

/** 只返回正文仍包含可见标签的提及目标。 */
export function collectVisibleChatMentions(
  text: string,
  selections: readonly ChatMentionSelection[],
  canMentionAll: boolean,
): readonly MessageMention[] {
  return selections
    .filter(selection => selection.type === 'all'
      ? canMentionAll && text.includes('@所有人')
      : Boolean(selection.userID && selection.nickname && text.includes(`@${selection.nickname}`)))
    .map(({ key: _key, ...mention }) => mention);
}
