/** H5 认证页支持的 RN 登录方式。 */
export type AuthLoginMode = 'phone' | 'email' | 'account';

/** RN 国家码选择项。 */
export interface AuthCountryCode {
  readonly name: string;
  readonly dialCode: string;
}

/** 每种登录方式的 RN 标题、说明和字段 contract。 */
export interface AuthLoginCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly accountPlaceholder: string;
  readonly accountInputMode: 'text' | 'email' | 'numeric';
}

/** RN 登录页标题与字段配置。 */
export const AUTH_LOGIN_COPY: Record<AuthLoginMode, AuthLoginCopy> = {
  phone: {
    title: '手机号登录',
    subtitle: '未注册的手机号验证通过后将自动注册',
    accountPlaceholder: '请输入手机号',
    accountInputMode: 'numeric',
  },
  email: {
    title: '邮箱登录',
    subtitle: '未注册的邮箱验证通过后将自动注册',
    accountPlaceholder: '请输入邮箱',
    accountInputMode: 'email',
  },
  account: {
    title: '账号密码登录',
    subtitle: '使用账号和密码登录',
    accountPlaceholder: '请输入账号',
    accountInputMode: 'text',
  },
};

/** RN 国家码列表按移动端原顺序展示。 */
export const AUTH_COUNTRY_CODES: readonly AuthCountryCode[] = [
  { name: '中国', dialCode: '+86' },
  { name: '中国香港', dialCode: '+852' },
  { name: '中国澳门', dialCode: '+853' },
  { name: '中国台湾', dialCode: '+886' },
  { name: '美国', dialCode: '+1' },
  { name: '日本', dialCode: '+81' },
  { name: '韩国', dialCode: '+82' },
];

/** Gateway 当前只接受的手机号区号。 */
export const SUPPORTED_PHONE_AREA_CODE = '+86';

/** 注册账号允许 8-24 个可见 ASCII 字符。 */
const ACCOUNT_PATTERN = /^[\x21-\x7e]{8,24}$/;

/** 注册密码只允许英文和数字。 */
const PASSWORD_PATTERN = /^[A-Za-z0-9]{8,24}$/;

/** 注册密码至少包含一个英文字母。 */
const PASSWORD_LETTER_PATTERN = /[A-Za-z]/;

/** 注册密码至少包含一个数字。 */
const PASSWORD_DIGIT_PATTERN = /[0-9]/;

/** RN 账号格式错误文案由注册与账号安全共用。 */
export const ACCOUNT_CREDENTIAL_ERROR = '账号需 8-24 个字符，只允许英文、数字和英文符号，不能包含空格。';

/** RN 密码格式错误文案由注册与账号安全共用。 */
export const PASSWORD_CREDENTIAL_ERROR = '密码需 8-24 个字符，且至少包含英文和数字两类字符，英文区分大小写。';

/** RN 两次密码不一致错误文案。 */
export const CONFIRM_PASSWORD_MISMATCH_ERROR = '两次输入的密码不一致。';

/** 校验 RN 当前支持的中国大陆手机号。 */
export function isValidPhoneNumber(value: string, dialCode: string): boolean {
  if (dialCode !== SUPPORTED_PHONE_AREA_CODE) {
    return /^\d{4,15}$/.test(value);
  }
  return /^1[3-9]\d{9}$/.test(value) && !/^(\d)\1{10}$/.test(value);
}

/** 校验 RN 邮箱输入规则。 */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** 校验 RN 账号注册格式。 */
export function isValidRegistrationAccount(value: string): boolean {
  return ACCOUNT_PATTERN.test(value);
}

/** 校验 RN 密码注册格式。 */
export function isValidRegistrationPassword(value: string): boolean {
  return PASSWORD_PATTERN.test(value) &&
    PASSWORD_LETTER_PATTERN.test(value) &&
    PASSWORD_DIGIT_PATTERN.test(value);
}

/** 将认证异常转换为不包含凭据的用户可读文本。 */
export function readAuthError(cause: unknown, fallback = '请稍后重试'): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

/** 对齐 RN，仅在 Gateway 错误明确包含 invite 语义时进入邀请码分支。 */
export function isInviteCodeRequiredAuthError(cause: unknown): boolean {
  // message 只用于识别服务端能力分支，不代表本地校验邀请码有效。
  const message = readAuthError(cause, '').toLowerCase();
  return message.includes('invite') || message.includes('邀请码');
}
