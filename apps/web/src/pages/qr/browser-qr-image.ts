import QRCode from 'qrcode';

/** 浏览器生成二维码时对齐 RN 的高容错和白色静区。 */
const QR_CODE_OPTIONS = {
  errorCorrectionLevel: 'H' as const,
  margin: 4,
  width: 472,
  color: { dark: '#000000', light: '#FFFFFF' },
};

/** 将 shared payload 渲染到页面唯一 Canvas。 */
export async function renderBrowserQRCode(
  canvas: HTMLCanvasElement,
  payload: string,
  avatar: BrowserQRCodeAvatar,
  pixelSize = QR_CODE_OPTIONS.width,
): Promise<void> {
  if (!payload.trim()) throw new Error('二维码身份不可用');
  await QRCode.toCanvas(canvas, payload, { ...QR_CODE_OPTIONS, width: pixelSize });
  /** qrcode 写入固定行内像素尺寸，页面显示必须恢复响应式 100%。 */
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  drawBrowserQRCodeAvatar(canvas, avatar);
}

/** 应用内分享图片从稳定 payload 直接生成，不跨路由保存 Blob。 */
export interface CreateBrowserQRCodeShareFileOptions {
  readonly kind: BrowserQRCodeKind;
  readonly identity: string;
  readonly payload: string;
  readonly avatar: BrowserQRCodeAvatar;
}

/** 生成与 RN 分享链一致的 320 像素二维码 PNG。 */
export async function createBrowserQRCodeShareFile(
  options: CreateBrowserQRCodeShareFileOptions,
): Promise<File> {
  /** canvas 只在用户确认发送后短期存在，不插入页面 DOM。 */
  const canvas = document.createElement('canvas');
  await renderBrowserQRCode(canvas, options.payload, options.avatar, 320);
  return createBrowserQRCodeFile(canvas, options.kind, options.identity);
}

/** Canvas 中心头像只使用页面已取得的公开资料。 */
export interface BrowserQRCodeAvatar {
  readonly initial: string;
  readonly backgroundColor: string;
}

/** 把已渲染二维码导出为 PNG 文件，供下载和系统分享共用。 */
export async function createBrowserQRCodeFile(
  canvas: HTMLCanvasElement,
  kind: BrowserQRCodeKind,
  identity: string,
): Promise<File> {
  /** blob 保留 Canvas 生成的无损 PNG 数据。 */
  const blob = await readCanvasBlob(canvas);
  /** safeIdentity 避免用户或群身份字符进入文件路径语义。 */
  const safeIdentity = identity.replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 80) || kind;
  return new File([blob], `im28-${kind}-qr-${safeIdentity}.png`, { type: 'image/png' });
}

/** 二维码文件名只区分 shared 协议中的用户与群目标。 */
export type BrowserQRCodeKind = 'user' | 'group';

/** 通过短期 object URL 下载二维码 PNG，并立即回收浏览器资源。 */
export function downloadBrowserQRCode(file: File): void {
  /** objectURL 只在同步触发下载期间存活。 */
  const objectURL = URL.createObjectURL(file);
  /** anchor 使用浏览器原生下载能力，不写入应用缓存。 */
  const anchor = document.createElement('a');
  anchor.href = objectURL;
  anchor.download = file.name;
  anchor.click();
  URL.revokeObjectURL(objectURL);
}

/** 将 Canvas callback API 收敛为拒绝空结果的 Promise。 */
function readCanvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('二维码图片生成失败'));
    }, 'image/png');
  });
}

/** 在高容错二维码中心绘制可导出的圆形头像 fallback。 */
function drawBrowserQRCodeAvatar(
  canvas: HTMLCanvasElement,
  avatar: BrowserQRCodeAvatar,
): void {
  /** context 是生成二维码后的同一 2D surface。 */
  const context = canvas.getContext('2d');
  if (!context) throw new Error('二维码画布不可用');
  /** logoSize 对齐 RN 44/204 的中心头像比例。 */
  const logoSize = Math.round(canvas.width * 44 / 204);
  /** center 以二维码实际像素而非 CSS 尺寸定位。 */
  const center = canvas.width / 2;
  context.save();
  context.beginPath();
  context.arc(center, center, logoSize / 2 + 4, 0, Math.PI * 2);
  context.fillStyle = '#FFFFFF';
  context.fill();
  context.beginPath();
  context.arc(center, center, logoSize / 2, 0, Math.PI * 2);
  context.fillStyle = avatar.backgroundColor;
  context.fill();
  context.fillStyle = '#FFFFFF';
  context.font = `600 ${Math.round(logoSize * 0.45)}px system-ui, sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(avatar.initial, center, center + 1);
  context.restore();
}
