import { useCallback, useEffect, useState, type PropsWithChildren } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { OfflineChatPage } from '../pages/chat/OfflineChatPage.js';
import { OfflineConversationsPage } from '../pages/conversations/OfflineConversationsPage.js';
import { useWebIMRuntime } from './WebIMRuntimeProvider.js';
import './offline-runtime.css';

/** 离线边界只挂载合同允许的会话列表与聊天历史路由。 */
export function OfflineRuntimeBoundary({ children }: PropsWithChildren) {
  // runtime context 是离线 reader、重试与本地退出的唯一 owner。
  const { runtime, snapshot } = useWebIMRuntime();
  // operationError 显式展示最近一次真实重连或退出失败。
  const [operationError, setOperationError] = useState<string | null>(null);
  // offline 只接受 SDK 生命周期的两个显式状态。
  const offline = snapshot.state === 'offline-readonly' ||
    snapshot.state === 'offline-validating';
  // reconnecting 控制重试按钮单飞反馈。
  const reconnecting = snapshot.state === 'offline-validating';

  /** 请求 SDK 重新校验会话，网络失败继续保留只读页面。 */
  const reconnect = useCallback(async (): Promise<void> => {
    if (!runtime || runtime.getSnapshot().state !== 'offline-readonly') return;
    setOperationError(null);
    try {
      await runtime.reconnect();
    } catch (cause) {
      setOperationError(readOfflineRuntimeError(cause));
    }
  }, [runtime]);

  /** 离线退出只清除本地 session 与数据库 owner。 */
  const signOut = useCallback(async (): Promise<void> => {
    if (!runtime) return;
    setOperationError(null);
    try {
      await runtime.signOut();
    } catch (cause) {
      setOperationError(readOfflineRuntimeError(cause));
    }
  }, [runtime]);

  useEffect(() => {
    if (!offline) setOperationError(null);
  }, [offline]);

  useEffect(() => {
    if (!offline || !runtime) return undefined;
    /** handleOnline 只把浏览器网络事件当作重试信号。 */
    const handleOnline = (): void => {
      void reconnect();
    };
    globalThis.addEventListener('online', handleOnline);
    return () => globalThis.removeEventListener('online', handleOnline);
  }, [offline, reconnect, runtime]);

  if (!offline || !runtime || !snapshot.userID) return <>{children}</>;
  // reader 由 runtime 按当前 lifecycle 和账号数据库动态门禁。
  const reader = runtime.getOfflineReader();
  return (
    <div className="im-offline-shell" data-im-runtime-state={snapshot.state}>
      <aside className="im-offline-banner" role="status">
        <span className="im-offline-banner-copy">
          <strong>{reconnecting ? '正在恢复连接' : '当前处于离线只读模式'}</strong>
          <small>{operationError || '仅可查看已缓存的会话与消息'}</small>
        </span>
        <span className="im-offline-banner-actions">
          <button type="button" disabled={reconnecting} onClick={() => void reconnect()}>
            {reconnecting ? '连接中' : '重试'}
          </button>
          <button type="button" onClick={() => void signOut()}>
            退出
          </button>
        </span>
      </aside>
      <div className="im-offline-shell-content">
        <Routes>
          <Route
            path="/conversations"
            element={<OfflineConversationsPage reader={reader} userID={snapshot.userID} />}
          />
          <Route
            path="/conversations/:conversationID"
            element={<OfflineChatPage reader={reader} userID={snapshot.userID} />}
          />
          <Route path="*" element={<Navigate to="/conversations" replace />} />
        </Routes>
      </div>
    </div>
  );
}

/** 将未知离线操作异常转换为无凭据页面文案。 */
function readOfflineRuntimeError(cause: unknown): string {
  return cause instanceof Error && cause.message
    ? cause.message
    : '连接失败，请稍后重试';
}
