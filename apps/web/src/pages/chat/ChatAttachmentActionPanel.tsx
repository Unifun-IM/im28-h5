import type { RefObject } from 'react';

import albumIconURL from '../../assets/rn/assets/icons/chat/album.svg';
import cameraIconURL from '../../assets/rn/assets/icons/chat/camera.svg';
import fileIconURL from '../../assets/rn/assets/icons/chat/file.svg';
import callIconURL from '../../assets/rn/assets/icons/chat/video-call.svg';
import cardIconURL from '../../assets/rn/assets/icons/imm28/business-card.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';

/** 聊天附件面板只负责把 RN action 样式映射到浏览器文件选择器。 */
interface ChatAttachmentActionPanelProps {
  readonly albumInputRef: RefObject<HTMLInputElement | null>;
  readonly cameraInputRef: RefObject<HTMLInputElement | null>;
  readonly fileInputRef: RefObject<HTMLInputElement | null>;
  readonly showCallAction: boolean;
  readonly onOpenCallPicker: () => void;
  readonly onOpenCardPicker: () => void;
}

/** 按 RN 顺序呈现已接通的附件入口，群聊不暴露单聊 RTC。 */
export function ChatAttachmentActionPanel({
  albumInputRef,
  cameraInputRef,
  fileInputRef,
  showCallAction,
  onOpenCallPicker,
  onOpenCardPicker,
}: ChatAttachmentActionPanelProps) {
  return (
    <div className="rn-chat-action-panel" aria-label="聊天功能面板">
      <AttachmentAction
        label="相册"
        assetURL={albumIconURL}
        onClick={() => albumInputRef.current?.click()}
      />
      <AttachmentAction
        label="拍照"
        assetURL={cameraIconURL}
        onClick={() => cameraInputRef.current?.click()}
      />
      {showCallAction ? <AttachmentAction
        label="音视频通话"
        assetURL={callIconURL}
        onClick={onOpenCallPicker}
      /> : null}
      <AttachmentAction
        label="文件"
        assetURL={fileIconURL}
        onClick={() => fileInputRef.current?.click()}
      />
      <AttachmentAction
        label="名片"
        assetURL={cardIconURL}
        onClick={onOpenCardPicker}
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
