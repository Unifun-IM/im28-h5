import type { WebIMPlatformTerm } from '@im28/im-sdk/web';

/** 转义条款标题，正文由 sandbox iframe 隔离。 */
function escapePlatformTermTitle(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 构建登录和设置页共用的隔离条款 HTML 文档。 */
export function buildPlatformTermsDocument(
  terms: readonly WebIMPlatformTerm[],
): string {
  // sections 保持后端正文 HTML，同时转义所有纯文本标题。
  const sections = terms
    .map(term => {
      // title 为空时与 RN 一样不渲染标题节点。
      const title = term.title
        ? `<h1 class="term-title">${escapePlatformTermTitle(term.title)}</h1>`
        : '';
      // content 为空时使用 RN 的明确空态。
      const content = term.content || '<p>暂无内容</p>';
      return `<section class="term-section">${title}${content}</section>`;
    })
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src 'unsafe-inline'"><style>:root{color-scheme:light dark}html,body{margin:0;padding:0;background:#f7f7f7;color:rgba(0,0,0,.6);font:15px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;overflow-wrap:break-word}body{padding:20px}.term-section+.term-section{margin-top:28px}.term-title{margin:0 0 12px;color:#000;font-size:18px;font-weight:700;letter-spacing:0}a{color:#7b61ff}img{max-width:100%;height:auto}table{max-width:100%}@media(prefers-color-scheme:dark){html,body{background:#111318;color:rgba(245,245,247,.7)}.term-title{color:#f5f5f7}a{color:#9a86ff}}</style></head><body>${sections}</body></html>`;
}
