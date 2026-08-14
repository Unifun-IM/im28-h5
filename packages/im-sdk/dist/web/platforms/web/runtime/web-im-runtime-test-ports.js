/** 创建支持空查询与写入计数的最小 runtime 测试数据库。 */
export function createWebIMRuntimeTestDatabase() {
    return {
        name: 'runtime-test.sqlite',
        open: async () => undefined,
        close: async () => undefined,
        execute: async () => ({ rowsAffected: 0 }),
        query: async () => [],
        transaction: async (run) => run({
            execute: async () => ({ rowsAffected: 0 }),
            query: async () => [],
        }),
    };
}
/** 创建不执行持久化的 runtime 单元测试端口。 */
export function createWebIMRuntimeTestPorts() {
    // database 让认证后的恢复步骤运行在完整账号库 contract 上。
    const database = createWebIMRuntimeTestDatabase();
    return {
        accountDatabase: {
            open: async () => undefined,
            openExistingReadOnly: async () => undefined,
            close: async () => undefined,
            getDatabase: () => database,
        },
        reportBackgroundError: cause => {
            throw cause;
        },
    };
}
//# sourceMappingURL=web-im-runtime-test-ports.js.map