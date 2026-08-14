import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/** 全局 Toast 只区分当前 H5 已使用的默认、成功和失败语义。 */
export type AppToastVariant = 'default' | 'success' | 'error';

/** Toast 可选项允许调用方覆盖默认展示时长。 */
interface AppToastOptions {
  readonly duration?: number;
  readonly type?: AppToastVariant;
}

/** Toast 命令 API 与 RN 的 show/success/error 使用方式保持一致。 */
interface AppToastApi {
  readonly show: (message: string, options?: AppToastOptions) => void;
  readonly success: (message: string, options?: AppToastOptions) => void;
  readonly error: (message: string, options?: AppToastOptions) => void;
}

/** Provider 上下文同时暴露命令 API 和显式关闭能力。 */
interface AppToastContextValue {
  readonly toast: AppToastApi;
  readonly hideToast: () => void;
}

/** 当前 Toast 状态只保存已归一化的可见文案和类型。 */
interface AppToastState {
  readonly message: string;
  readonly type: AppToastVariant;
}

/** 全局 Toast Provider 接收应用树和可测试的默认时长。 */
interface AppToastProviderProps {
  readonly children: ReactNode;
  readonly defaultDuration?: number;
}

/** 默认展示时长复用 RN 的 1600ms 交互节奏。 */
const DEFAULT_TOAST_DURATION_MS = 1600;

/** 未挂载 Provider 时保持命令安全无副作用。 */
const EMPTY_TOAST_API: AppToastApi = {
  show: () => undefined,
  success: () => undefined,
  error: () => undefined,
};

/** ToastContext 是应用内唯一提示浮层命令通道。 */
const AppToastContext = createContext<AppToastContextValue>({
  toast: EMPTY_TOAST_API,
  hideToast: () => undefined,
});

/** 在应用顶层承载唯一 Toast，页面不得自行绘制成功或失败横幅。 */
export function AppToastProvider({
  children,
  defaultDuration = DEFAULT_TOAST_DURATION_MS,
}: AppToastProviderProps) {
  // visibleToast 保存当前唯一可见提示，后发命令替换前一条。
  const [visibleToast, setVisibleToast] = useState<AppToastState | null>(null);
  // hideTimerRef 管理当前提示的自动关闭计时器。
  const hideTimerRef = useRef<number | null>(null);

  /** 释放旧计时器，避免连续操作提前关闭后一条 Toast。 */
  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current === null) return;
    window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = null;
  }, []);

  /** 立即关闭当前 Toast 并释放自动关闭计时器。 */
  const hideToast = useCallback(() => {
    clearHideTimer();
    setVisibleToast(null);
  }, [clearHideTimer]);

  /** 归一化文案后显示 Toast，空文案保持无副作用。 */
  const showToast = useCallback((message: string, options: AppToastOptions = {}) => {
    // normalizedMessage 防止只含空白的操作结果占据全局浮层。
    const normalizedMessage = message.trim();
    if (!normalizedMessage) return;
    clearHideTimer();
    setVisibleToast({
      message: normalizedMessage,
      type: options.type ?? 'default',
    });
    hideTimerRef.current = window.setTimeout(() => {
      setVisibleToast(null);
      hideTimerRef.current = null;
    }, options.duration ?? defaultDuration);
  }, [clearHideTimer, defaultDuration]);

  // toastApi 提供与 RN 一致的 success/error 语义入口。
  const toastApi = useMemo<AppToastApi>(() => ({
    show: showToast,
    success: (message, options = {}) => showToast(message, { ...options, type: 'success' }),
    error: (message, options = {}) => showToast(message, { ...options, type: 'error' }),
  }), [showToast]);

  // contextValue 保持稳定，避免命令消费者因提示状态变化重渲染。
  const contextValue = useMemo<AppToastContextValue>(() => ({
    toast: toastApi,
    hideToast,
  }), [hideToast, toastApi]);

  useEffect(() => clearHideTimer, [clearHideTimer]);

  return (
    <AppToastContext.Provider value={contextValue}>
      {children}
      <div className="im-toast-host" aria-live="polite" aria-atomic="true">
        {visibleToast ? (
          <p
            className={`im-toast is-${visibleToast.type}`}
            role={visibleToast.type === 'error' ? 'alert' : 'status'}
          >
            <span className="im-toast-icon" aria-hidden="true">
              {visibleToast.type === 'success' ? '✓' : visibleToast.type === 'error' ? '!' : ''}
            </span>
            <span>{visibleToast.message}</span>
          </p>
        ) : null}
      </div>
    </AppToastContext.Provider>
  );
}

/** 页面通过统一 Hook 触发全局提示，不直接操作 Toast DOM。 */
export function useAppToast(): AppToastContextValue {
  return useContext(AppToastContext);
}
