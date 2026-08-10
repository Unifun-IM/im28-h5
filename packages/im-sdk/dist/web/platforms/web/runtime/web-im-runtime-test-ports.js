/** 创建不执行持久化的 runtime 单元测试端口。 */
export function createWebIMRuntimeTestPorts() {
    return {
        accountDatabase: {
            open: async () => undefined,
            close: async () => undefined,
            getDatabase: () => null,
        },
        reportBackgroundError: cause => {
            throw cause;
        },
    };
}
//# sourceMappingURL=web-im-runtime-test-ports.js.map