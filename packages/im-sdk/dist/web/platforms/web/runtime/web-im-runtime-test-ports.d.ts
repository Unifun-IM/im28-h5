import type { DatabaseAdapter } from '@im28/im-sdk/core';
import type { WebIMAccountDatabaseLifecycle } from '../storage/index.js';
/** 创建支持空查询与写入计数的最小 runtime 测试数据库。 */
export declare function createWebIMRuntimeTestDatabase(): DatabaseAdapter;
/** 创建不执行持久化的 runtime 单元测试端口。 */
export declare function createWebIMRuntimeTestPorts(): {
    readonly accountDatabase: WebIMAccountDatabaseLifecycle;
    readonly reportBackgroundError: (cause: unknown) => void;
};
//# sourceMappingURL=web-im-runtime-test-ports.d.ts.map