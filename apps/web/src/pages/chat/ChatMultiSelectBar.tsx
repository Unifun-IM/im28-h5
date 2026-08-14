import shareIconURL from '../../assets/rn/assets/icons/imm28/share.dynamic.svg';
import trashIconURL from '../../assets/rn/assets/icons/imm28/trash.dynamic.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import './chat-forward.css';

/** 多选底栏只接收选择状态和两个 RN 同源命令。 */
interface ChatMultiSelectBarProps {
  readonly selectedCount: number;
  readonly onForward: () => void;
  readonly onDelete: () => void;
}

/** 对齐 RN 消息多选底部仅保留转发与删除图标。 */
export function ChatMultiSelectBar({
  selectedCount,
  onForward,
  onDelete,
}: ChatMultiSelectBarProps) {
  return (
    <section className="rn-chat-multi-select-bar" aria-label="消息多选操作">
      <button type="button" disabled={!selectedCount} aria-label="转发已选消息" onClick={onForward}>
        <RNAssetIcon assetURL={shareIconURL} />
      </button>
      <button type="button" disabled={!selectedCount} aria-label="删除已选消息" onClick={onDelete}>
        <RNAssetIcon assetURL={trashIconURL} />
      </button>
    </section>
  );
}
