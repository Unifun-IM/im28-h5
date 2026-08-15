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

/** 页面与子路由允许在真实远端成功后回写的资料草稿字段。 */
export type AuthOnboardingProfileDraftPatch = Partial<Pick<
  AuthOnboardingProfileDraft,
  'nickname' | 'gender' | 'bio' | 'phone' | 'email' | 'avatarURL'
>>;

/** 合并可编辑字段，同时保持账号身份基线不可被页面覆盖。 */
export function mergeAuthOnboardingProfileDraft(
  current: AuthOnboardingProfileDraft,
  patch: AuthOnboardingProfileDraftPatch,
): AuthOnboardingProfileDraft {
  return {
    ...current,
    ...(patch.nickname === undefined ? {} : { nickname: patch.nickname }),
    ...(patch.gender === undefined ? {} : { gender: patch.gender }),
    ...(patch.bio === undefined ? {} : { bio: patch.bio }),
    ...(patch.phone === undefined ? {} : { phone: patch.phone }),
    ...(patch.email === undefined ? {} : { email: patch.email }),
    ...(patch.avatarURL === undefined ? {} : { avatarURL: patch.avatarURL }),
  };
}
