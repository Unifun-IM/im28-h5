import type { ReactNode } from 'react';

/** 页面导航栏参数只允许页面提供差异 class 与三列内容。 */
interface PageNavbarProps {
  readonly className?: string;
  readonly children: ReactNode;
}

/** 统一承载可寻址详情页的 safe-area、三列和标题语义。 */
export function PageNavbar({ className = '', children }: PageNavbarProps) {
  return (
    <header className={`im-page-navbar ${className}`.trim()}>
      {children}
    </header>
  );
}
