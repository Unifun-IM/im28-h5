import {
  useCallback,
  useRef,
  useState,
  type PointerEventHandler,
  type TouchEventHandler,
} from 'react';

/** 下拉刷新触发距离与 RN 原生控件保持克制。 */
const PULL_REFRESH_THRESHOLD = 56;
/** 最大可见拉伸距离防止页面布局被手势撑开。 */
const PULL_REFRESH_MAX_DISTANCE = 76;

/** 将原始触摸位移按阻尼限制为可见下拉距离。 */
export function getPullRefreshDistance(delta: number): number {
  return Math.max(0, Math.min(PULL_REFRESH_MAX_DISTANCE, delta * 0.45));
}

/** 判断当前可见距离是否已经达到刷新阈值。 */
export function shouldTriggerPullRefresh(distance: number): boolean {
  return distance >= PULL_REFRESH_THRESHOLD;
}

/** PC 端只允许鼠标主键进入 pointer 下拉，避免与移动触摸事件重复处理。 */
export function shouldStartPointerPullRefresh(pointerType: string, button: number): boolean {
  return pointerType === 'mouse' && button === 0;
}

/** 列表下拉刷新适配器参数。 */
interface UsePullRefreshOptions {
  readonly refreshing: boolean;
  readonly onRefresh: () => Promise<void>;
}

/** 列表下拉刷新适配器返回触摸处理和可见距离。 */
export interface PullRefreshBinding {
  readonly pullDistance: number;
  readonly armed: boolean;
  readonly onTouchStart: TouchEventHandler<HTMLElement>;
  readonly onTouchMove: TouchEventHandler<HTMLElement>;
  readonly onTouchEnd: TouchEventHandler<HTMLElement>;
  readonly onTouchCancel: TouchEventHandler<HTMLElement>;
  readonly onPointerDown: PointerEventHandler<HTMLElement>;
  readonly onPointerMove: PointerEventHandler<HTMLElement>;
  readonly onPointerUp: PointerEventHandler<HTMLElement>;
  readonly onPointerCancel: PointerEventHandler<HTMLElement>;
}

/** 把浏览器触摸手势翻译成一次由页面注入的 canonical refresh。 */
export function usePullRefresh({
  refreshing,
  onRefresh,
}: UsePullRefreshOptions): PullRefreshBinding {
  /** startY 保存仅在页面顶部开始的手势起点。 */
  const startYRef = useRef<number | null>(null);
  /** pointerIDRef 只跟踪当前鼠标主键拖拽，触摸继续使用原 Touch Events。 */
  const pointerIDRef = useRef<number | null>(null);
  /** pullDistanceRef 保证快速结束手势时使用最后一次同步位移。 */
  const pullDistanceRef = useRef(0);
  /** pullDistance 驱动刷新指示器，不参与业务数据判断。 */
  const [pullDistance, setPullDistance] = useState(0);

  /** updatePullDistance 同步更新判断 ref 和可见 state。 */
  const updatePullDistance = useCallback((distance: number) => {
    pullDistanceRef.current = distance;
    setPullDistance(distance);
  }, []);

  /** resetPull 清理手势状态，供结束和取消共用。 */
  const resetPull = useCallback(() => {
    startYRef.current = null;
    pointerIDRef.current = null;
    updatePullDistance(0);
  }, [updatePullDistance]);

  /** onTouchStart 只在文档或内层列表顶部且未刷新时接管单指下拉。 */
  const onTouchStart = useCallback<TouchEventHandler<HTMLElement>>(event => {
    /** sceneScrollTop 读取保留式主场景的独立滚动位置。 */
    const sceneScrollTop = event.currentTarget
      .closest<HTMLElement>('[data-primary-tab-scene]')
      ?.scrollTop ?? 0;
    if (
      refreshing
      || globalThis.scrollY > 0
      || sceneScrollTop > 0
      || event.currentTarget.scrollTop > 0
      || event.touches.length !== 1
    ) return;
    startYRef.current = event.touches[0]?.clientY ?? null;
  }, [refreshing]);

  /** onTouchMove 将向下位移按阻尼映射为稳定指示距离。 */
  const onTouchMove = useCallback<TouchEventHandler<HTMLElement>>(event => {
    /** startY 缺失表示本次手势不属于刷新。 */
    const startY = startYRef.current;
    if (startY === null || event.touches.length !== 1) return;
    /** delta 只接受向下移动。 */
    const delta = (event.touches[0]?.clientY ?? startY) - startY;
    if (delta <= 0) {
      updatePullDistance(0);
      return;
    }
    if (event.cancelable) event.preventDefault();
    updatePullDistance(getPullRefreshDistance(delta));
  }, [updatePullDistance]);

  /** onPointerDown 为 platform=pc 提供鼠标主键下拉入口。 */
  const onPointerDown = useCallback<PointerEventHandler<HTMLElement>>(event => {
    /** sceneScrollTop 复用 retained tab scene 的顶部判断。 */
    const sceneScrollTop = event.currentTarget
      .closest<HTMLElement>('[data-primary-tab-scene]')
      ?.scrollTop ?? 0;
    if (
      !shouldStartPointerPullRefresh(event.pointerType, event.button)
      || refreshing
      || globalThis.scrollY > 0
      || sceneScrollTop > 0
      || event.currentTarget.scrollTop > 0
    ) return;
    pointerIDRef.current = event.pointerId;
    startYRef.current = event.clientY;
  }, [refreshing]);

  /** onPointerMove 将 PC 鼠标拖拽复用同一阻尼和阈值。 */
  const onPointerMove = useCallback<PointerEventHandler<HTMLElement>>(event => {
    if (pointerIDRef.current !== event.pointerId || startYRef.current === null) return;
    /** delta 保持只接受向下拖拽。 */
    const delta = event.clientY - startYRef.current;
    if (delta <= 0) {
      updatePullDistance(0);
      return;
    }
    if (event.cancelable) event.preventDefault();
    updatePullDistance(getPullRefreshDistance(delta));
  }, [updatePullDistance]);

  /** finishPull 达到阈值时只触发一次刷新，然后立即复位手势。 */
  const finishPull = useCallback(() => {
    /** shouldRefresh 在复位前冻结本次阈值判断。 */
    const shouldRefresh = shouldTriggerPullRefresh(pullDistanceRef.current) && !refreshing;
    resetPull();
    if (shouldRefresh) void onRefresh();
  }, [onRefresh, refreshing, resetPull]);

  /** onPointerUp 仅结束当前受控鼠标拖拽。 */
  const onPointerUp = useCallback<PointerEventHandler<HTMLElement>>(event => {
    if (pointerIDRef.current !== event.pointerId) return;
    finishPull();
  }, [finishPull]);

  /** onPointerCancel 清理鼠标手势，不触发刷新。 */
  const onPointerCancel = useCallback<PointerEventHandler<HTMLElement>>(event => {
    if (pointerIDRef.current !== event.pointerId) return;
    resetPull();
  }, [resetPull]);

  return {
    pullDistance,
    armed: pullDistance >= PULL_REFRESH_THRESHOLD,
    onTouchStart,
    onTouchMove,
    onTouchEnd: finishPull,
    onTouchCancel: resetPull,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  };
}
