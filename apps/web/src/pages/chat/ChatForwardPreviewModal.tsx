import { useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Message } from '@im28/im-sdk/web';

import applyIconURL from '../../assets/rn/assets/icons/imm28/check-circle.regular.svg';
import checkIconURL from '../../assets/rn/assets/icons/imm28/check-circle.solid.svg';
import circleIconURL from '../../assets/rn/assets/icons/imm28/circle.regular.svg';
import changeIconURL from '../../assets/rn/assets/icons/imm28/data-transfer-both-rotate-90.dynamic.svg';
import outgoingTailURL from '../../assets/rn/assets/icons/chat/bubbletail-right.svg';
import trashIconURL from '../../assets/rn/assets/icons/imm28/trash.regular.svg';
import userCheckIconURL from '../../assets/rn/assets/icons/imm28/user-check.svg';
import userDeleteIconURL from '../../assets/rn/assets/icons/imm28/user-delete.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { ChatForwardOrigin } from './ChatForwardOrigin.js';
import { ChatMessageContent } from './ChatMessageContent.js';
import { formatChatMessageTimeText } from './chat-message-edit-view.js';
import { getChatMessageView } from './chat-message-view.js';
import { resolveChatForwardPreviewOrigin } from './chat-forward-composer-view.js';

/** RN 转发预览弹窗只承载展示和选择动作，不执行消息发送。 */
interface ChatForwardPreviewModalProps {
  readonly open: boolean;
  readonly messages: readonly Message[];
  readonly senderNamesByID: ReadonlyMap<string, string>;
  readonly excludedIDs: ReadonlySet<string>;
  readonly hideSenderName: boolean;
  readonly canHideSenderName: boolean;
  readonly recipientName: string;
  readonly onToggleMessage: (message: Message) => void;
  readonly onToggleSenderName: () => void;
  readonly onApply: () => void;
  readonly onChangeRecipient: () => void;
  readonly onCancelForward: () => void;
}

