import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/** H5 应用仅配置 React 编译，业务代理和环境地址由后续 Gateway slice 冻结。 */
export default defineConfig({
  plugins: [react()],
  /** 稳定第三方依赖分包，避免主应用与共享运行时因 vendor 聚合触发体积告警。 */
  build: {
    rollupOptions: {
      output: {
        /** Rolldown 仅接受函数形式，按稳定包路径拆分且不介入业务模块归属。 */
        manualChunks: id => {
          if (/\/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) return 'react-vendor';
          if (id.includes('/node_modules/zod/')) return 'validation-vendor';
          if (/\/node_modules\/(qrcode|dijkstrajs)\//.test(id)) return 'qr-vendor';
          return undefined;
        },
      },
    },
  },
});
