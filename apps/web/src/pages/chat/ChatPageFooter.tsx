import type { ReactNode } from 'react';

import { ChatForwardComposer } from './ChatForwardComposer.js';
import { ChatMultiSelectBar } from './ChatMultiSelectBar.js';
import { ChatUnavailableComposerBar } from './ChatUnavailableComposerBar.js';
import type { useChatForwardFlow } from './useChatForwardFlow.js';

/** 聊天页底部四态接收转发 controller、不可用原因和普通 composer。 */
interface ChatPageFooterProps {
  readonly forwardFlow: ReturnType<typeof useChatForwardFlow>;
  readonly sending: boolean;
  readonly onDeleteSelected: () => void;
  readonly unavailableText: string;
  readonly children: ReactNode;
}

/** 在普通输入、多选工具栏、不可用提示和待发送转发预览间互斥切换。 */
export function ChatPageFooter({
  forwardFlow,
  sending,
  onDeleteSelected,
  unavailableText,
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
  if (unavailableText) {
    return <ChatUnavailableComposerBar text={unavailableText} />;
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
