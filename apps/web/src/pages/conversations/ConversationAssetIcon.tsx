import type { CSSProperties } from 'react';

/** RN SVG 资产图标参数，颜色由 CSS currentColor 提供。 */
interface ConversationAssetIconProps {
  readonly assetURL: string;
  readonly className?: string;
}

/** 通过 mask 复用 RN currentColor SVG，并保持明暗主题可读性。 */
export function ConversationAssetIcon({
  assetURL,
  className = '',
}: ConversationAssetIconProps) {
  // style 将 Vite 解析后的字节镜像 URL 交给 CSS mask。
  const style = {
    '--conversation-asset-icon': `url("${assetURL}")`,
  } as CSSProperties;
  return (
    <span
      aria-hidden="true"
      className={`conversation-asset-icon ${className}`.trim()}
      style={style}
    />
  );
}
