import shareIconURL from '../../assets/rn/assets/icons/imm28/share.dynamic.svg';
import xmarkIconURL from '../../assets/rn/assets/icons/imm28/xmark.dynamic.svg';
import trashIconURL from '../../assets/rn/assets/icons/imm28/trash.dynamic.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import './chat-forward.css';

/** 多选工具栏只接收选择数量和显式命令。 */
interface ChatMultiSelectBarProps {
  readonly selectedCount: number;
  readonly onCancel: () => void;
  readonly onForward: () => void;
  readonly onDelete: () => void;
}

/** 对齐 RN 消息多选底部取消与转发操作。 */
export function ChatMultiSelectBar({
  selectedCount,
  onCancel,
  onForward,
  onDelete,
}: ChatMultiSelectBarProps) {
  return (
    <section className="rn-chat-multi-select-bar" aria-label="消息多选操作">
      <button type="button" aria-label="取消多选" onClick={onCancel}>
        <RNAssetIcon assetURL={xmarkIconURL} />
        <span>取消</span>
      </button>
      <strong>已选择{selectedCount}条</strong>
      <button type="button" disabled={!selectedCount} aria-label="删除已选消息" onClick={onDelete}>
        <RNAssetIcon assetURL={trashIconURL} />
        <span>删除</span>
      </button>
      <button type="button" disabled={!selectedCount} aria-label="转发已选消息" onClick={onForward}>
        <RNAssetIcon assetURL={shareIconURL} />
        <span>转发</span>
      </button>
    </section>
  );
}
