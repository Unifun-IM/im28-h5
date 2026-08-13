import { InteractionModal } from '../interaction/index.js';
import './call-type-action-sheet.css';

/** 通话方式弹层参数只包含展示文本、忙碌态和用户选择回调。 */
export interface CallTypeActionSheetProps {
  readonly open: boolean;
  readonly peerName: string;
  readonly pending: boolean;
  readonly onClose: () => void;
  readonly onSelect: (mediaType: 'audio' | 'video') => void;
}

/** 对齐 RN 语音/视频二次选择，并由调用页面连接唯一通话 owner。 */
export function CallTypeActionSheet({
  open,
  peerName,
  pending,
  onClose,
  onSelect,
}: CallTypeActionSheetProps) {
  return (
    <InteractionModal
      open={open}
      ariaLabel={`与${peerName || '对方'}音视频通话`}
      className="rn-call-type-modal"
      closeOnBackdrop={!pending}
      onRequestClose={() => { if (!pending) onClose(); }}
    >
      <section className="rn-call-type-sheet im-modal-sheet">
        <div className="rn-call-type-group">
          <p>选择通话方式</p>
          <button type="button" disabled={pending} onClick={() => onSelect('audio')}>语音通话</button>
          <button type="button" disabled={pending} onClick={() => onSelect('video')}>视频通话</button>
        </div>
        <button type="button" disabled={pending} onClick={onClose}>取消音视频通话</button>
      </section>
    </InteractionModal>
  );
}
