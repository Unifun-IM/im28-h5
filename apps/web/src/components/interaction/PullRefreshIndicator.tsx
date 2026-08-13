/** 全局下拉刷新提示的纯展示参数。 */
export interface PullRefreshIndicatorProps {
  readonly refreshing: boolean;
  readonly armed: boolean;
  readonly pullDistance: number;
}

/** 统一投影下拉、释放和刷新三态，不持有业务读取逻辑。 */
export function PullRefreshIndicator({
  refreshing,
  armed,
  pullDistance,
}: PullRefreshIndicatorProps) {
  return (
    <div
      className={`im-pull-refresh${armed ? ' is-armed' : ''}`}
      style={{ height: refreshing ? 36 : pullDistance }}
      aria-hidden={!refreshing && pullDistance === 0}
    >
      <span>{refreshing ? '正在刷新' : armed ? '松开刷新' : '下拉刷新'}</span>
    </div>
  );
}
