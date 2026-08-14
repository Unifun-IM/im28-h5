/** RN 昵称输入最大字符数。 */
export const PROFILE_NICKNAME_MAX_LENGTH = 32;

/** RN 个性签名输入最大 Unicode 字符数。 */
export const PROFILE_BIO_MAX_LENGTH = 100;

/** 资料编辑子路由支持的字段。 */
export type ProfileEditMode = 'nickname' | 'gender' | 'bio';

/** Gateway 与 RN 共用的性别枚举。 */
export type ProfileGender = 0 | 1 | 2;

/** 个人资料总览仅接收由应用内部发起的受控快捷动作。 */
export interface MeProfileRouteState {
  readonly openAvatarSource: boolean;
}

/** 昵称输入完成键判定只依赖浏览器键盘事件的稳定字段。 */
export interface ProfileNicknameKeyInput {
  readonly key: string;
  readonly isComposing: boolean;
  readonly repeat: boolean;
}

/** 将未知 React Router state 收敛为安全的个人资料快捷动作。 */
export function readMeProfileRouteState(value: unknown): MeProfileRouteState {
  if (!value || typeof value !== 'object') return { openAvatarSource: false };
  return { openAvatarSource: Reflect.get(value, 'openAvatarSource') === true };
}

/** 只允许非组合、非重复的 Enter 复用 RN 昵称完成动作。 */
export function shouldSubmitProfileNicknameKey(input: ProfileNicknameKeyInput): boolean {
  return input.key === 'Enter' && !input.isComposing && !input.repeat;
}

/** 将未知性别收敛为 RN 支持的三个值。 */
export function normalizeProfileGender(value: unknown): ProfileGender {
  // numeric 兼容 Gateway 数字与字符串投影。
  const numeric = Number(value);
  return numeric === 1 || numeric === 2 ? numeric : 0;
}

/** 输出 RN 个人资料页的性别文案。 */
export function getProfileGenderLabel(value: unknown): string {
  // gender 只可能是 0、1、2。
  const gender = normalizeProfileGender(value);
  if (gender === 1) return '男';
  if (gender === 2) return '女';
  return '未知';
}

/** 对齐 RN trim 与 100 个 Unicode 字符截断。 */
export function normalizeProfileBio(value: unknown): string {
  if (typeof value !== 'string') return '';
  return Array.from(value.trim()).slice(0, PROFILE_BIO_MAX_LENGTH).join('');
}
