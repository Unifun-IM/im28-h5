import { useEffect, useMemo, useState } from 'react';
import { canForwardWebIMMessage, type Message } from '@im28/im-sdk/web';

import shareIconURL from '../../assets/rn/assets/icons/imm28/share.dynamic.svg';
import xmarkIconURL from '../../assets/rn/assets/icons/imm28/xmark.dynamic.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { buildChatForwardComposerSummary } from './chat-forward-composer-view.js';
import { ChatForwardPreviewModal } from './ChatForwardPreviewModal.js';
import type { ChatForwardSelection } from './chat-composer-types.js';
import type { ChatPendingForward } from './useChatForwardFlow.js';
import './chat-forward.css';

/** 待发送转发条只负责摘要、预览和选择状态。 */
interface ChatForwardComposerProps {
  readonly pending: ChatPendingForward;
  readonly recipientName: string;
  readonly onCancel: () => void;
  readonly onChangeTarget: (
    sourceClientMsgIDs: readonly string[],
    hideSenderName: boolean,
  ) => void;
  readonly onSelectionChange: (selection: ChatForwardSelection) => void;
}

/** 呈现 RN 转发摘要和可编辑预览，输入与发送复用 ChatComposer。 */
export function ChatForwardComposer({
  pending,
  recipientName,
  onCancel,
  onChangeTarget,
  onSelectionChange,
}: ChatForwardComposerProps) {
  // excludedIDs 保存预览中用户取消选择的稳定来源 ID。
  const [excludedIDs, setExcludedIDs] = useState<ReadonlySet<string>>(new Set());
  // hideSenderName 初始值可由更换目标的路由状态延续。
  const [hideSenderName, setHideSenderName] = useState(
    pending.routeState.hideSenderName === true,
  );
  // previewOpen 控制 60% 高度的转发项编辑 sheet。
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setExcludedIDs(new Set());
    setHideSenderName(pending.routeState.hideSenderName === true);
  }, [pending.routeState]);

  // selectedMessages 保持 SDK 精确读取的来源顺序。
  const selectedMessages = useMemo(
    () => pending.messages.filter(message => !excludedIDs.has(message.clientMsgID)),
    [excludedIDs, pending.messages],
  );
  // selectedIDs 是 submit 和更换目标唯一传出的消息数据。
  const selectedIDs = useMemo(
    () => selectedMessages.map(message => message.clientMsgID),
    [selectedMessages],
  );
  // canHideSenderName 复用 shared 严格 body registry capability。
  const canHideSenderName = selectedMessages.length > 0 && selectedMessages.every(
    message => canForwardWebIMMessage(message, { hideSenderName: true }),
  );
  // summary 使用来源发送者最终展示名生成 RN 紧凑预览。
  const summary = buildChatForwardComposerSummary(selectedMessages, pending.senderNamesByID);

  useEffect(() => {
    onSelectionChange({ sourceClientMsgIDs: selectedIDs, hideSenderName });
  }, [hideSenderName, onSelectionChange, selectedIDs]);

  /** 切换预览项且保证至少保留一条来源。 */
  function toggleMessage(message: Message): void {
    setExcludedIDs(current => {
      // next 在不可变 Set 上更新，最后一条不可取消。
      const next = new Set(current);
      if (next.has(message.clientMsgID)) next.delete(message.clientMsgID);
      else if (pending.messages.length - next.size > 1) next.add(message.clientMsgID);
      return next;
    });
  }

  /** 应用当前反选集合并关闭预览，发送仍由 Composer 提交按钮触发。 */
  function applyPreviewChanges(): void {
    setPreviewOpen(false);
  }

  /** 关闭预览后把稳定来源 ID 和隐藏选项交回现有目标选择器。 */
  function changePreviewRecipient(): void {
    setPreviewOpen(false);
    onChangeTarget(selectedIDs, hideSenderName);
  }

  /** 关闭预览并清除整批待发送转发。 */
  function cancelPreviewForward(): void {
    setPreviewOpen(false);
    onCancel();
  }

  return (
    <>
      <div className="rn-chat-forward-composer-preview">
        <button type="button" className="rn-chat-forward-preview-hot-area" onClick={() => setPreviewOpen(true)} disabled={pending.loading}>
          <RNAssetIcon assetURL={shareIconURL} />
          <span><strong>{selectedMessages.length === 1 ? '转发消息' : `转发${selectedMessages.length}条消息`}</strong><small>{pending.loading ? '正在读取本地消息' : summary}</small></span>
        </button>
        <button type="button" className="rn-chat-forward-clear" aria-label="取消转发消息" onClick={onCancel}><RNAssetIcon assetURL={xmarkIconURL} /></button>
      </div>
      <ChatForwardPreviewModal
        open={previewOpen}
        messages={pending.messages}
        senderNamesByID={pending.senderNamesByID}
        excludedIDs={excludedIDs}
        hideSenderName={hideSenderName}
        canHideSenderName={canHideSenderName}
        recipientName={recipientName}
        onToggleMessage={toggleMessage}
        onToggleSenderName={() => setHideSenderName(current => !current)}
        onApply={applyPreviewChanges}
        onChangeRecipient={changePreviewRecipient}
        onCancelForward={cancelPreviewForward}
      />
    </>
  );
}
