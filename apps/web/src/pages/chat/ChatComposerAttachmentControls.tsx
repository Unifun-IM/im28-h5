import { ChatAttachmentActionPanel } from './ChatAttachmentActionPanel.js';
import { CHAT_ALBUM_ACCEPT } from './chat-attachment-selection.js';
import type { useChatComposerAttachments } from './useChatComposerAttachments.js';

/** 附件控件接收唯一附件 hook 的公开结果。 */
interface ChatComposerAttachmentControlsProps {
  readonly visible: boolean;
  readonly disabled: boolean;
  readonly showCallAction: boolean;
  readonly attachments: ReturnType<typeof useChatComposerAttachments>;
  readonly onOpenCallPicker: () => void;
  readonly onOpenCardPicker: () => void;
}

/** 集中呈现附件面板与浏览器三个隐藏文件 input。 */
export function ChatComposerAttachmentControls({
  visible,
  disabled,
  showCallAction,
  attachments,
  onOpenCallPicker,
  onOpenCardPicker,
}: ChatComposerAttachmentControlsProps) {
  return (
    <>
      {visible ? (
        <ChatAttachmentActionPanel
          albumInputRef={attachments.albumInputRef}
          cameraInputRef={attachments.cameraInputRef}
          fileInputRef={attachments.fileInputRef}
          showCallAction={showCallAction}
          onOpenCallPicker={onOpenCallPicker}
          onOpenCardPicker={onOpenCardPicker}
        />
      ) : null}
      <input ref={attachments.albumInputRef} hidden type="file" multiple accept={CHAT_ALBUM_ACCEPT} disabled={disabled} onChange={event => void attachments.selectAlbum(event)} />
      <input ref={attachments.cameraInputRef} hidden type="file" accept="image/*" capture="environment" disabled={disabled} onChange={event => void attachments.selectCamera(event)} />
      <input ref={attachments.fileInputRef} hidden type="file" disabled={disabled} onChange={event => void attachments.selectFile(event)} />
    </>
  );
}
