import { describe, expect, it } from 'vitest';

import toastSource from './AppToast.tsx?raw';

/** Toast 视觉契约锁定 RN 图标资产、语义入口和 22px 几何。 */
describe('app toast view', () => {
  it('uses the RN solid assets for success, error and info', () => {
    expect(toastSource).toContain('check-circle.solid.svg');
    expect(toastSource).toContain('warning-circle.solid.svg');
    expect(toastSource).toContain('info-circle.solid.svg');
    expect(toastSource).toContain('<RNAssetIcon assetURL={iconURL} />');
    expect(toastSource).not.toContain("? '✓'");
  });

  it('exposes info and preserves the RN default icon behavior', () => {
    expect(toastSource).toContain("'default' | 'success' | 'error' | 'info'");
    expect(toastSource).toContain('info: (message, options = {})');
    expect(toastSource).toContain(': warningIconURL;');
  });

  it('locks the RN 22px geometry and semantic icon classes', () => {
    expect(toastSource).toContain('const RN_TOAST_ICON_SIZE_PX = 22;');
    expect(toastSource).toContain('className={`im-toast-icon is-${type}`}');
    expect(toastSource).toContain('flexBasis: RN_TOAST_ICON_SIZE_PX');
  });
});
