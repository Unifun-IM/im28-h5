import { useCallback, useRef, useState } from 'react';
import type {
  Conversation,
  PresetEmojiDocument,
  WebIMGroupMember,
  WebIMSync,
} from '@im28/im-sdk/web';

import type { ChatComposerMentionRequest } from './chat-composer-types.js';
import { readChatPageError } from './chat-page-helpers.js';

/** Composer 页面状态只接收 cache owner 的稳定 setter 与 shared facade。 */
interface UseChatPageComposerStateOptions {
  readonly conversationID: string;
  readonly conversation: Conversation | null;
  readonly currentUserID: string | null;
  readonly sync: WebIMSync | null;
  readonly setConversation: (
    update: (current: Conversation | null) => Conversation | null,
  ) => void;
  readonly setDraftDocument: (document: PresetEmojiDocument) => void;
  readonly onError: (message: string | null) => void;
}

/** 统一拥有 Composer 草稿持久化和头像长按提及请求。 */
export function useChatPageComposerState({
  conversationID,
  conversation,
  currentUserID,
  sync,
  setConversation,
  setDraftDocument,
  onError,
}: UseChatPageComposerStateOptions) {
  // mentionRequest 将头像长按翻译为 Composer 内部的一次性成员输入。
  const [mentionRequest, setMentionRequest] = useState<ChatComposerMentionRequest | null>(null);
  // mentionRequestSequenceRef 为连续提及生成稳定递增请求身份。
  const mentionRequestSequenceRef = useRef(0);

  /** 将普通 Composer 文档保存到当前账号 SDK SQLite。 */
  const changeDraftDocument = useCallback((document: PresetEmojiDocument): void => {
    setDraftDocument(document);
    if (!sync || !conversation) return;
    void sync.conversations.saveDraft(conversationID, document)
      .then(nextConversation => {
        setConversation(current => current?.conversationID === nextConversation.conversationID
          ? nextConversation
          : current);
      })
      .catch(cause => onError(readChatPageError(cause)));
  }, [conversation, conversationID, onError, setConversation, setDraftDocument, sync]);

  /** 将当前群真实成员转换为 Composer 的稳定一次性提及请求。 */
  const requestMention = useCallback((member: WebIMGroupMember): void => {
    if (conversation?.type !== 'group' || !member.userID || member.userID === currentUserID) return;
    mentionRequestSequenceRef.current += 1;
    setMentionRequest({ id: mentionRequestSequenceRef.current, member });
  }, [conversation?.type, currentUserID]);

  return { mentionRequest, changeDraftDocument, requestMention };
}
