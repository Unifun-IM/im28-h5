import {
  WEB_IM_PLATFORM_TERM_KEYS,
  type WebIMPlatformTerm,
} from '@im28/im-sdk/web';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { buildPlatformTermsDocument } from '../../components/platform-terms/platform-terms-document.js';
import { useWebIMRuntime } from '../../runtime/index.js';
import { MeProfileHeader } from './MeProfileHeader.js';
import './me-page.css';
import './me-profile-page.css';
import './me-settings-page.css';

/** RN 用户协议页通过已有 runtime 查询两份真实平台条款。 */
export function MeTermsPage() {
  // runtime context 是平台条款唯一页面入口。
  const { runtime, snapshot, restoring, startupError } = useWebIMRuntime();
  // terms 保留 Gateway 返回的用户协议与隐私政策顺序。
  const [terms, setTerms] = useState<readonly WebIMPlatformTerm[]>([]);
  // loading 区分首轮读取和已加载正文。
  const [loading, setLoading] = useState(false);
  // error 显示真实条款请求失败。
  const [error, setError] = useState<string | null>(null);

  /** 并行读取 RN 聚合页要求的两份平台条款。 */
  const loadTerms = useCallback(async (): Promise<void> => {
    if (!runtime) return;
    setLoading(true);
    setError(null);
    try {
      // keys 保持 RN 用户协议在前、隐私政策在后。
      const keys = [
        WEB_IM_PLATFORM_TERM_KEYS.userAgreement,
        WEB_IM_PLATFORM_TERM_KEYS.privacyPolicy,
      ] as const;
      setTerms(await Promise.all(keys.map(key => runtime.getPlatformTerm(key))));
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : '条款加载失败');
    } finally {
      setLoading(false);
    }
  }, [runtime]);

  useEffect(() => { void loadTerms(); }, [loadTerms]);

  // srcDoc 复用登录页 CSP/sandbox 条款文档 owner。
  const srcDoc = useMemo(() => buildPlatformTermsDocument(terms), [terms]);

  if (restoring) return <TermsPageState label="正在恢复条款" />;
  if (!runtime) return <TermsPageState label="运行配置不可用" detail={startupError} />;
  if (!snapshot.userID) return <Navigate to="/login" replace />;

  return (
    <main className="rn-me-settings-page">
      <section className="rn-me-settings-surface is-terms">
        <MeProfileHeader title="用户协议&条款" backHref="/me/settings" />
        {loading ? <div className="rn-me-terms-state" role="status">加载中</div> : error ? (
          <div className="rn-me-terms-state" role="alert"><span>{error}</span><button type="button" onClick={() => void loadTerms()}>重新加载</button></div>
        ) : <iframe className="rn-me-terms-frame" title="用户协议和隐私政策正文" sandbox="" srcDoc={srcDoc} />}
      </section>
    </main>
  );
}

/** 统一承载条款页启动状态。 */
function TermsPageState({ label, detail }: { readonly label: string; readonly detail?: string | null }) {
  return <main className="rn-me-page-state"><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</main>;
}
