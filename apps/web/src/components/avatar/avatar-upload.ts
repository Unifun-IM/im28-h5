/** 浏览器头像文件输入合同。 */
export interface AvatarInputContract {
  readonly accept: string;
  readonly capture?: 'environment';
}

/** 相册只接受 SDK 明确支持的静态图片格式。 */
export const AVATAR_ALBUM_INPUT: AvatarInputContract = {
  accept: 'image/jpeg,image/png,image/webp',
};

/** 拍照入口请求环境摄像头，桌面浏览器可按平台退化。 */
export const AVATAR_CAMERA_INPUT: AvatarInputContract = {
  accept: 'image/*',
  capture: 'environment',
};

/** 将共享裁剪后的 JPEG 转为 SDK 平台中立上传元数据。 */
export function buildAvatarUpload(
  userID: string,
  blob: Blob,
): {
  readonly source: Blob;
  readonly name: string;
  readonly mimeType: 'image/jpeg';
  readonly size: number;
  readonly extension: 'jpg';
} {
  // normalizedUserID 只用于稳定文件名，不允许空账号上传头像。
  const normalizedUserID = userID.trim();
  if (!normalizedUserID) throw new Error('头像上传缺少当前账号');
  return {
    source: blob,
    name: `user-${normalizedUserID}.jpg`,
    mimeType: 'image/jpeg',
    size: blob.size,
    extension: 'jpg',
  };
}
