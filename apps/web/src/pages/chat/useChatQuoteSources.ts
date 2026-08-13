import { useEffect, useMemo, useState } from 'react';
import type { Message, WebIMSync } from '@im28/im-sdk/web';

import {
  getChatQuoteSourceMessageIDs,
  matchesChatMessageStableID,
} from './chat-quote-view.js';

/** 引用来源 hook 只依赖当前账号稳定消息 ID 缓存读取。 */
type ChatQuoteSourceSync = Pick<
  WebIMSync['messages'],
  'getCachedByStableMsgIDs'
>;

/** 引用来源本地恢复后的消息和明确缺失身份。 */
export interface ChatQuoteSourcesSnapshot {
  readonly messages: readonly Message[];
  readonly unavailableIDs: ReadonlySet<string>;
}

/** 内部快照携带会话身份，阻止路由切换时复用旧来源状态。 */
interface ChatQuoteSourcesState extends ChatQuoteSourcesSnapshot {
  readonly conversationID: string;
}

/** 管理窗口外引用来源的当前账号 SQLite 读取，不发起 Gateway 请求。 */
export function useChatQuoteSources(options: {
  readonly conversationID: string;
  readonly messages: readonly Message[];
  readonly sync: ChatQuoteSourceSync | null;
}): ChatQuoteSourcesSnapshot {
  // state 保存当前路由窗口外来源和已确认缺失身份。
  const [state, setState] = useState<ChatQuoteSourcesState>({
    conversationID: options.conversationID,
    messages: [],
    unavailableIDs: new Set(),
  });
  // sourceIDs 从当前可见 type114 消息读取 Gateway 保存的稳定来源身份。
  const sourceIDs = useMemo(
    () => getChatQuoteSourceMessageIDs(options.messages),
    [options.messages],
  );
  // sourceIDsKey 让相同身份集合不因数组引用变化重复查询。
  const sourceIDsKey = sourceIDs.join('\u0000');

  useEffect(() => {
    // active 阻止账号或路由切换后的旧查询覆盖新页面。
    let active = true;
    // missingIDs 排除当前消息窗口已包含的来源。
    const missingIDs = sourceIDs.filter(sourceID =>
      !options.messages.some(message => matchesChatMessageStableID(message, sourceID)),
    );
    if (!options.sync || !missingIDs.length) {
      setState({
        conversationID: options.conversationID,
        messages: [],
        unavailableIDs: new Set(),
      });
      return () => {
        active = false;
      };
    }
    void options.sync.getCachedByStableMsgIDs(missingIDs)
      .then(cachedMessages => {
        if (!active) return;
        // conversationMessages 拒绝跨会话引用身份污染当前聊天窗口。
        const conversationMessages = cachedMessages.filter(
          message => message.conversationID === options.conversationID,
        );
        // unavailable 只包含 SQLite 中确实无法匹配的来源。
        const unavailable = new Set(missingIDs.filter(sourceID =>
          !conversationMessages.some(message => matchesChatMessageStableID(message, sourceID)),
        ));
        setState({
          conversationID: options.conversationID,
          messages: conversationMessages,
          unavailableIDs: unavailable,
        });
      })
      .catch(() => {
        if (!active) return;
        // 读取异常不伪装来源已删除，保留发送时快照和禁用定位。
        setState({
          conversationID: options.conversationID,
          messages: [],
          unavailableIDs: new Set(),
        });
      });
    return () => {
      active = false;
    };
  }, [options.conversationID, options.messages, options.sync, sourceIDsKey]);

  return state.conversationID === options.conversationID
    ? state
    : { messages: [], unavailableIDs: new Set() };
}
