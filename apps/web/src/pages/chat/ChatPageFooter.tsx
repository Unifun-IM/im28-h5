import type { ReactNode } from 'react';

import { ChatForwardComposer } from './ChatForwardComposer.js';
import { ChatMultiSelectBar } from './ChatMultiSelectBar.js';
import type { useChatForwardFlow } from './useChatForwardFlow.js';

/** 聊天页底部三态只接收转发 controller 和普通 composer。 */
interface ChatPageFooterProps {
  readonly forwardFlow: ReturnType<typeof useChatForwardFlow>;
  readonly sending: boolean;
  readonly onDeleteSelected: () => void;
  readonly children: ReactNode;
}

/** 在普通输入、多选工具栏和待发送转发预览之间互斥切换。 */
export function ChatPageFooter({
  forwardFlow,
  sending,
  onDeleteSelected,
  children,
}: ChatPageFooterProps) {
  if (forwardFlow.multiSelecting) {
    return (
      <ChatMultiSelectBar
        selectedCount={forwardFlow.selectedCount}
        onCancel={forwardFlow.cancelMultiSelect}
        onForward={forwardFlow.forwardSelectedMessages}
        onDelete={onDeleteSelected}
      />
    );
  }
  if (forwardFlow.pending) {
    return (
      <ChatForwardComposer
        pending={forwardFlow.pending}
        sending={sending}
        onCancel={forwardFlow.clearPendingForward}
        onChangeTarget={forwardFlow.changeForwardTarget}
        onSubmit={forwardFlow.submitForward}
      />
    );
  }
  return <>{children}</>;
}
