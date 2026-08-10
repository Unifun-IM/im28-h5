import type { ProfileGender } from '../me/profile-edit-view.js';

/** 完善资料主表单与子路由共享的内存草稿。 */
export interface AuthOnboardingProfileDraft {
  readonly userID: string;
  readonly nickname: string;
  readonly gender: ProfileGender;
  readonly bio: string;
  readonly phone: string;
  readonly email: string;
  readonly avatarURL: string;
}

/** 子路由允许修改的资料草稿字段。 */
export type AuthOnboardingProfileDraftPatch = Partial<Pick<AuthOnboardingProfileDraft, 'nickname' | 'gender' | 'bio'>>;

/** 合并可编辑字段，同时保持账号、联系方式和头像基线不可被子路由覆盖。 */
export function mergeAuthOnboardingProfileDraft(
  current: AuthOnboardingProfileDraft,
  patch: AuthOnboardingProfileDraftPatch,
): AuthOnboardingProfileDraft {
  return {
    ...current,
    ...(patch.nickname === undefined ? {} : { nickname: patch.nickname }),
    ...(patch.gender === undefined ? {} : { gender: patch.gender }),
    ...(patch.bio === undefined ? {} : { bio: patch.bio }),
  };
}
