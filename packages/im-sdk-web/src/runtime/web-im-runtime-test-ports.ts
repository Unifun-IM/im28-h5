import type {
  WebIMAccountDatabaseLifecycle,
} from '../storage/index.js';

/** 创建不执行持久化的 runtime 单元测试端口。 */
export function createWebIMRuntimeTestPorts(): {
  readonly accountDatabase: WebIMAccountDatabaseLifecycle;
  readonly reportBackgroundError: (cause: unknown) => void;
} {
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
