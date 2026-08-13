import { InteractionModal } from '../interaction/index.js';
import './avatar-source-action-sheet.css';

/** 头像来源 sheet 的平台动作参数。 */
interface AvatarSourceActionSheetProps {
  readonly visible: boolean;
  readonly onAlbum: () => void;
  readonly onCamera: () => void;
  readonly onClose: () => void;
}

/** 对齐 RN AvatarActionSheet，供 onboarding 与个人资料共同消费。 */
export function AvatarSourceActionSheet({
  visible,
  onAlbum,
  onCamera,
  onClose,
}: AvatarSourceActionSheetProps) {
  return (
    <InteractionModal open={visible} ariaLabel="选择头像来源" className="rn-avatar-source-modal" onRequestClose={onClose}>
      <section className="im-modal-sheet rn-avatar-source-sheet">
        <div>
          <button type="button" onClick={onAlbum}>从相册选一张</button>
          <button type="button" onClick={onCamera}>拍一张照片</button>
          <button type="button" onClick={onClose}>取消</button>
        </div>
      </section>
    </InteractionModal>
  );
}
