import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { useWebIMRuntime } from '../../runtime/index.js';
import { PageNavbar } from '../../components/navigation/PageNavbar.js';
import {
  PROFILE_BIO_MAX_LENGTH,
  normalizeProfileBio,
  type ProfileGender,
} from '../me/profile-edit-view.js';
import { AuthOnboardingRouteGuard } from './AuthOnboardingRouteGuard.js';
import { useAuthOnboarding } from './AuthOnboardingProvider.js';
import './auth-profile-editor-page.css';

/** 完善资料内存编辑子路由类型。 */
export type AuthOnboardingProfileEditorMode = 'gender' | 'bio';

/** 完善资料编辑子路由参数。 */
interface AuthOnboardingProfileEditorPageProps {
  readonly mode: AuthOnboardingProfileEditorMode;
}

/** RN 性别/签名全屏状态的 React Router 实现，只更新内存草稿。 */
export function AuthOnboardingProfileEditorPage({ mode }: AuthOnboardingProfileEditorPageProps) {
  // snapshot 用于拒绝跨账号草稿。
  const { snapshot } = useWebIMRuntime();
  // onboarding owner 提供主表单初始化的当前账号草稿。
  const { profileDraft, updateProfileDraft } = useAuthOnboarding();
  // navigate 完成后回到完善资料主表单。
  const navigate = useNavigate();
  // genderDraft 只在点击完成时写回 Provider。
  const [genderDraft, setGenderDraft] = useState<ProfileGender>(() => profileDraft?.gender ?? 0);
  // bioDraft 只在点击完成时写回 Provider。
  const [bioDraft, setBioDraft] = useState(() => profileDraft?.bio ?? '');

  if (!profileDraft || profileDraft.userID !== snapshot.userID) {
    return <Navigate to="/auth/complete-profile" replace />;
  }

  /** 提交当前字段草稿并返回主表单。 */
  function completeEdit(): void {
    if (mode === 'gender') updateProfileDraft({ gender: genderDraft });
    else updateProfileDraft({ bio: normalizeProfileBio(bioDraft) });
    navigate('/auth/complete-profile', { replace: true });
  }

  // title 与 RN 子页面逐字一致。
  const title = mode === 'gender' ? '设置性别' : '个性签名';
  // genderOptions 对齐 RN 初值未知时才保留未知选项。
  const genderOptions: readonly { readonly label: string; readonly value: ProfileGender }[] = profileDraft.gender === 0
    ? [{ label: '男', value: 1 }, { label: '女', value: 2 }, { label: '未知', value: 0 }]
    : [{ label: '男', value: 1 }, { label: '女', value: 2 }];
  return <AuthOnboardingRouteGuard stage="complete-profile"><main className="auth-profile-editor-page"><section className="auth-profile-editor-surface">
    <PageNavbar className="auth-profile-editor-navbar"><button type="button" aria-label="返回完善资料" onClick={() => navigate('/auth/complete-profile', { replace: true })}>‹</button><h1>{title}</h1><button type="button" onClick={completeEdit}>完成</button></PageNavbar>
    {mode === 'gender' ? <div className="auth-profile-gender-card" role="radiogroup" aria-label="性别">
      {genderOptions.map(option => <button type="button" role="radio" aria-checked={genderDraft === option.value} key={option.value} onClick={() => setGenderDraft(option.value)}><span>{option.label}</span>{genderDraft === option.value ? <strong>✓</strong> : null}</button>)}
    </div> : <div className="auth-profile-bio-editor"><textarea autoFocus aria-label="个性签名输入框" value={bioDraft} maxLength={PROFILE_BIO_MAX_LENGTH} placeholder="填写个性签名" onChange={event => setBioDraft(Array.from(event.target.value).slice(0, PROFILE_BIO_MAX_LENGTH).join(''))} /><span>{Array.from(bioDraft).length}/{PROFILE_BIO_MAX_LENGTH}</span></div>}
  </section></main></AuthOnboardingRouteGuard>;
}
