import type { IMBroadcastTextResult } from '@im28/im-sdk/web';

import fileIconURL from '../../assets/rn/assets/icons/chat/file.svg';
import { RNAssetIcon } from '../../components/RNAssetIcon.js';

/** 已发送群发卡片区分文字和三类媒体视图。 */
export type BroadcastSentCard =
  | { readonly id: string; readonly kind: 'text'; readonly text: string; readonly result: IMBroadcastTextResult }
  | { readonly id: string; readonly kind: 'image'; readonly name: string; readonly previewURL: string; readonly result: IMBroadcastTextResult }
  | { readonly id: string; readonly kind: 'video'; readonly name: string; readonly previewURL: string; readonly result: IMBroadcastTextResult }
  | { readonly id: string; readonly kind: 'audio'; readonly durationSeconds: number; readonly result: IMBroadcastTextResult }
  | { readonly id: string; readonly kind: 'file'; readonly name: string; readonly size: number; readonly result: IMBroadcastTextResult };

/** 呈现一张已由 Gateway 返回结果的真实群发卡片。 */
export function BroadcastSentCardView({ card }: { readonly card: BroadcastSentCard }) {
  return (
    <article className={`rn-broadcast-card is-${card.kind}`}>
      <small>{readBroadcastCardLabel(card.kind)}</small>
      {card.kind === 'text' ? <p>{card.text}</p> : null}
      {card.kind === 'image' ? <img src={card.previewURL} alt={card.name} /> : null}
      {card.kind === 'video' ? <video src={card.previewURL} aria-label={card.name} controls preload="metadata" /> : null}
      {card.kind === 'audio' ? <div className="rn-broadcast-audio-card"><span aria-hidden="true">◖)))</span><strong>{card.durationSeconds}&quot;</strong></div> : null}
      {card.kind === 'file' ? <div className="rn-broadcast-file-card"><span><strong>{card.name}</strong><small>{formatFileSize(card.size)}</small></span><RNAssetIcon assetURL={fileIconURL} /></div> : null}
      <BroadcastResult result={card.result} />
    </article>
  );
}

/** 展示逐目标成功、失败和待确认数量。 */
function BroadcastResult({ result }: { readonly result: IMBroadcastTextResult }) {
  /** partial 表示并非所有目标都有明确成功。 */
  const partial = result.failedCount > 0 || result.unknownCount > 0;
  return (
    <span className={partial ? 'is-partial' : ''}>
      成功 {result.successCount}
      {result.failedCount ? ` · 失败 ${result.failedCount}` : ''}
      {result.unknownCount ? ` · 待确认 ${result.unknownCount}` : ''}
    </span>
  );
}

/** 将卡片种类转换为稳定的消息类型文案。 */
function readBroadcastCardLabel(kind: BroadcastSentCard['kind']): string {
  if (kind === 'text') return '[文字消息]';
  if (kind === 'image') return '[图片消息]';
  if (kind === 'video') return '[视频消息]';
  if (kind === 'audio') return '[语音消息]';
  return '[文件消息]';
}

/** 将精确字节数转换为紧凑文件大小。 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
