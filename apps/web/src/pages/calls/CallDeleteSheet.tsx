import { useRef } from 'react';

import { InteractionModal } from '../../components/interaction/index.js';

/** 通话删除确认层参数只包含页面状态和显式回调。 */
interface CallDeleteSheetProps {
  readonly count: number;
  readonly deleting: boolean;
  readonly open: boolean;
  readonly onCancel: () => void;
  readonly onDelete: () => void;
}

/** 通过全局 modal 生命周期呈现 RN 通话删除确认层。 */
export function CallDeleteSheet({
  count,
  deleting,
  open,
  onCancel,
  onDelete,
}: CallDeleteSheetProps) {
  // retainedCountRef 保留关闭动画期间需要显示的最后一个有效选择数。
  const retainedCountRef = useRef(count);
  if (count > 0) retainedCountRef.current = count;
  // visibleCount 避免页面清空选择时关闭动画中的文案跳成零条。
  const visibleCount = count > 0 ? count : retainedCountRef.current;
  return (
    <InteractionModal
      open={open}
      ariaLabel="删除通话记录"
      className="rn-call-sheet-backdrop"
      placement="bottom"
      closeOnBackdrop={!deleting}
      onRequestClose={onCancel}
    >
      <section className="rn-call-sheet im-modal-sheet" role="alertdialog">
        <p>确定要删除这{visibleCount}条通话记录吗？</p>
        <button type="button" className="is-danger" disabled={deleting} onClick={onDelete}>
          {deleting ? '删除中...' : '删除'}
        </button>
        <button type="button" disabled={deleting} onClick={onCancel}>取消</button>
      </section>
    </InteractionModal>
  );
}
