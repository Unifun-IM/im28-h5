import type { IllustratedPresetEmojiAsset } from './illustrated-preset-emoji-assets.js';

/** 呈现一个带标题的 RN 七列插画表情区域。 */
export function IllustratedEmojiSection({
  title,
  emojis,
  onPress,
}: {
  readonly title: string;
  readonly emojis: readonly IllustratedPresetEmojiAsset[];
  readonly onPress: (emoji: IllustratedPresetEmojiAsset) => void;
}) {
  if (!emojis.length) return null;
  return (
    <section className="rn-chat-emoji-section">
      <h2>{title}</h2>
      <div className="rn-chat-emoji-grid is-illustrated">
        {emojis.map(emoji => (
          <button
            key={emoji.presetID}
            type="button"
            aria-label={`插入插画表情${emoji.unicode}`}
            onClick={() => onPress(emoji)}
          >
            {emoji.assetURL ? (
              <img src={emoji.assetURL} alt={emoji.unicode} draggable="false" />
            ) : (
              emoji.unicode
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

/** 呈现一个带标题的 RN 七列 Unicode 表情区域。 */
export function SystemEmojiSection({
  title,
  emojis,
  onPress,
}: {
  readonly title: string;
  readonly emojis: readonly string[];
  readonly onPress: (emoji: string) => void;
}) {
  if (!emojis.length) return null;
  return (
    <section className="rn-chat-emoji-section">
      <h2>{title}</h2>
      <div className="rn-chat-emoji-grid">
        {emojis.map((emoji, index) => (
          <button
            key={`${emoji}-${index}`}
            type="button"
            aria-label={`插入表情${emoji}`}
            onClick={() => onPress(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </section>
  );
}
