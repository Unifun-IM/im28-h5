import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ChatPage } from '../pages/chat/ChatPage.js';
import { ConversationsPage } from '../pages/conversations/ConversationsPage.js';
import { LoginPage } from '../pages/login/LoginPage.js';
import { NotFoundPage } from '../pages/not-found/NotFoundPage.js';
import { WebIMRuntimeProvider } from '../runtime/index.js';

/** Web 应用根组件只负责装配浏览器路由，页面能力由对应 page owner 承担。 */
export function App() {
  return (
    <BrowserRouter>
      <WebIMRuntimeProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/conversations" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/conversations" element={<ConversationsPage />} />
          <Route
            path="/conversations/:conversationID"
            element={<ChatPage />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </WebIMRuntimeProvider>
    </BrowserRouter>
  );
}
