import { useMemo, useState, type RefObject } from 'react';
import type {
  MessageMention,
  PresetEmojiDocument,
  WebIMGroupMember,
} from '@im28/im-sdk/web';

import {
  buildChatMentionPickerItems,
  collectVisibleChatMentions,
  getActiveChatMentionQuery,
  insertChatMention,
  type ChatMentionPickerItem,
  type ChatMentionSelection,
} from './chat-mention-composer.js';

/** Composer mention hook 参数。 */
interface UseChatComposerMentionsOptions {
  readonly enabled: boolean;
  readonly document: PresetEmojiDocument;
  readonly onChangeDocument: (document: PresetEmojiDocument) => void;
  readonly textareaRef: RefObject<HTMLTextAreaElement | null>;
  readonly members: readonly WebIMGroupMember[];
  readonly selfID: string;
  readonly canMentionAll: boolean;
}

/** Composer 可消费的 mention 交互。 */
interface ChatComposerMentions {
  readonly items: readonly ChatMentionPickerItem[];
  readonly select: (item: ChatMentionPickerItem) => void;
  readonly collect: (text: string) => readonly MessageMention[];
  readonly clear: () => void;
}

/** 管理当前草稿的 @ 查询、稳定选择和 DOM 光标恢复。 */
export function useChatComposerMentions(options: UseChatComposerMentionsOptions): ChatComposerMentions {
  // selections 只保存用户明确选择过的稳定身份。
  const [selections, setSelections] = useState<readonly ChatMentionSelection[]>([]);
  /** cursor 使用当前 textarea selection，未聚焦时回退末尾。 */
  const cursor = options.textareaRef.current?.selectionStart ?? options.document.text.length;
  /** query 在编辑/引用或非群聊时关闭。 */
  const query = options.enabled ? getActiveChatMentionQuery(options.document.text, cursor) : null;
  /** items 只在有效 @ 查询期间出现。 */
  const items = useMemo(() => query ? buildChatMentionPickerItems({
    members: options.members,
    selfID: options.selfID,
    canMentionAll: options.canMentionAll,
    query: query.query,
  }) : [], [options.canMentionAll, options.members, options.selfID, query?.query]);

  /** 选择候选并恢复到标签后的光标。 */
  function select(item: ChatMentionPickerItem) {
    if (!query) return;
    /** result 同步更新文本和 preset entity 偏移。 */
    const result = insertChatMention(options.document, query, item);
    options.onChangeDocument(result.document);
    setSelections(current => [
      ...current.filter(selection => selection.key !== item.mention.key),
      item.mention,
    ]);
    requestAnimationFrame(() => {
      /** textarea 可能已随路由卸载。 */
      const textarea = options.textareaRef.current;
      textarea?.setSelectionRange(result.cursor, result.cursor);
      textarea?.focus();
    });
  }

  /** 提交时过滤正文已删除的目标。 */
  function collect(text: string): readonly MessageMention[] {
    return collectVisibleChatMentions(text, selections, options.canMentionAll);
  }

  /** 清理本次草稿的提及选择。 */
  function clear() {
    setSelections([]);
  }

  return { items, select, collect, clear };
}
