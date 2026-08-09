import {
  WEB_IM_PLATFORM_TERM_KEYS,
  type WebIMPlatformTerm,
  type WebIMRuntime,
} from '@im28/im-sdk-web';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import backIconURL from '../../assets/rn/components/navbar/nav-arrow-left.svg';

/** 登录页平台条款查看器所需的 runtime 和可见状态。 */
interface LoginTermsDialogProps {
  readonly runtime: WebIMRuntime | null;
  readonly visible: boolean;
  readonly onClose: () => void;
}

/** 条款查看器显式区分加载、成功和失败状态。 */
type TermsLoadState = 'idle' | 'loading' | 'loaded' | 'error';

/** 按 RN 顺序加载用户协议和隐私政策并以全屏 modal 展示。 */
export function LoginTermsDialog({
  runtime,
  visible,
  onClose,
}: LoginTermsDialogProps) {
  // dialogRef 将 React 可见状态映射到浏览器原生 modal。
  const dialogRef = useRef<HTMLDialogElement>(null);
  // loadState 驱动加载、正文和重试三种明确 UI。
  const [loadState, setLoadState] = useState<TermsLoadState>('idle');
  // terms 只保存公开的平台条款正文。
  const [terms, setTerms] = useState<readonly WebIMPlatformTerm[]>([]);

  /** 通过 Web SDK runtime 并行查询两份公开平台条款。 */
  const loadTerms = useCallback(async (): Promise<void> => {
    if (!runtime) {
      setLoadState('error');
      return;
    }
    setLoadState('loading');
    try {
      // keys 顺序与 RN TermsViewer 的聚合顺序一致。
      const keys = [
        WEB_IM_PLATFORM_TERM_KEYS.userAgreement,
        WEB_IM_PLATFORM_TERM_KEYS.privacyPolicy,
      ] as const;
      // list 保持服务端条款内容原样进入隔离 iframe。
      const list = await Promise.all(keys.map(key => runtime.getPlatformTerm(key)));
      setTerms(list);
      setLoadState('loaded');
    } catch {
      setLoadState('error');
    }
  }, [runtime]);

  useEffect(() => {
    // 原生 dialog 只由 visible 控制打开和关闭。
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (visible && !dialog.open) dialog.showModal();
    if (!visible && dialog.open) dialog.close();
  }, [visible]);

  useEffect(() => {
    if (visible) void loadTerms();
  }, [loadTerms, visible]);

  // srcDoc 每次条款内容变化时重新构建隔离 HTML 文档。
  const srcDoc = useMemo(() => buildTermsHTML(terms), [terms]);

  return (
    <dialog
      ref={dialogRef}
      className="account-login-terms-dialog"
      aria-labelledby="terms-dialog-title"
      onCancel={event => {
        event.preventDefault();
        onClose();
      }}
    >
      <header className="account-login-terms-header">
        <button type="button" aria-label="返回" onClick={onClose}>
          <img src={backIconURL} alt="" />
        </button>
        <h2 id="terms-dialog-title">用户协议&amp;条款</h2>
        <span aria-hidden="true" />
      </header>
      {loadState === 'loading' || loadState === 'idle' ? (
        <div className="account-login-terms-state" role="status">
          <span className="account-login-spinner" aria-hidden="true" />
          <span>加载中</span>
        </div>
      ) : loadState === 'error' ? (
        <div className="account-login-terms-state" role="alert">
          <span>条款加载失败</span>
          <button type="button" onClick={() => void loadTerms()}>重新加载</button>
        </div>
      ) : (
        <iframe
          className="account-login-terms-frame"
          title="用户协议和隐私政策正文"
          sandbox=""
          srcDoc={srcDoc}
        />
      )}
    </dialog>
  );
}

/** 转义条款标题，正文则在 sandbox iframe 中按服务端 HTML 展示。 */
function escapeHTML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 构建带 CSP、亮暗主题和 RN 排版规则的隔离条款文档。 */
function buildTermsHTML(terms: readonly WebIMPlatformTerm[]): string {
  // sections 保持后端正文 HTML，同时转义所有纯文本标题。
  const sections = terms
    .map(term => {
      // title 为空时与 RN 一样不渲染标题节点。
      const title = term.title
        ? `<h1 class="term-title">${escapeHTML(term.title)}</h1>`
        : '';
      // content 为空时使用 RN 的明确占位文案。
      const content = term.content || '<p>暂无内容</p>';
      return `<section class="term-section">${title}${content}</section>`;
    })
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src 'unsafe-inline'"><style>:root{color-scheme:light dark}html,body{margin:0;padding:0;background:#f7f7f7;color:rgba(0,0,0,.6);font:15px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;overflow-wrap:break-word}body{padding:20px}.term-section+.term-section{margin-top:28px}.term-title{margin:0 0 12px;color:#000;font-size:18px;font-weight:700;letter-spacing:0}a{color:#7b61ff}img{max-width:100%;height:auto}table{max-width:100%}@media(prefers-color-scheme:dark){html,body{background:#111318;color:rgba(245,245,247,.7)}.term-title{color:#f5f5f7}a{color:#9a86ff}}</style></head><body>${sections}</body></html>`;
}
