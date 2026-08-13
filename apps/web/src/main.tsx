import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/App.js';
import { initializeWebThemePreference } from './runtime/theme-preference.js';
import './app/app.css';
import './components/navigation/page-navbar.css';
import './components/interaction/interaction.css';

// React 渲染前恢复 RN 同源主题偏好，避免首屏颜色闪烁。
initializeWebThemePreference();

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
