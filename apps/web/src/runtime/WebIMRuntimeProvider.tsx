import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type PropsWithChildren,
} from 'react';
import type {
  WebIMRuntime,
  WebIMRuntimeSnapshot,
} from '@im28/im-sdk/web';

import { createConfiguredWebIMRuntime } from './create-configured-web-im-runtime.js';

/** Provider 向页面暴露无 token runtime、snapshot 和启动状态。 */
export interface WebIMRuntimeContextValue {
  readonly runtime: WebIMRuntime | null;
  readonly snapshot: WebIMRuntimeSnapshot;
  readonly restoring: boolean;
  readonly startupError: string | null;
}

/** Runtime 初始化结果保留 fail-closed 配置错误。 */
type RuntimeInitialization =
  | { readonly runtime: WebIMRuntime; readonly error: null }
  | { readonly runtime: null; readonly error: string };

// 匿名快照供配置失败和首轮初始化稳定复用。
const ANONYMOUS_SNAPSHOT: WebIMRuntimeSnapshot = {
  state: 'anonymous',
  userID: null,
  dataVersion: 0,
};

// Context 缺省值只用于检测 Provider 缺失。
const WebIMRuntimeContext = createContext<WebIMRuntimeContextValue | null>(
  null,
);

/** 创建唯一 browser runtime，并将配置异常转换为可展示状态。 */
function initializeRuntime(): RuntimeInitialization {
  try {
    return { runtime: createConfiguredWebIMRuntime(), error: null };
  } catch (cause) {
    return { runtime: null, error: readErrorMessage(cause) };
  }
}

/** 为所有 React Router 页面提供同一个 Web IM runtime。 */
export function WebIMRuntimeProvider({ children }: PropsWithChildren) {
  // initialization 在 Provider 生命周期内只执行一次。
  const [initialization] = useState(initializeRuntime);
  // restoring 表示 tab session 的 check-token/open DB 尚未结束。
  const [restoring, setRestoring] = useState(Boolean(initialization.runtime));
  // startupError 同时承载配置失败和 restore 失败。
  const [startupError, setStartupError] = useState<string | null>(
    initialization.error,
  );
  // subscribe 适配 useSyncExternalStore 并兼容配置失败状态。
  const subscribe = useCallback(
    (listener: () => void) =>
      initialization.runtime?.subscribe(listener) ?? (() => undefined),
    [initialization.runtime],
  );
  // getSnapshot 保持匿名 fallback 引用稳定。
  const getSnapshot = useCallback(
    () => initialization.runtime?.getSnapshot() ?? ANONYMOUS_SNAPSHOT,
    [initialization.runtime],
  );
  // snapshot 是页面判断 auth/routing 的唯一 runtime 状态。
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => ANONYMOUS_SNAPSHOT,
  );

  useEffect(() => {
    // runtime 缺失时配置错误已由 initialization 公开。
    const runtime = initialization.runtime;
    if (!runtime) {
      setRestoring(false);
      return;
    }
    // active 阻止旧 Provider 的异步 restore 回写新树。
    let active = true;
    void runtime
      .restore()
      .catch(cause => {
        if (active) {
          setStartupError(readErrorMessage(cause));
        }
      })
      .finally(() => {
        if (active) {
          setRestoring(false);
        }
      });
    return () => {
      active = false;
      runtime.dispose();
    };
  }, [initialization.runtime]);

  // value 仅在公开状态变化时替换，避免页面无关重渲染。
  const value = useMemo<WebIMRuntimeContextValue>(
    () => ({
      runtime: initialization.runtime,
      snapshot,
      restoring,
      startupError,
    }),
    [initialization.runtime, restoring, snapshot, startupError],
  );
  return (
    <WebIMRuntimeContext.Provider value={value}>
      {children}
    </WebIMRuntimeContext.Provider>
  );
}

/** 读取最近 Provider 的 Web IM runtime context。 */
export function useWebIMRuntime(): WebIMRuntimeContextValue {
  // context 缺失代表 App composition 错误，应立即失败。
  const context = useContext(WebIMRuntimeContext);
  if (!context) {
    throw new Error('useWebIMRuntime must be used inside WebIMRuntimeProvider.');
  }
  return context;
}

/** 将未知异常收敛为页面可读但不包含 token 的文本。 */
function readErrorMessage(cause: unknown): string {
  return cause instanceof Error && cause.message
    ? cause.message
    : 'Web IM runtime initialization failed.';
}
