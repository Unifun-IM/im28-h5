import { useEffect, useMemo, useState, type FormEvent, type KeyboardEvent } from 'react';
import { canForwardWebIMMessage, type Message } from '@im28/im-sdk/web';

import checkIconURL from '../../assets/rn/assets/icons/imm28/check-circle.solid.svg';
import circleIconURL from '../../assets/rn/assets/icons/imm28/circle.regular.svg';
import changeIconURL from '../../assets/rn/assets/icons/imm28/data-transfer-both-rotate-90.dynamic.svg';
import sendIconURL from '../../assets/rn/assets/icons/imm28/send.svg';
import shareIconURL from '../../assets/rn/assets/icons/imm28/share.dynamic.svg';
import xmarkIconURL from '../../assets/rn/assets/icons/imm28/xmark.dynamic.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import { getChatMessageView } from './chat-message-view.js';
import type { ChatPendingForward } from './useChatForwardFlow.js';
import './chat-forward.css';

/** 待发送转发输入区只调用 shared facade 编排回调。 */
interface ChatForwardComposerProps {
  readonly pending: ChatPendingForward;
  readonly sending: boolean;
  readonly onCancel: () => void;
  readonly onChangeTarget: (
    sourceClientMsgIDs: readonly string[],
    hideSenderName: boolean,
  ) => void;
  readonly onSubmit: (options: {
    readonly sourceClientMsgIDs: readonly string[];
    readonly hideSenderName: boolean;
    readonly comment: string;
  }) => Promise<void>;
}

/** 呈现 RN 转发摘要、评论输入和可编辑预览 sheet。 */
export function ChatForwardComposer({
  pending,
  sending,
  onCancel,
  onChangeTarget,
  onSubmit,
}: ChatForwardComposerProps) {
  // excludedIDs 保存预览中用户取消选择的稳定来源 ID。
  const [excludedIDs, setExcludedIDs] = useState<ReadonlySet<string>>(new Set());
  // hideSenderName 初始值可由更换目标的路由状态延续。
  const [hideSenderName, setHideSenderName] = useState(
    pending.routeState.hideSenderName === true,
  );
  // comment 与 RN 一致作为整批转发后的独立文本消息。
  const [comment, setComment] = useState('');
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
  // summary 使用首条真实缓存消息生成 RN 紧凑预览。
  const summary = buildForwardComposerSummary(selectedMessages, pending.routeState.sourceConversationTitle);

  /** 提交当前选中 IDs、隐藏选项和评论。 */
  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (sending || pending.loading || !selectedIDs.length) return;
    await onSubmit({ sourceClientMsgIDs: selectedIDs, hideSenderName, comment });
  }

  /** Enter 发送，Shift+Enter 换行，并尊重输入法合成态。 */
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

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

  return (
    <section className="rn-chat-forward-composer-shell">
      <div className="rn-chat-forward-composer-preview">
        <button type="button" className="rn-chat-forward-preview-hot-area" onClick={() => setPreviewOpen(true)} disabled={pending.loading}>
          <RNAssetIcon assetURL={shareIconURL} />
          <span><strong>{selectedMessages.length === 1 ? '转发消息' : `转发${selectedMessages.length}条消息`}</strong><small>{pending.loading ? '正在读取本地消息' : summary}</small></span>
        </button>
        <button type="button" className="rn-chat-forward-clear" aria-label="取消转发消息" onClick={onCancel}><RNAssetIcon assetURL={xmarkIconURL} /></button>
      </div>
      <form className="rn-chat-forward-composer" onSubmit={handleSubmit}>
        <label><span className="sr-only">转发留言</span><textarea rows={1} maxLength={1000} value={comment} placeholder="留言..." disabled={sending} onChange={event => setComment(event.target.value)} onKeyDown={handleKeyDown} /></label>
        <button type="submit" aria-label="发送转发消息" disabled={sending || pending.loading || !selectedIDs.length}><RNAssetIcon assetURL={sendIconURL} /></button>
      </form>
      {previewOpen ? (
        <div className="rn-chat-forward-sheet-backdrop" role="presentation" onMouseDown={event => { if (event.currentTarget === event.target) setPreviewOpen(false); }}>
          <section className="rn-chat-forward-sheet" role="dialog" aria-modal="true" aria-label="转发消息预览">
            <header><button type="button" onClick={() => setPreviewOpen(false)}>取消</button><h2>转发预览</h2><button type="button" onClick={() => setPreviewOpen(false)}>完成</button></header>
            <div className="rn-chat-forward-preview-list">
              {pending.messages.map(message => {
                // selected 表示该来源将进入最终 facade 参数。
                const selected = !excludedIDs.has(message.clientMsgID);
                // view 复用聊天页已支持的消息类型投影。
                const view = getChatMessageView(message, false);
                return (
                  <button type="button" className={selected ? 'is-selected' : ''} key={message.clientMsgID} onClick={() => toggleMessage(message)}>
                    <RNAssetIcon assetURL={selected ? checkIconURL : circleIconURL} />
                    <span><strong>{message.senderID}</strong><small>{view.text}</small></span>
                  </button>
                );
              })}
            </div>
            <div className="rn-chat-forward-options">
              <label><span><strong>隐藏发送人</strong><small>{canHideSenderName ? '仅发送消息内容' : '所选消息类型暂不支持'}</small></span><input type="checkbox" checked={hideSenderName} disabled={!canHideSenderName} onChange={event => setHideSenderName(event.target.checked)} /></label>
              <button type="button" onClick={() => onChangeTarget(selectedIDs, hideSenderName)}><RNAssetIcon assetURL={changeIconURL} /><span>更换接收对象</span></button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}

/** 生成单条正文或多条来源会话摘要。 */
function buildForwardComposerSummary(
  messages: readonly Message[],
  sourceConversationTitle: string,
): string {
  if (!messages.length) return '请选择至少一条消息';
  if (messages.length > 1) return `来自：${sourceConversationTitle}`;
  // message 是唯一来源缓存实体。
  const message = messages[0]!;
  // view 复用聊天内容投影而不解析 Gateway body。
  const view = getChatMessageView(message, false);
  return `${message.senderID}：${view.text}`;
}
