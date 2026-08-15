import { Route, Routes } from 'react-router-dom';

import { NotFoundPage } from '../pages/not-found/NotFoundPage.js';
import { renderChatRoutes } from './AppChatRoutes.js';
import { renderCoreRoutes } from './AppCoreRoutes.js';

/** SPA 路由树组合通用域与聊天域账本，并统一持有最终缺省路由。 */
export function AppRouteTree() {
  return (
    <Routes>
      {renderCoreRoutes()}
      {renderChatRoutes()}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