/** 按 frozen RN 结构呈现 60% 聊天气泡预览和独立操作菜单。 */
export function ChatForwardPreviewModal({
  open,
  messages,
  senderNamesByID,
  excludedIDs,
  hideSenderName,
  canHideSenderName,
  recipientName,
  onToggleMessage,
  onToggleSenderName,
  onApply,
  onChangeRecipient,
  onCancelForward,
}: ChatForwardPreviewModalProps) {
  // previewListRef 用于打开预览时贴住最新一条消息。
  const previewListRef = useRef<HTMLDivElement>(null);
  // selectedCount 同时驱动 RN 标题和最终待发送数量。
  const selectedCount = useMemo(
    () => messages.filter(message => !excludedIDs.has(message.clientMsgID)).length,
    [excludedIDs, messages],
  );
  // visibilityCopy 跟随隐藏发送者选项更新接收方提示。
  const visibilityCopy = hideSenderName ? '看不到' : '会看到';
  // normalizedRecipientName 拒绝空标题导致副标题语义残缺。
  const normalizedRecipientName = recipientName.trim() || '接收人';

  useEffect(() => {
    if (!open) return;
    // list 是当前弹窗唯一预览滚动容器。
    const list = previewListRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (!open) return undefined;
    /** handleKeyDown 让 Escape 与 RN 系统返回键一样应用当前选择并关闭。 */
    function handleKeyDown(event: globalThis.KeyboardEvent): void {
      if (event.key === 'Escape') onApply();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onApply, open]);

  if (!open) return null;

  return createPortal(
    <div
      className="rn-chat-forward-sheet-backdrop"
      role="presentation"
      onMouseDown={event => {
        if (event.currentTarget === event.target) onApply();
      }}
    >
      <div className="rn-chat-forward-sheet-stack">
        <section className="rn-chat-forward-sheet" role="dialog" aria-modal="true" aria-label="转发消息预览">
          <header>
            <h2>{`转发(${selectedCount})`}</h2>
            <p>{`${normalizedRecipientName} ${visibilityCopy}选中的消息已被转发`}</p>
          </header>
          <div ref={previewListRef} className="rn-chat-forward-preview-list">
            <div className="rn-chat-forward-preview-list-content">
              {messages.map((message, index) => (
                <ForwardPreviewMessage
                  key={message.clientMsgID}
                  message={message}
                  senderNamesByID={senderNamesByID}
                  previousMessage={messages[index - 1]}
                  nextMessage={messages[index + 1]}
                  selected={!excludedIDs.has(message.clientMsgID)}
                  hideSenderName={hideSenderName}
                  onToggle={() => onToggleMessage(message)}
                />
              ))}
            </div>
          </div>
        </section>
        <nav className="rn-chat-forward-options" aria-label="转发预览操作">
          <ForwardPreviewAction
            iconURL={hideSenderName ? userCheckIconURL : userDeleteIconURL}
            label={hideSenderName ? '显示发送者名称' : '隐藏发送者名称'}
            disabled={!canHideSenderName}
            onClick={onToggleSenderName}
          />
          <ForwardPreviewAction iconURL={changeIconURL} label="修改收件人" onClick={onChangeRecipient} />
          <ForwardPreviewAction iconURL={applyIconURL} label="应用更改" onClick={onApply} />
          <ForwardPreviewAction iconURL={trashIconURL} label="取消转发" danger onClick={onCancelForward} />
        </nav>
      </div>
    </div>,
    document.body,
  );
}

/** 单条预览复用聊天正文与气泡样式，只改变预览方向和来源头投影。 */
function ForwardPreviewMessage({
  message,
  senderNamesByID,
  previousMessage,
  nextMessage,
  selected,
  hideSenderName,
  onToggle,
}: {
  readonly message: Message;
  readonly senderNamesByID: ReadonlyMap<string, string>;
  readonly previousMessage: Message | undefined;
  readonly nextMessage: Message | undefined;
  readonly selected: boolean;
  readonly hideSenderName: boolean;
  readonly onToggle: () => void;
}) {
  // view 复用聊天页唯一消息类型投影，禁止预览另起 payload 解析规则。
  const view = getChatMessageView(message, false);
  // groupPosition 对齐 RN 同发送者连续气泡圆角与尾巴规则。
  const groupPosition = getPreviewGroupPosition(message, previousMessage, nextMessage);
  // rowClassName 复用聊天页现有 outgoing bubble 主题。
  const rowClassName = `rn-chat-message-row is-outgoing group-${groupPosition}`;
  // forwardOrigin 只做预览显示；真实发送来源仍由 shared SDK 创建。
  const forwardOrigin = hideSenderName
    ? undefined
    : resolveChatForwardPreviewOrigin(message, senderNamesByID);
  return (
    <div className="rn-chat-forward-preview-message-row">
      <button
        type="button"
        className="rn-chat-forward-preview-selector"
        aria-label={selected ? '取消选择转发消息' : '选择转发消息'}
        aria-pressed={selected}
        onClick={onToggle}
      >
        <RNAssetIcon assetURL={selected ? checkIconURL : circleIconURL} />
      </button>
      <article className={rowClassName}>
        <span className="rn-chat-message-column">
          <span className="rn-chat-message-line">
            <span className="rn-chat-bubble">
              {forwardOrigin ? <ChatForwardOrigin origin={forwardOrigin} mine /> : null}
              <span className="rn-chat-forward-preview-content" aria-hidden="true">
                <ChatMessageContent
                  view={view}
                  message={message}
                  mine
                  quoteSource={null}
                  onOpenQuotedMessage={ignorePreviewMessageAction}
                  onCopyLink={rejectPreviewLinkAction}
                />
              </span>
              <time>{formatChatMessageTimeText(message)}</time>
              {groupPosition === 'single' || groupPosition === 'last' ? (
                <RNAssetIcon assetURL={outgoingTailURL} className="rn-chat-tail is-mine" />
              ) : null}
            </span>
          </span>
        </span>
      </article>
    </div>
  );
}

/** 预览连续气泡只按当前有序来源计算四态位置。 */
function getPreviewGroupPosition(
  message: Message,
  previousMessage?: Message,
  nextMessage?: Message,
): 'single' | 'first' | 'middle' | 'last' {
  // continuesPrevious 和 continuesNext 只合并同一发送者的连续消息。
  const continuesPrevious = previousMessage?.senderID === message.senderID;
  // continuesNext 防止不同发送者被误画成一个连续气泡组。
  const continuesNext = nextMessage?.senderID === message.senderID;
  if (!continuesPrevious && !continuesNext) return 'single';
  if (!continuesPrevious) return 'first';
  if (!continuesNext) return 'last';
  return 'middle';
}

/** 预览内容禁止触发引用跳转。 */
function ignorePreviewMessageAction(): void {}

/** 预览内容禁止触发链接复制。 */
async function rejectPreviewLinkAction(): Promise<boolean> {
  return false;
}

/** RN 四项菜单行使用同源图标、分割线和危险色。 */
function ForwardPreviewAction({
  iconURL,
  label,
  danger = false,
  disabled = false,
  onClick,
}: {
  readonly iconURL: string;
  readonly label: string;
  readonly danger?: boolean;
  readonly disabled?: boolean;
  readonly onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={danger ? 'is-danger' : ''}
      disabled={disabled}
      onClick={onClick}
    >
      <RNAssetIcon assetURL={iconURL} />
      <span>{label}</span>
    </button>
  );
}
