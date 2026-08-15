import type { PointerEventHandler, ReactNode, TouchEventHandler } from 'react';

import closeIconURL from '../../assets/rn/assets/icons/imm28/xmark.regular.svg';
import { InteractionModal } from '../../components/interaction/index.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';

/** 群成员选择弹窗参数只描述共用展示壳，不持有邀请或移除业务状态。 */
interface GroupMemberPickerModalProps {
  readonly title: string;
  readonly ariaLabel: string;
  readonly busy: boolean;
  readonly closeDisabled?: boolean;
  readonly invite?: boolean;
  readonly children: ReactNode;
  readonly onClose: () => void;
  readonly onTouchStart?: TouchEventHandler<HTMLElement>;
  readonly onTouchMove?: TouchEventHandler<HTMLElement>;
  readonly onTouchEnd?: TouchEventHandler<HTMLElement>;
  readonly onTouchCancel?: TouchEventHandler<HTMLElement>;
  readonly onPointerDown?: PointerEventHandler<HTMLElement>;
  readonly onPointerMove?: PointerEventHandler<HTMLElement>;
  readonly onPointerUp?: PointerEventHandler<HTMLElement>;
  readonly onPointerCancel?: PointerEventHandler<HTMLElement>;
}

/** 统一投影 RN 群设置上的邀请与移除成员底部选择层。 */
export function GroupMemberPickerModal({
  title,
  ariaLabel,
  busy,
  closeDisabled = false,
  invite = false,
  children,
  onClose,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onTouchCancel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: GroupMemberPickerModalProps) {
  return (
    <InteractionModal
      open
      ariaLabel={ariaLabel}
      className={`rn-group-member-picker-modal${invite ? ' is-invite' : ''}`}
      closeOnBackdrop={!closeDisabled}
      onRequestClose={onClose}
    >
      <section
        className="rn-group-remove-surface im-modal-sheet"
        aria-busy={busy}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchCancel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <PageNavbar className="rn-group-remove-header">
          <button
            type="button"
            aria-label={`关闭${ariaLabel}`}
            disabled={closeDisabled}
            onClick={onClose}
          >
            <RNAssetIcon assetURL={closeIconURL} />
          </button>
          <h1>{title}</h1>
          <span aria-hidden="true" />
        </PageNavbar>
        {children}
      </section>
    </InteractionModal>
  );
}
