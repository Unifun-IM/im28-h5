/** Web 群头像允许的最大原文件字节数。 */
export const GROUP_AVATAR_MAX_BYTES = 10 * 1024 * 1024;

/** RN 头像裁剪输出固定为 512 像素正方形。 */
const GROUP_AVATAR_OUTPUT_SIZE = 512;

/** 浏览器裁剪计算需要的图片和视口尺寸。 */
export interface GroupAvatarCropInput {
  readonly sourceWidth: number;
  readonly sourceHeight: number;
  readonly stageSize: number;
  readonly scale: number;
  readonly translateX: number;
  readonly translateY: number;
}

/** Canvas drawImage 消费的源图片正方形区域。 */
export interface GroupAvatarCropRect {
  readonly x: number;
  readonly y: number;
  readonly size: number;
}

/** 校验浏览器所选群头像，避免不支持格式进入裁剪和上传。 */
export function validateGroupAvatarFile(file: File): void {
  // mimeType 只接受 SDK 群头像合同支持的静态图片。
  const mimeType = file.type.trim().toLowerCase();
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
    throw new Error('群头像仅支持 JPEG、PNG 或 WEBP 图片');
  }
  if (!Number.isFinite(file.size) || file.size <= 0 || file.size > GROUP_AVATAR_MAX_BYTES) {
    throw new Error('群头像图片不能超过 10MB');
  }
}

/** 将 RN 同语义 cover、缩放和位移转换为源图裁剪区域。 */
export function resolveGroupAvatarCropRect(input: GroupAvatarCropInput): GroupAvatarCropRect {
  // sourceWidth 与 sourceHeight 必须来自解码成功的真实图片。
  const sourceWidth = requirePositive(input.sourceWidth, '图片宽度无效');
  const sourceHeight = requirePositive(input.sourceHeight, '图片高度无效');
  // stageSize 是页面实际圆形预览的 CSS 像素边长。
  const stageSize = requirePositive(input.stageSize, '裁剪区域无效');
  // scale 与 RN 一致限定在 1 至 4 倍。
  const scale = Math.min(Math.max(requirePositive(input.scale, '缩放比例无效'), 1), 4);
  // baseScale 保证源图以 cover 方式完整覆盖正方形裁剪区。
  const baseScale = Math.max(stageSize / sourceWidth, stageSize / sourceHeight);
  // displayWidth 是当前缩放后的浏览器展示宽度。
  const displayWidth = sourceWidth * baseScale * scale;
  // displayHeight 是当前缩放后的浏览器展示高度。
  const displayHeight = sourceHeight * baseScale * scale;
  // maxX 防止水平拖动露出图片边界。
  const maxX = Math.max(0, (displayWidth - stageSize) / 2);
  // maxY 防止垂直拖动露出图片边界。
  const maxY = Math.max(0, (displayHeight - stageSize) / 2);
  // translateX 使用与预览相同的边界归一化。
  const translateX = Math.min(Math.max(input.translateX, -maxX), maxX);
  // translateY 使用与预览相同的边界归一化。
  const translateY = Math.min(Math.max(input.translateY, -maxY), maxY);
  // imageLeft 是缩放图片相对裁剪区的左边界。
  const imageLeft = (stageSize - displayWidth) / 2 + translateX;
  // imageTop 是缩放图片相对裁剪区的上边界。
  const imageTop = (stageSize - displayHeight) / 2 + translateY;
  // sourceSize 将视口正方形反算成源图片正方形。
  const sourceSize = Math.min(stageSize / (baseScale * scale), sourceWidth, sourceHeight);
  // x 与 y 始终限制在源图片可裁剪区域内。
  const x = Math.min(Math.max(-imageLeft / (baseScale * scale), 0), sourceWidth - sourceSize);
  const y = Math.min(Math.max(-imageTop / (baseScale * scale), 0), sourceHeight - sourceSize);
  return { x, y, size: sourceSize };
}

/** 将用户确认的浏览器裁剪状态编码成 RN 同规格 512x512 JPEG。 */
export async function cropGroupAvatarFile(
  file: File,
  input: GroupAvatarCropInput,
): Promise<Blob> {
  validateGroupAvatarFile(file);
  // bitmap 使用浏览器解码后的真实像素尺寸，避免依赖不可信文件元数据。
  const bitmap = await createImageBitmap(file);
  try {
    // rect 以真实解码尺寸重新计算最终源图裁剪区域。
    const rect = resolveGroupAvatarCropRect({
      ...input,
      sourceWidth: bitmap.width,
      sourceHeight: bitmap.height,
    });
    // canvas 固定输出尺寸，保持 RN 上传与缓存形态一致。
    const canvas = document.createElement('canvas');
    canvas.width = GROUP_AVATAR_OUTPUT_SIZE;
    canvas.height = GROUP_AVATAR_OUTPUT_SIZE;
    // context 缺失属于浏览器能力失败，禁止回退上传原图伪装成功。
    const context = canvas.getContext('2d');
    if (!context) throw new Error('当前浏览器不支持头像裁剪');
    context.drawImage(
      bitmap,
      rect.x,
      rect.y,
      rect.size,
      rect.size,
      0,
      0,
      GROUP_AVATAR_OUTPUT_SIZE,
      GROUP_AVATAR_OUTPUT_SIZE,
    );
    // blob 是平台上传 adapter 消费的唯一裁剪结果。
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(result => {
        if (result) resolve(result);
        else reject(new Error('群头像裁剪失败'));
      }, 'image/jpeg', 0.9);
    });
    return blob;
  } finally {
    bitmap.close();
  }
}

/** 拒绝 NaN、Infinity 和非正尺寸进入裁剪坐标计算。 */
function requirePositive(value: number, message: string): number {
  if (!Number.isFinite(value) || value <= 0) throw new Error(message);
  return value;
}
