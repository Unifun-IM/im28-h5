import { BrowserRouter } from 'react-router-dom';

import { AppToastProvider, RouteMotionController } from '../components/interaction/index.js';
import { AuthOnboardingProvider } from '../pages/login/AuthOnboardingProvider.js';
import { QRCodeModalProvider } from '../pages/qr/QRCodeModalProvider.js';
import { ChatShareModalProvider } from '../pages/share/ChatShareModalProvider.js';
import { OfflineRuntimeBoundary, WebIMCallProvider, WebIMRuntimeProvider } from '../runtime/index.js';
import { AppRouteTree } from './AppRouteTree.js';

/** Web 应用根组件只装配全局 provider，SPA 路由账本由 AppRouteTree 唯一持有。 */
export function App() {
  return (
    <AppToastProvider>
      <BrowserRouter>
        <WebIMRuntimeProvider>
          <OfflineRuntimeBoundary>
            <WebIMCallProvider>
              <AuthOnboardingProvider>
                <ChatShareModalProvider>
                  <QRCodeModalProvider>
                    <RouteMotionController />
                    <AppRouteTree />
                  </QRCodeModalProvider>
                </ChatShareModalProvider>
              </AuthOnboardingProvider>
            </WebIMCallProvider>
          </OfflineRuntimeBoundary>
        </WebIMRuntimeProvider>
      </BrowserRouter>
    </AppToastProvider>
  );
}
