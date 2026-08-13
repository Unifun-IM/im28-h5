import { useRef, type ChangeEvent } from 'react';

import albumIconURL from '../../assets/rn/assets/icons/chat/album.svg';
import fileIconURL from '../../assets/rn/assets/icons/chat/file.svg';
import videoIconURL from '../../assets/rn/assets/icons/imm28/video-camera.regular.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';

/** 群发媒体面板把浏览器文件选择隔离在页面 I/O 层。 */
interface BroadcastMediaActionsProps {
  readonly disabled: boolean;
  readonly onSelectImage: (file: File) => Promise<void>;
  readonly onSelectVideo: (file: File) => Promise<void>;
  readonly onSelectFile: (file: File) => Promise<void>;
  readonly onError: (message: string) => void;
}

/** 呈现图片、视频、文件三个 RN 资源入口。 */
export function BroadcastMediaActions({
  disabled,
  onSelectImage,
  onSelectVideo,
  onSelectFile,
  onError,
}: BroadcastMediaActionsProps) {
  /** imageInputRef 连接图片 action 与隐藏原生选择器。 */
  const imageInputRef = useRef<HTMLInputElement>(null);
  /** videoInputRef 连接视频 action 与隐藏原生选择器。 */
  const videoInputRef = useRef<HTMLInputElement>(null);
  /** fileInputRef 连接文件 action 与隐藏原生选择器。 */
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** selectFile 固定单文件、清空 input 并统一异常文案。 */
  async function selectFile(
    event: ChangeEvent<HTMLInputElement>,
    handler: (file: File) => Promise<void>,
  ): Promise<void> {
    /** file 是本轮浏览器选择的首个文件。 */
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    try {
      await handler(file);
    } catch (cause) {
      onError(cause instanceof Error && cause.message ? cause.message : '附件发送失败');
    }
  }

  return (
    <div className="rn-broadcast-media-actions" aria-label="群发附件">
      <BroadcastMediaAction label="图片" iconURL={albumIconURL} disabled={disabled} onClick={() => imageInputRef.current?.click()} />
      <BroadcastMediaAction label="视频" iconURL={videoIconURL} disabled={disabled} onClick={() => videoInputRef.current?.click()} />
      <BroadcastMediaAction label="文件" iconURL={fileIconURL} disabled={disabled} onClick={() => fileInputRef.current?.click()} />
      <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" hidden onChange={event => { void selectFile(event, onSelectImage); }} />
      <input ref={videoInputRef} type="file" accept="video/mp4,video/quicktime,video/x-m4v,video/webm" hidden onChange={event => { void selectFile(event, onSelectVideo); }} />
      <input ref={fileInputRef} type="file" hidden onChange={event => { void selectFile(event, onSelectFile); }} />
    </div>
  );
}

/** 单个媒体 action 使用稳定尺寸，避免图标加载引发布局位移。 */
function BroadcastMediaAction({
  label,
  iconURL,
  disabled,
  onClick,
}: {
  readonly label: string;
  readonly iconURL: string;
  readonly disabled: boolean;
  readonly onClick: () => void;
}) {
  return (
    <button type="button" disabled={disabled} aria-label={`群发${label}`} onClick={onClick}>
      <span><RNAssetIcon assetURL={iconURL} /></span>
      <small>{label}</small>
    </button>
  );
}
