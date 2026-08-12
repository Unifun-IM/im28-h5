import { useEffect, type RefObject } from 'react';

/** 尾部节点动效参数约束容器、节点选择器和瞬时类名。 */
interface TailItemMotionOptions {
  readonly containerRef: RefObject<HTMLElement | null>;
  readonly itemSelector: string;
  readonly motionClassName: string;
  readonly enabled: boolean;
}

/** 仅标记初次渲染之后追加到列表尾部的节点，历史前插保持静止。 */
export function useTailItemMotion({
  containerRef,
  itemSelector,
  motionClassName,
  enabled,
}: TailItemMotionOptions) {
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // container 是需要区分历史前插与实时尾部追加的列表。
    const container = containerRef.current;
    if (!container) return;
    // initialItems 建立挂载时已有历史消息的尾部基线。
    const initialItems = Array.from(container.querySelectorAll<HTMLElement>(itemSelector));
    // previousTail 保存上一批 DOM 提交后的最后一条消息。
    let previousTail = initialItems.at(-1) ?? null;
    /** 为单条实时新增消息添加一次性入场类并在结束后清理。 */
    function animateItem(item: HTMLElement) {
      item.classList.add(motionClassName);
      /** 单条入场结束后清除瞬时类，保持 DOM 状态可重复使用。 */
      function handleAnimationEnd() {
        item.classList.remove(motionClassName);
      }
      item.addEventListener('animationend', handleAnimationEnd, { once: true });
    }
    // observer 在 React 提交新节点后判断它们位于旧尾部之前还是之后。
    const observer = new MutationObserver(() => {
      // nextItems 是本轮提交后的完整消息行顺序。
      const nextItems = Array.from(container.querySelectorAll<HTMLElement>(itemSelector));
      // nextTail 将成为下一轮增量判断的稳定基线。
      const nextTail = nextItems.at(-1) ?? null;
      if (!previousTail) {
        nextItems.forEach(animateItem);
        previousTail = nextTail;
        return;
      }
      if (!nextItems.includes(previousTail)) {
        previousTail = nextTail;
        return;
      }
      // previousTailIndex 用于排除添加在旧尾部之前的历史记录。
      const previousTailIndex = nextItems.indexOf(previousTail);
      // appendedItems 只包含旧尾部之后真实新增的消息行。
      const appendedItems = nextItems.slice(previousTailIndex + 1);
      appendedItems.forEach(animateItem);
      previousTail = nextTail;
    });
    observer.observe(container, { childList: true });
    return () => observer.disconnect();
  }, [containerRef, enabled, itemSelector, motionClassName]);
}
