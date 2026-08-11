import { useState, type MouseEvent } from 'react';

import backIconURL from '../../assets/rn/components/navbar/nav-arrow-left.svg';
import downloadIconURL from '../../assets/rn/assets/icons/imm28/cloud-download.dynamic.svg';
import fileIconURL from '../../assets/rn/assets/icons/imm28/doc.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';
import {
  downloadChatMedia,
  getChatMediaDownloadName,
  openChatMedia,
} from './chat-media-download.js';
import type { ChatMediaPreview } from './chat-media-view.js';

/** 全屏媒体层只接收安全投影和关闭动作。 */
interface ChatMediaPreviewOverlayProps {
  readonly preview: ChatMediaPreview;
  readonly onClose: () => void;
}

/** 按 RN 图片、视频和文件预览结构呈现短生命周期全屏层。 */
export function ChatMediaPreviewOverlay({
  preview,
  onClose,
}: ChatMediaPreviewOverlayProps) {
  // downloading 锁定一次真实 Blob 下载，防止重复网络请求。
  const [downloading, setDownloading] = useState(false);
  // feedback 只在真实下载触发后显示成功，失败保留原因。
  const [feedback, setFeedback] = useState<{
    readonly kind: 'success' | 'error';
    readonly text: string;
  } | null>(null);
  // downloadName 优先使用文件 payload 名称，其次使用 URL path。
  const downloadName = getChatMediaDownloadName(
    preview.url,
    preview.fileName ?? '',
    preview.kind === 'image' ? '图片' : '文件',
  );

  /** 执行真实 Blob 下载并呈现准确结果。 */
  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    setFeedback(null);
    try {
      await downloadChatMedia({ url: preview.url, fileName: downloadName });
      setFeedback({ kind: 'success', text: '已提交到浏览器下载' });
    } catch (cause) {
      setFeedback({ kind: 'error', text: readMediaActionError(cause) });
    } finally {
      setDownloading(false);
    }
  }

  /** 在新标签页交给浏览器原生文件预览能力。 */
  function handleOpen() {
    setFeedback(null);
    try {
      openChatMedia(preview.url);
    } catch (cause) {
      setFeedback({ kind: 'error', text: readMediaActionError(cause) });
    }
  }

  return (
    <section
      className={`rn-chat-media-preview is-${preview.kind}`}
      role="dialog"
      aria-modal="true"
      aria-label={preview.title}
    >
      {preview.kind === 'image' ? (
        <ImagePreviewActions
          downloading={downloading}
          onClose={onClose}
          onDownload={() => void handleDownload()}
        />
      ) : (
        <header className="rn-chat-media-preview-header">
          <button type="button" aria-label={`关闭${preview.title}`} onClick={onClose}>
            <RNAssetIcon assetURL={backIconURL} />
          </button>
          <strong>{preview.title}</strong>
          <span aria-hidden="true" />
        </header>
      )}
      {preview.kind === 'file' ? (
        <FilePreviewBody
          preview={preview}
          downloading={downloading}
          feedback={feedback}
          onDownload={() => void handleDownload()}
          onOpen={handleOpen}
        />
      ) : (
        <div className="rn-chat-media-preview-body" onClick={onClose}>
          {preview.kind === 'image' ? (
            <img src={preview.url} alt="图片预览" onClick={stopClickPropagation} />
          ) : (
            <video
              key={preview.url}
              src={preview.url}
              controls
              autoPlay
              playsInline
              onClick={stopClickPropagation}
            />
          )}
        </div>
      )}
      {preview.kind === 'image' && feedback ? (
        <p className={`rn-chat-media-feedback is-${feedback.kind}`} role="status">
          {feedback.text}
        </p>
      ) : null}
    </section>
  );
}

/** 图片预览复刻 RN 左关闭、右保存动作。 */
function ImagePreviewActions({
  downloading,
  onClose,
  onDownload,
}: {
  readonly downloading: boolean;
  readonly onClose: () => void;
  readonly onDownload: () => void;
}) {
  return (
    <>
      <button className="rn-chat-image-preview-close" type="button" aria-label="关闭图片预览" onClick={onClose}>×</button>
      <button className="rn-chat-image-preview-save" type="button" aria-label="保存图片" disabled={downloading} onClick={onDownload}>
        {downloading ? <span className="rn-chat-download-spinner" /> : <RNAssetIcon assetURL={downloadIconURL} />}
      </button>
    </>
  );
}

/** 文件预览复刻 RN 文件摘要，并提供真实打开和下载动作。 */
function FilePreviewBody({
  preview,
  downloading,
  feedback,
  onDownload,
  onOpen,
}: {
  readonly preview: ChatMediaPreview;
  readonly downloading: boolean;
  readonly feedback: { readonly kind: 'success' | 'error'; readonly text: string } | null;
  readonly onDownload: () => void;
  readonly onOpen: () => void;
}) {
  return (
    <div className="rn-chat-file-preview-body">
      <span className="rn-chat-file-preview-icon"><img src={fileIconURL} alt="" /></span>
      <strong>{preview.fileName || '文件'}</strong>
      {preview.detail ? <small>{preview.detail}</small> : null}
      <div className="rn-chat-file-preview-actions">
        <button type="button" onClick={onOpen}>打开文件</button>
        <button type="button" disabled={downloading} onClick={onDownload}>
          {downloading ? '下载中...' : '下载文件'}
        </button>
      </div>
      <p className="rn-chat-file-preview-tip">文件将由浏览器原生能力预览或保存。</p>
      {feedback ? <p className={`rn-chat-media-feedback is-${feedback.kind}`} role="status">{feedback.text}</p> : null}
    </div>
  );
}

/** 将未知异常转换成稳定可见文案。 */
function readMediaActionError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '操作失败，请重试。';
}

/** 阻止媒体本体点击冒泡到关闭预览的背景层。 */
function stopClickPropagation(event: MouseEvent) {
  event.stopPropagation();
}
