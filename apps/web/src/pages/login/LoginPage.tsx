import { useEffect, useState, type FormEvent } from 'react';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useWebIMRuntime } from '../../runtime/index.js';

/** 登录页通过 Web runtime 建立真实 Gateway session。 */
export function LoginPage() {
  // runtime context 不暴露任何 token 字段。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // navigate 只由 React Router 管理页面切换。
  const navigate = useNavigate();
  // account 对应 Gateway account 登录字段。
  const [account, setAccount] = useState('');
  // password 仅保存在当前受控输入状态。
  const [password, setPassword] = useState('');
  // submitting 防止重复登录请求。
  const [submitting, setSubmitting] = useState(false);
  // error 展示当前登录失败且不伪装成功。
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (snapshot.userID) {
      navigate('/conversations', { replace: true });
    }
  }, [navigate, snapshot.userID]);

  /** 提交真实 Gateway account login。 */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!runtime || submitting) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await runtime.login({ type: 'account', account, password });
      navigate('/conversations', { replace: true });
    } catch (cause) {
      setError(readErrorMessage(cause));
    } finally {
      setSubmitting(false);
    }
  }

  // blockingError 优先显示部署配置或 session restore 错误。
  const blockingError = startupError && !runtime ? startupError : null;
  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="login-title">
        <header className="auth-brand">
          <span className="brand-mark" aria-hidden="true">28</span>
          <div>
            <p>IM28 Web</p>
            <h1 id="login-title">登录</h1>
          </div>
        </header>
        {blockingError ? (
          <div className="inline-error" role="alert">
            <strong>运行配置不可用</strong>
            <span>{blockingError}</span>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              <span>账号</span>
              <input
                name="account"
                autoComplete="username"
                value={account}
                onChange={event => setAccount(event.target.value)}
                disabled={restoring || submitting}
                required
              />
            </label>
            <label>
              <span>密码</span>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                disabled={restoring || submitting}
                required
              />
            </label>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <button
              className="primary-command"
              type="submit"
              disabled={restoring || submitting || !account.trim() || !password}
            >
              <LogIn size={18} aria-hidden="true" />
              {restoring ? '恢复会话中' : submitting ? '登录中' : '登录'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

/** 将登录异常转换为不包含凭据的可读文本。 */
function readErrorMessage(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '登录失败';
}
