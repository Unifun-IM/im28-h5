import { Link } from 'react-router-dom';

/** 未匹配页面提供明确返回入口，避免路由错误落入空白页。 */
export function NotFoundPage() {
  return (
    <main className="app-shell">
      <section className="not-found" aria-labelledby="not-found-title">
        <p>404</p>
        <h1 id="not-found-title">页面不存在</h1>
        <Link to="/">返回 IM28</Link>
      </section>
    </main>
  );
}
