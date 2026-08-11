import type { RefObject } from 'react';

import albumIconURL from '../../assets/rn/assets/icons/chat/album.svg';
import fileIconURL from '../../assets/rn/assets/icons/chat/file.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';

/** 聊天附件面板只负责把 RN action 样式映射到浏览器文件选择器。 */
interface ChatAttachmentActionPanelProps {
  readonly albumInputRef: RefObject<HTMLInputElement | null>;
  readonly fileInputRef: RefObject<HTMLInputElement | null>;
}

/** 呈现相册与文件两个已接通的附件入口。 */
export function ChatAttachmentActionPanel({
  albumInputRef,
  fileInputRef,
}: ChatAttachmentActionPanelProps) {
  return (
    <div className="rn-chat-action-panel" aria-label="聊天功能面板">
      <AttachmentAction
        label="相册"
        assetURL={albumIconURL}
        onClick={() => albumInputRef.current?.click()}
      />
      <AttachmentAction
        label="文件"
        assetURL={fileIconURL}
        onClick={() => fileInputRef.current?.click()}
      />
    </div>
  );
}

/** 复用 RN 72px icon box 呈现一个附件 action。 */
function AttachmentAction({
  label,
  assetURL,
  onClick,
}: {
  readonly label: string;
  readonly assetURL: string;
  readonly onClick: () => void;
}) {
  return (
    <button
      className="rn-chat-action-item"
      type="button"
      aria-label={label}
      onClick={onClick}
    >
      <span className="rn-chat-action-icon-box">
        <RNAssetIcon assetURL={assetURL} />
      </span>
      <span>{label}</span>
    </button>
  );
}
