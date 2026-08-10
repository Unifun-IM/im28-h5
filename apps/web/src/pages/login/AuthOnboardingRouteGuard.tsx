import type { ReactNode } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

import { useWebIMRuntime } from '../../runtime/index.js';
import { useAuthOnboarding } from './AuthOnboardingProvider.js';
import {
  resolveAuthOnboardingRoute,
  type AuthOnboardingSourceMode,
} from './auth-onboarding-state.js';

/** Onboarding route guard 参数限制为冻结的两个全屏阶段。 */
interface AuthOnboardingRouteGuardProps {
  readonly stage: 'invite' | 'complete-profile';
  readonly children: ReactNode;
}

/** 在页面渲染前拒绝匿名、错账号或已丢失 pending secret 的路由。 */
export function AuthOnboardingRouteGuard({
  stage,
  children,
}: AuthOnboardingRouteGuardProps) {
  // runtime snapshot 是认证身份唯一真相源。
  const { snapshot, restoring } = useWebIMRuntime();
  // onboarding context 只持有 marker 和内存 pending request。
  const { marker, pendingRegistration } = useAuthOnboarding();
  // source query 只恢复非敏感入口类型。
  const [searchParams] = useSearchParams();
  // sourceMode 拒绝未知 query 并回退 phone。
  const sourceMode = normalizeSourceMode(searchParams.get('from'));

  if (restoring) return null;
  // decision 是可单测的纯路由结果。
  const decision = resolveAuthOnboardingRoute({
    stage,
    userID: snapshot.userID,
    marker,
    pendingRegistration,
    sourceMode,
  });
  return decision.allow ? children : <Navigate to={decision.redirectTo} replace />;
}

/** 将公开 query 限制为冻结的三个来源值。 */
function normalizeSourceMode(value: string | null): AuthOnboardingSourceMode {
  return value === 'email' || value === 'account' ? value : 'phone';
}
