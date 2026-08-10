import type {
  GatewayHTTPClient,
  GatewayUpdateUserProfileRequest,
  GatewayUser,
} from '@im28/im-sdk/web';

import { createWebIMSyncError } from './sync-context.js';

/** 页面可消费的当前账号资料能力。 */
export interface WebIMProfileSync {
  getCurrent(): Promise<GatewayUser>;
  update(patch: WebIMProfileUpdate): Promise<GatewayUser>;
}

/** Web 资料编辑只开放本切片已迁移的三个字段。 */
export type WebIMProfileUpdate = Pick<
  GatewayUpdateUserProfileRequest,
  'nickname' | 'gender' | 'bio'
>;

/** 仅供归一化过程组装 readonly Gateway 请求。 */
type MutableWebIMProfileUpdate = {
  -readonly [Key in keyof WebIMProfileUpdate]: WebIMProfileUpdate[Key];
};

/** 当前账号资料能力只依赖 runtime 的 Gateway 和认证 owner。 */
export interface WebIMProfileSyncDependencies {
  readonly gatewayClient: GatewayHTTPClient;
  readonly getCurrentUserID: () => string | null;
}

/** 创建不暴露 token 的当前账号资料 facade。 */
export function createWebIMProfileSync(
  dependencies: WebIMProfileSyncDependencies,
): WebIMProfileSync {
  /** 在远端资料操作前统一拒绝匿名调用。 */
  const requireAuthenticatedUser = () => {
    if (!dependencies.getCurrentUserID()?.trim()) {
      throw createWebIMSyncError(
        'PROFILE_AUTH_REQUIRED',
        'Current user profile requires an authenticated Web IM session.',
      );
    }
  };
  return {
    getCurrent: async () => {
      requireAuthenticatedUser();
      return dependencies.gatewayClient.getCurrentUserDetail();
    },
    update: async patch => {
      requireAuthenticatedUser();
      return dependencies.gatewayClient.updateUserProfile(
        normalizeWebIMProfileUpdate(patch),
      );
    },
  };
}

/** 对齐 RN 昵称、性别和签名约束并拒绝空更新。 */
function normalizeWebIMProfileUpdate(
  patch: WebIMProfileUpdate,
): GatewayUpdateUserProfileRequest {
  // normalized 只收集 caller 明确提交的字段。
  const normalized: MutableWebIMProfileUpdate = {};
  if (patch.nickname !== undefined) {
    // nickname 对齐 RN trim、非空和 32 字符上限。
    const nickname = patch.nickname.trim();
    if (!nickname || Array.from(nickname).length > 32) {
      throw createWebIMSyncError(
        'PROFILE_NICKNAME_INVALID',
        'Profile nickname must contain 1 to 32 characters.',
      );
    }
    normalized.nickname = nickname;
  }
  if (patch.gender !== undefined) {
    if (patch.gender !== 0 && patch.gender !== 1 && patch.gender !== 2) {
      throw createWebIMSyncError(
        'PROFILE_GENDER_INVALID',
        'Profile gender must be 0, 1 or 2.',
      );
    }
    normalized.gender = patch.gender;
  }
  if (patch.bio !== undefined) {
    normalized.bio = Array.from(patch.bio.trim()).slice(0, 100).join('');
  }
  if (!Object.keys(normalized).length) {
    throw createWebIMSyncError(
      'PROFILE_UPDATE_EMPTY',
      'Profile update requires at least one supported field.',
    );
  }
  return normalized;
}
