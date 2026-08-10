import { useCallback, useEffect, useRef, type RefObject } from 'react';

import {
  deleteChatDraftBeforeSelection,
  insertChatDraftAtSelection,
  type ChatDraftEditResult,
} from './chat-composer-text-editing.js';

/** 草稿编辑 hook 只接收当前文本和受控更新函数。 */
interface UseChatComposerDraftEditingOptions {
  readonly draft: string;
  readonly onChangeDraft: (text: string) => void;
}

/** 草稿编辑 hook 返回 textarea owner 和两种面板操作。 */
interface ChatComposerDraftEditing {
  readonly textareaRef: RefObject<HTMLTextAreaElement | null>;
  readonly insertTextAtSelection: (text: string) => void;
  readonly deleteBackward: () => void;
}

/** 把浏览器 selection 和 React 受控草稿收敛为一个编辑 owner。 */
export function useChatComposerDraftEditing({
  draft,
  onChangeDraft,
}: UseChatComposerDraftEditingOptions): ChatComposerDraftEditing {
  // textareaRef 是读取和恢复 DOM selection 的唯一入口。
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // selectionFrameRef 防止连续点击留下过期光标恢复任务。
  const selectionFrameRef = useRef<number | null>(null);

  /** 更新草稿后在下一帧恢复折叠选区，保持表情面板的焦点状态。 */
  const applyEdit = useCallback(
    (result: ChatDraftEditResult) => {
      onChangeDraft(result.text);
      if (selectionFrameRef.current !== null) {
        cancelAnimationFrame(selectionFrameRef.current);
      }
      selectionFrameRef.current = requestAnimationFrame(() => {
        // textarea 可能已随路由卸载，缺失时无需补偿。
        const textarea = textareaRef.current;
        selectionFrameRef.current = null;
        if (!textarea) return;
        textarea.setSelectionRange(result.selection.start, result.selection.end);
      });
    },
    [onChangeDraft],
  );

  /** 读取当前 textarea 选区并插入或替换文本。 */
  const insertTextAtSelection = useCallback(
    (text: string) => {
      // textareaSelection 在未聚焦时回退草稿末尾。
      const textareaSelection = textareaRef.current;
      // start 使用 DOM UTF-16 selectionStart。
      const start = textareaSelection?.selectionStart ?? draft.length;
      // end 使用 DOM UTF-16 selectionEnd。
      const end = textareaSelection?.selectionEnd ?? start;
      applyEdit(insertChatDraftAtSelection(draft, { start, end }, text));
    },
    [applyEdit, draft],
  );

  /** 删除当前选区或光标前完整 grapheme。 */
  const deleteBackward = useCallback(() => {
    // textareaSelection 保留点击面板前的输入选区。
    const textareaSelection = textareaRef.current;
    // start 在无 DOM 选区时回退草稿末尾。
    const start = textareaSelection?.selectionStart ?? draft.length;
    // end 与原生 textarea 删除选区语义一致。
    const end = textareaSelection?.selectionEnd ?? start;
    applyEdit(deleteChatDraftBeforeSelection(draft, { start, end }));
  }, [applyEdit, draft]);

  useEffect(() => {
    return () => {
      if (selectionFrameRef.current !== null) {
        cancelAnimationFrame(selectionFrameRef.current);
      }
    };
  }, []);

  return { textareaRef, insertTextAtSelection, deleteBackward };
}
