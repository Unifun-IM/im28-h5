import fileIconURL from '../../assets/rn/assets/icons/chat/file.svg';
import closeIconURL from '../../assets/rn/assets/icons/imm28/xmark.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';

/** 待发送文件栏只呈现 RN 已有的文件事实与移除动作。 */
interface ChatComposerPendingFileProps {
  readonly file: File;
  readonly onRemove: () => void;
}

/** 将浏览器字节数格式化为 RN 文件栏使用的紧凑文本。 */
export function formatChatPendingFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** 呈现 RN 同款待发送文件栏，不读取或上传本地文件。 */
export function ChatComposerPendingFile({
  file,
  onRemove,
}: ChatComposerPendingFileProps) {
  // kindLabel 仅用于展示浏览器可确认的音频或普通文件类别。
  const kindLabel = file.type.toLowerCase().startsWith('audio/') ? '音频' : '文件';
  return (
    <section className="rn-chat-pending-file" aria-label="已选文件">
      <span className="rn-chat-pending-file-icon" aria-hidden="true">
        <RNAssetIcon assetURL={fileIconURL} />
      </span>
      <span className="rn-chat-pending-file-copy">
        <strong>{file.name || '文件'}</strong>
        <small>{kindLabel} · {formatChatPendingFileSize(file.size)}</small>
      </span>
      <button type="button" aria-label="移除已选文件" onClick={onRemove}>
        <RNAssetIcon assetURL={closeIconURL} />
      </button>
    </section>
  );
}
