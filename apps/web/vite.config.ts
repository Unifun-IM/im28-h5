import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/** H5 应用仅配置 React 编译，业务代理和环境地址由后续 Gateway slice 冻结。 */
export default defineConfig({
  plugins: [react()],
});
