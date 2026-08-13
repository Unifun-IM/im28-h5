import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/** 页面入场类只添加到当前 main，避免固定 TabBar 一同闪动。 */
const PAGE_ENTER_CLASS_NAME = 'im-page-enter';

/** 监听 React Router 页面变化并在不重挂载页面的前提下播放入场。 */
export function RouteMotionController() {
  // location 提供 SPA 页面切换后的稳定路径。
  const location = useLocation();
  // previousPathRef 跳过首屏并区分真正的页面路径变化。
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    if (previousPathRef.current === location.pathname) return;
    previousPathRef.current = location.pathname;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // page 优先选择当前 Activity 场景，避免给隐藏主页面添加入场类。
    const page = document.querySelector<HTMLElement>(
      '#root [data-primary-tab-scene="active"] main, #root main',
    );
    if (!page) return;
    // pageElement 固化空值检查后的页面节点供异步回调安全使用。
    const pageElement = page;
    pageElement.classList.remove(PAGE_ENTER_CLASS_NAME);
    // frameID 确保移除和重新添加类分属两帧，从而可靠重启动画。
    const frameID = window.requestAnimationFrame(() => {
      pageElement.classList.add(PAGE_ENTER_CLASS_NAME);
    });
    /** 动画完成后移除瞬时类，避免影响页面后续样式。 */
    function handleAnimationEnd() {
      pageElement.classList.remove(PAGE_ENTER_CLASS_NAME);
    }
    pageElement.addEventListener('animationend', handleAnimationEnd, { once: true });
    return () => {
      window.cancelAnimationFrame(frameID);
      pageElement.removeEventListener('animationend', handleAnimationEnd);
      pageElement.classList.remove(PAGE_ENTER_CLASS_NAME);
    };
  }, [location.pathname]);

  return null;
}
