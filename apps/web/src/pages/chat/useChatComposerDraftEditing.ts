import { useCallback, useEffect, useRef, type RefObject } from 'react';
import {
  insertPresetEmojiAtSelection,
  reconcilePresetEmojiEntitiesAfterTextChange,
  type PresetEmojiDescriptor,
  type PresetEmojiDocument,
  type PresetEmojiDocumentEditResult,
} from '@im28/im-sdk/web';

import {
  deleteChatDraftBeforeSelection,
  insertChatDraftAtSelection,
  type ChatDraftEditResult,
} from './chat-composer-text-editing.js';

/** 草稿编辑 hook 只接收当前文本和受控更新函数。 */
interface UseChatComposerDraftEditingOptions {
  readonly document: PresetEmojiDocument;
  readonly onChangeDocument: (document: PresetEmojiDocument) => void;
}

/** 草稿编辑 hook 返回 textarea owner 和两种面板操作。 */
interface ChatComposerDraftEditing {
  readonly textareaRef: RefObject<HTMLTextAreaElement | null>;
  readonly changeText: (text: string) => void;
  readonly insertTextAtSelection: (text: string) => void;
  readonly insertPresetEmojiAtSelection: (
    descriptor: PresetEmojiDescriptor,
  ) => void;
  readonly deleteBackward: () => void;
}

/** 把浏览器 selection 和 React 受控草稿收敛为一个编辑 owner。 */
export function useChatComposerDraftEditing({
  document,
  onChangeDocument,
}: UseChatComposerDraftEditingOptions): ChatComposerDraftEditing {
  // textareaRef 是读取和恢复 DOM selection 的唯一入口。
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // selectionFrameRef 防止连续点击留下过期光标恢复任务。
  const selectionFrameRef = useRef<number | null>(null);

  /** 更新草稿后在下一帧恢复折叠选区，保持表情面板的焦点状态。 */
  const applyEdit = useCallback(
    (result: PresetEmojiDocumentEditResult) => {
      onChangeDocument(result.document);
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
    [onChangeDocument],
  );

  /** 普通键盘输入按单次文本差量平移实体，粘贴不会创建新实体。 */
  const changeText = useCallback(
    (text: string) => {
      onChangeDocument(reconcilePresetEmojiEntitiesAfterTextChange(document, text));
    },
    [document, onChangeDocument],
  );

  /** 读取当前 textarea 选区并插入或替换文本。 */
  const insertTextAtSelection = useCallback(
    (text: string) => {
      // textareaSelection 在未聚焦时回退草稿末尾。
      const textareaSelection = textareaRef.current;
      // start 使用 DOM UTF-16 selectionStart。
      const start = textareaSelection?.selectionStart ?? document.text.length;
      // end 使用 DOM UTF-16 selectionEnd。
      const end = textareaSelection?.selectionEnd ?? start;
      /** textEdit 复用现有 grapheme/UTF-16 文本编辑 contract。 */
      const textEdit = insertChatDraftAtSelection(
        document.text,
        { start, end },
        text,
      );
      applyEdit({
        document: reconcilePresetEmojiEntitiesAfterTextChange(
          document,
          textEdit.text,
        ),
        selection: textEdit.selection,
      });
    },
    [applyEdit, document],
  );

  /** 在 DOM UTF-16 选区插入带稳定身份的插画表情。 */
  const insertIllustratedPresetEmojiAtSelection = useCallback(
    (descriptor: PresetEmojiDescriptor) => {
      /** textareaSelection 在未聚焦时仍保留面板打开前的光标。 */
      const textareaSelection = textareaRef.current;
      /** start 在无选区时回退草稿末尾。 */
      const start = textareaSelection?.selectionStart ?? document.text.length;
      /** end 与原生 textarea 选区保持一致。 */
      const end = textareaSelection?.selectionEnd ?? start;
      applyEdit(
        insertPresetEmojiAtSelection({
          document,
          selection: { start, end },
          descriptor,
        }),
      );
    },
    [applyEdit, document],
  );

  /** 删除当前选区或光标前完整 grapheme。 */
  const deleteBackward = useCallback(() => {
    // textareaSelection 保留点击面板前的输入选区。
    const textareaSelection = textareaRef.current;
    // start 在无 DOM 选区时回退草稿末尾。
    const start = textareaSelection?.selectionStart ?? document.text.length;
    // end 与原生 textarea 删除选区语义一致。
    const end = textareaSelection?.selectionEnd ?? start;
    /** textEdit 先按完整 grapheme 删除，再由共享逻辑剔除相交实体。 */
    const textEdit: ChatDraftEditResult = deleteChatDraftBeforeSelection(
      document.text,
      { start, end },
    );
    applyEdit({
      document: reconcilePresetEmojiEntitiesAfterTextChange(
        document,
        textEdit.text,
      ),
      selection: textEdit.selection,
    });
  }, [applyEdit, document]);

  useEffect(() => {
    return () => {
      if (selectionFrameRef.current !== null) {
        cancelAnimationFrame(selectionFrameRef.current);
      }
    };
  }, []);

  return {
    textareaRef,
    changeText,
    insertTextAtSelection,
    insertPresetEmojiAtSelection: insertIllustratedPresetEmojiAtSelection,
    deleteBackward,
  };
}
