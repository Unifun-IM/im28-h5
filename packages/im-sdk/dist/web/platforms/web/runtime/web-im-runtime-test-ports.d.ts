import type { WebIMAccountDatabaseLifecycle } from '../storage/index.js';
/** 创建不执行持久化的 runtime 单元测试端口。 */
export declare function createWebIMRuntimeTestPorts(): {
    readonly accountDatabase: WebIMAccountDatabaseLifecycle;
    readonly reportBackgroundError: (cause: unknown) => void;
};
//# sourceMappingURL=web-im-runtime-test-ports.d.ts.map