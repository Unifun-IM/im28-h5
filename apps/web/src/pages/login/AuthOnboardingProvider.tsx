import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import {
  createAuthOnboardingMarkerStore,
  type AuthOnboardingMarker,
  type AuthOnboardingSourceMode,
  type AuthPendingRegistration,
} from './auth-onboarding-state.js';
import {
  mergeAuthOnboardingProfileDraft,
  type AuthOnboardingProfileDraft,
  type AuthOnboardingProfileDraftPatch,
} from './auth-onboarding-profile-draft.js';

/** 页面消费的唯一 onboarding 状态端口。 */
interface AuthOnboardingContextValue {
  readonly marker: AuthOnboardingMarker | null;
  readonly pendingRegistration: AuthPendingRegistration | null;
  readonly profileDraft: AuthOnboardingProfileDraft | null;
  readonly setPendingRegistration: (pending: AuthPendingRegistration) => void;
  readonly clearPendingRegistration: () => void;
  readonly initializeProfileDraft: (draft: AuthOnboardingProfileDraft) => void;
  readonly updateProfileDraft: (patch: AuthOnboardingProfileDraftPatch) => void;
  readonly markProfileRequired: (userID: string, sourceMode: AuthOnboardingSourceMode) => void;
  readonly clearProfileRequired: (userID: string) => void;
}

// Context 缺省 null 用于拒绝 Provider 外误用。
const AuthOnboardingContext = createContext<AuthOnboardingContextValue | null>(null);

/** 为 auth routes 提供内存 pending request 与最小 session marker。 */
export function AuthOnboardingProvider({ children }: PropsWithChildren) {
  // markerStore 只访问当前 tab 的 sessionStorage。
  const markerStore = useMemo(
    () => createAuthOnboardingMarkerStore(globalThis.sessionStorage),
    [],
  );
  // marker 可跨同 tab 刷新恢复，但不含凭据或联系方式。
  const [marker, setMarker] = useState<AuthOnboardingMarker | null>(() => markerStore.read());
  // pendingRegistration 故意不持久化，刷新后必须失效。
  const [pendingRegistration, setPendingRegistration] =
    useState<AuthPendingRegistration | null>(null);
  // profileDraft 只在当前 React tree 内跨主表单和编辑子路由存活。
  const [profileDraft, setProfileDraft] = useState<AuthOnboardingProfileDraft | null>(null);

  /** 清理当前内存中的注册重试 secret。 */
  function clearPendingRegistration(): void {
    setPendingRegistration(null);
  }

  /** 注册成功后写入最小账号级 onboarding marker。 */
  function markProfileRequired(userID: string, sourceMode: AuthOnboardingSourceMode): void {
    // nextMarker 只包含路由恢复所需非敏感字段。
    const nextMarker: AuthOnboardingMarker = { userID: userID.trim(), sourceMode };
    markerStore.write(nextMarker);
    setMarker(nextMarker);
    setPendingRegistration(null);
    setProfileDraft(null);
  }

  /** 使用真实 current-detail 初始化当前账号的表单草稿。 */
  function initializeProfileDraft(draft: AuthOnboardingProfileDraft): void {
    setProfileDraft(draft);
  }

  /** 只更新已初始化草稿允许由子路由编辑的字段。 */
  function updateProfileDraft(patch: AuthOnboardingProfileDraftPatch): void {
    setProfileDraft(current => current ? mergeAuthOnboardingProfileDraft(current, patch) : current);
  }

  /** 只允许当前 marker 对应账号完成或跳过 onboarding。 */
  function clearProfileRequired(userID: string): void {
    if (marker?.userID !== userID.trim()) return;
    markerStore.clear();
    setMarker(null);
    setProfileDraft(null);
  }

  // value 保持依赖未变化时的稳定引用。
  const value = useMemo<AuthOnboardingContextValue>(() => ({
    marker,
    pendingRegistration,
    profileDraft,
    setPendingRegistration,
    clearPendingRegistration,
    initializeProfileDraft,
    updateProfileDraft,
    markProfileRequired,
    clearProfileRequired,
  }), [marker, pendingRegistration, profileDraft]);

  return (
    <AuthOnboardingContext.Provider value={value}>
      {children}
    </AuthOnboardingContext.Provider>
  );
}

/** 读取 auth onboarding state owner。 */
export function useAuthOnboarding(): AuthOnboardingContextValue {
  // context 必须由 App root 注入。
  const context = useContext(AuthOnboardingContext);
  if (!context) throw new Error('useAuthOnboarding must be used inside AuthOnboardingProvider.');
  return context;
}
