import { afterEach, describe, expect, it, vi } from 'vitest';

const { toCanvas } = vi.hoisted(() => ({ toCanvas: vi.fn(async () => undefined) }));

vi.mock('qrcode', () => ({ default: { toCanvas } }));

import {
  createBrowserQRCodeFile,
  renderBrowserQRCode,
} from './browser-qr-image.js';

describe('browser profile QR image adapter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('使用高容错白底参数渲染 shared payload', async () => {
    /** canvas 只用于校验 adapter 传递同一 DOM owner。 */
    /** context stub 覆盖中心头像绘制调用。 */
    const context = {
      save: vi.fn(), beginPath: vi.fn(), arc: vi.fn(), fill: vi.fn(), restore: vi.fn(), fillText: vi.fn(),
      fillStyle: '', font: '', textAlign: '', textBaseline: '',
    } as unknown as CanvasRenderingContext2D;
    /** canvas 暴露 QR 与中心头像所需最小 surface。 */
    const canvas = { width: 472, height: 472, style: {}, getContext: () => context } as unknown as HTMLCanvasElement;
    await renderBrowserQRCode(canvas, '{"source":"myCard"}', {
      initial: 'D', backgroundColor: '#596EEB',
    });
    expect(toCanvas).toHaveBeenCalledWith(canvas, '{"source":"myCard"}', expect.objectContaining({
      errorCorrectionLevel: 'H',
      margin: 4,
      width: 472,
    }));
    expect(canvas.style.width).toBe('100%');
    expect(canvas.style.height).toBe('100%');
    expect(context.fillText).toHaveBeenCalledWith('D', 236, 237);
  });

  it('导出 PNG 时清洗用户 ID 文件名', async () => {
    /** canvas stub 返回稳定 PNG 内容。 */
    const canvas = {
      toBlob: (callback: BlobCallback) => callback(new Blob(['qr'], { type: 'image/png' })),
    } as HTMLCanvasElement;
    /** file 由浏览器 adapter 生成且不包含路径字符。 */
    const file = await createBrowserQRCodeFile(canvas, 'user', ' user/../../01 ');
    expect(file.name).toBe('im28-user-qr--user-01-.png');
    expect(file.type).toBe('image/png');
  });

  it('群二维码导出使用独立且清洗后的文件名', async () => {
    /** canvas stub 返回稳定 PNG 内容。 */
    const canvas = {
      toBlob: (callback: BlobCallback) => callback(new Blob(['qr'], { type: 'image/png' })),
    } as HTMLCanvasElement;
    /** file 区分 group 类型但不暴露路径字符。 */
    const file = await createBrowserQRCodeFile(canvas, 'group', 'group/01');
    expect(file.name).toBe('im28-group-qr-group-01.png');
  });
});
