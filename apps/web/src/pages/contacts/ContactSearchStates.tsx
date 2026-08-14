/** 搜索错误行参数。 */
interface ContactSearchErrorProps {
  readonly label: string;
  readonly onRetry: () => void;
}

/** 显示真实失败并提供原 operation 重试。 */
export function ContactSearchError({ label, onRetry }: ContactSearchErrorProps) {
  return <div className="rn-contact-search-error" role="alert"><span>{label}</span><button type="button" onClick={onRetry}>重试</button></div>;
}

/** 搜索加载状态参数。 */
interface ContactSearchLoadingProps {
  readonly label: string;
}

/** 渲染不改变列表数据的 RN 品牌色加载状态。 */
export function ContactSearchLoading({ label }: ContactSearchLoadingProps) {
  return <div className="rn-contact-search-loading" aria-label={label}><span /></div>;
}

/** 搜索启动和配置状态参数。 */
interface ContactSearchPageStateProps {
  readonly label: string;
  readonly detail?: string | null;
}

/** 统一承载搜索页启动和配置错误。 */
export function ContactSearchPageState({ label, detail }: ContactSearchPageStateProps) {
  return <main className="rn-contact-search-page-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}
