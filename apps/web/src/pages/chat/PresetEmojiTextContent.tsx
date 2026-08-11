import {
  getIllustratedPresetEmoji,
  resolvePresetEmojiEntities,
  type PresetEmojiEntity,
} from '@im28/im-sdk/web';

import { getIllustratedPresetEmojiAsset } from './illustrated-preset-emoji-assets.js';
import './chat-preset-emoji.css';

/** Web 富文本片段只包含普通正文或身份已验证的本地 PNG。 */
export type PresetEmojiTextSegment =
  | Readonly<{ kind: 'text'; key: string; text: string }>
  | Readonly<{
      kind: 'preset_emoji';
      key: string;
      fallback: string;
      assetURL: string;
      entity: PresetEmojiEntity;
    }>;

/** Web 预设表情正文组件支持气泡、草稿和单行摘要三种布局。 */
interface PresetEmojiTextContentProps {
  readonly text: string;
  readonly entities?: readonly PresetEmojiEntity[] | undefined;
  readonly className?: string;
  readonly largeEmoji?: boolean;
  readonly singleLine?: boolean;
}

/** 将合法实体分割成稳定 DOM 片段，资源缺失时保留 Unicode。 */
export function buildPresetEmojiTextSegments(
  text: string,
  entities?: readonly PresetEmojiEntity[],
): readonly PresetEmojiTextSegment[] {
  /** resolvedEntities 同时验证区间、双重身份与 Unicode fallback。 */
  const resolvedEntities = resolvePresetEmojiEntities(
    text,
    entities,
    getIllustratedPresetEmoji,
  ).filter(entity =>
    Boolean(getIllustratedPresetEmojiAsset(entity.packID, entity.presetID)?.assetURL),
  );
  /** segments 按 UTF-16 正文顺序累积。 */
  const segments: PresetEmojiTextSegment[] = [];
  /** cursor 指向尚未投影的正文起点。 */
  let cursor = 0;
  resolvedEntities.forEach(entity => {
    if (entity.offset > cursor) {
      segments.push({
        kind: 'text',
        key: `text-${cursor}`,
        text: text.slice(cursor, entity.offset),
      });
    }
    /** fallback 是实体覆盖的原始可读 Unicode。 */
    const fallback = text.slice(entity.offset, entity.offset + entity.length);
    /** asset 已由过滤条件确认存在。 */
    const asset = getIllustratedPresetEmojiAsset(entity.packID, entity.presetID);
    if (asset?.assetURL) {
      segments.push({
        kind: 'preset_emoji',
        key: `preset-${entity.offset}-${entity.presetID}`,
        fallback,
        assetURL: asset.assetURL,
        entity,
      });
    }
    cursor = entity.offset + entity.length;
  });
  if (cursor < text.length || segments.length === 0) {
    segments.push({ kind: 'text', key: `text-${cursor}`, text: text.slice(cursor) });
  }
  return segments;
}

/** 仅完整覆盖正文的一个可渲染实体启用 60px 大图模式。 */
export function isSinglePresetEmojiText(
  text: string,
  entities?: readonly PresetEmojiEntity[],
): boolean {
  /** segments 必须只包含一个资源已解析的图片片段。 */
  const segments = buildPresetEmojiTextSegments(text, entities);
  return (
    segments.length === 1 &&
    segments[0]?.kind === 'preset_emoji' &&
    segments[0].entity.offset === 0 &&
    segments[0].entity.length === text.length
  );
}

/** 按实体区间呈现 PNG，所有未知或错配输入原样显示 Unicode。 */
export function PresetEmojiTextContent({
  text,
  entities,
  className = '',
  largeEmoji = false,
  singleLine = false,
}: PresetEmojiTextContentProps) {
  /** segments 是当前组件唯一可信的渲染输入。 */
  const segments = buildPresetEmojiTextSegments(text, entities);
  /** rootClassName 统一拼接三种视觉模式。 */
  const rootClassName = `rn-preset-emoji-text ${className}${
    largeEmoji ? ' is-large-emoji' : ''
  }${singleLine ? ' is-single-line' : ''}`.trim();
  return (
    <span className={rootClassName} aria-label={text}>
      {segments.map(segment =>
        segment.kind === 'preset_emoji' ? (
          <img
            key={segment.key}
            className="rn-preset-emoji-image"
            src={segment.assetURL}
            alt={segment.fallback}
            draggable="false"
          />
        ) : (
          <span key={segment.key}>{segment.text}</span>
        ),
      )}
    </span>
  );
}
