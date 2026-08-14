import type { ReactNode } from 'react';

import { ChatMultiSelectBar } from './ChatMultiSelectBar.js';
import { ChatUnavailableComposerBar } from './ChatUnavailableComposerBar.js';
import type { useChatForwardFlow } from './useChatForwardFlow.js';

/** 聊天页底部接收多选 controller、不可用原因和唯一普通 composer。 */
interface ChatPageFooterProps {
  readonly forwardFlow: ReturnType<typeof useChatForwardFlow>;
  readonly onDeleteSelected: () => void;
  readonly unavailableText: string;
  readonly children: ReactNode;
}

/** 在普通输入、多选工具栏和不可用提示间互斥切换。 */
export function ChatPageFooter({
  forwardFlow,
  onDeleteSelected,
  unavailableText,
  children,
}: ChatPageFooterProps) {
  if (forwardFlow.multiSelecting) {
    return (
      <ChatMultiSelectBar
        selectedCount={forwardFlow.selectedCount}
        onForward={forwardFlow.forwardSelectedMessages}
        onDelete={onDeleteSelected}
      />
    );
  }
  if (unavailableText) {
    return <ChatUnavailableComposerBar text={unavailableText} />;
  }
  return <>{children}</>;
}
