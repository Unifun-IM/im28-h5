/** 验证消息角标参数。 */
interface VerificationCountBadgeProps {
  readonly count: number;
  readonly className?: string;
}

/** 复用 RN 0 隐藏、超过 99 显示 99+ 的角标规则。 */
export function VerificationCountBadge({
  count,
  className = '',
}: VerificationCountBadgeProps) {
  // normalizedCount 避免异常小数或负数进入可见角标。
  const normalizedCount = Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0;
  if (normalizedCount === 0) return null;
  return <span className={`rn-verification-count-badge ${className}`.trim()}>
    {normalizedCount > 99 ? '99+' : normalizedCount}
  </span>;
}
