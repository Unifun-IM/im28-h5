import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/App.js';
import './app/app.css';

// 根节点缺失代表 HTML 壳损坏，应立即失败而不是静默展示空白页。
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('IM28 Web root element is missing.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
