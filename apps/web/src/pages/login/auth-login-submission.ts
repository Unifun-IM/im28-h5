import {
  isWebIMUnregisteredAccountError,
  type WebIMLoginRequest,
  type WebIMRegisterRequest,
  type WebIMRuntime,
} from '@im28/im-sdk/web';

import { isInviteCodeRequiredAuthError, type AuthLoginMode } from './auth-login-config.js';

/** 登录页提交编排的显式输入。 */
export interface AuthLoginSubmissionInput {
  readonly runtime: Pick<WebIMRuntime, 'login' | 'register'>;
  readonly mode: AuthLoginMode;
  readonly loginRequest: WebIMLoginRequest;
  readonly registerRequest: WebIMRegisterRequest | null;
}

/** 登录表单生成 Gateway request 所需的非状态字段。 */
export interface AuthLoginRequestInput {
  readonly mode: AuthLoginMode;
  readonly account: string;
  readonly credential: string;
  readonly phoneAreaCode: string;
}

/** 登录、注册、邀请码和错误四种结果禁止页面猜测。 */
export type AuthLoginSubmissionResult =
  | { readonly type: 'authenticated' }
  | { readonly type: 'registered'; readonly userID: string }
  | {
      readonly type: 'invite-required';
      readonly sourceMode: 'phone' | 'email';
      readonly request: WebIMRegisterRequest;
    }
  | { readonly type: 'failed'; readonly cause: unknown };

/** 按 route mode 生成共享 Gateway login request。 */
export function createAuthLoginRequest(input: AuthLoginRequestInput): WebIMLoginRequest {
  if (input.mode === 'account') {
    return { type: 'account', account: input.account.trim(), password: input.credential };
  }
  if (input.mode === 'phone') {
    return {
      type: 'phone',
      account: input.account,
      phone_area_code: input.phoneAreaCode,
      verification_code: input.credential,
    };
  }
  return { type: 'email', account: input.account.trim(), verification_code: input.credential };
}

/** 只为 phone/email 未注册分支生成 register request。 */
export function createAuthRegisterRequest(
  input: AuthLoginRequestInput,
): WebIMRegisterRequest | null {
  if (input.mode === 'account') return null;
  return input.mode === 'phone'
    ? {
        type: 'phone',
        account: input.account,
        phone_area_code: input.phoneAreaCode,
        verification_code: input.credential,
      }
    : {
        type: 'email',
        account: input.account.trim(),
        verification_code: input.credential,
      };
}

/** 执行 login，并仅对 phone/email 的 20002 分支调用真实 register。 */
export async function submitAuthLogin(
  input: AuthLoginSubmissionInput,
): Promise<AuthLoginSubmissionResult> {
  try {
    await input.runtime.login(input.loginRequest);
    return { type: 'authenticated' };
  } catch (cause) {
    if (
      input.mode === 'account' ||
      !input.registerRequest ||
      !isWebIMUnregisteredAccountError(cause)
    ) {
      return { type: 'failed', cause };
    }
  }
  try {
    // snapshot 已通过 session/account DB/realtime 建立链。
    const snapshot = await input.runtime.register(input.registerRequest);
    return snapshot.userID
      ? { type: 'registered', userID: snapshot.userID }
      : { type: 'failed', cause: new Error('注册成功但未返回用户 ID。') };
  } catch (cause) {
    return isInviteCodeRequiredAuthError(cause)
      ? {
          type: 'invite-required',
          sourceMode: input.mode === 'email' ? 'email' : 'phone',
          request: input.registerRequest,
        }
      : { type: 'failed', cause };
  }
}
