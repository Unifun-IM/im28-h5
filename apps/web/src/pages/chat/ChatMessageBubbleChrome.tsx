import {
  canRetryWebIMMessage,
  type Message,
} from '@im28/im-sdk/web';

import incomingTailDarkURL from '../../assets/rn/assets/icons/chat/bubbletail-left-dark.svg';
import incomingTailLightURL from '../../assets/rn/assets/icons/chat/bubbletail-left-light.svg';
import outgoingTailURL from '../../assets/rn/assets/icons/chat/bubbletail-right.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';

/** 发送状态装饰只接收消息实体和现有重试动作。 */
interface OutgoingMessageStatusProps {
  readonly message: Message;
  readonly disabled: boolean;
  readonly onRetry: (clientMsgID: string) => Promise<void>;
}

/** 气泡尾角只根据消息方向选择 RN 原始资源。 */
interface ChatBubbleTailProps {
  readonly mine: boolean;
}

/** 按 shared capability 将可恢复 failed 状态呈现为 RN 重试按钮。 */
export function OutgoingMessageStatus({
  message,
  disabled,
  onRetry,
}: OutgoingMessageStatusProps) {
  // status 缩短状态分支并保持消息实体完整传给 capability owner。
  const { status } = message;
  if (status === 'sending' || status === 'pending') {
    return (
      <span
        className="rn-chat-message-status is-sending"
        role="status"
        aria-label="发送中"
      />
    );
  }
  if (status === 'failed') {
    if (canRetryWebIMMessage(message)) {
      return (
        <button
          className="rn-chat-message-status is-failed is-action"
          type="button"
          disabled={disabled}
          aria-label="重新发送消息"
          onClick={() => void onRetry(message.clientMsgID)}
        >
          !
        </button>
      );
    }
    return (
      <span
        className="rn-chat-message-status is-failed"
        role="status"
        aria-label="发送失败，无法直接重试"
      >
        !
      </span>
    );
  }
  return null;
}

/** 使用 RN 原始 SVG 呈现气泡尾部并随明暗主题切换。 */
export function ChatBubbleTail({ mine }: ChatBubbleTailProps) {
  if (mine) {
    return <RNAssetIcon assetURL={outgoingTailURL} className="rn-chat-tail is-mine" />;
  }
  return (
    <span className="rn-chat-tail is-peer">
      <img className="light-only" src={incomingTailLightURL} alt="" />
      <img className="dark-only" src={incomingTailDarkURL} alt="" />
    </span>
  );
}
