import {
  createBrowserGatewayFetch,
  createWebIMAuthSessionStore,
  createWebIMDeviceIdentityStore,
  createWebIMRuntime,
  parseWebIMRuntimeConfig,
} from '../packages/im-sdk-web/dist/index.js';

/** Smoke 进程内 storage 不跨运行持久化任何凭据。 */
class MemoryStorage {
  #records = new Map();

  getItem(key) {
    return this.#records.get(key) ?? null;
  }

  setItem(key, value) {
    this.#records.set(key, value);
  }

  removeItem(key) {
    this.#records.delete(key);
  }
}

/** Transport smoke 只记录账号绑定，不在 Node 进程伪装浏览器 SQLite。 */
class GatewaySmokeAccountDatabaseLifecycle {
  #userID = null;

  async open(userID) {
    this.#userID = userID;
  }

  async close() {
    this.#userID = null;
  }

  getDatabase() {
    return null;
  }
}

/** 读取必填 smoke 变量，禁止带空值发起真实请求。 */
function requireEnvironment(name) {
  const value = process.env[name]?.trim() ?? '';
  if (!value) {
    throw new Error(`Missing required smoke environment: ${name}`);
  }
  return value;
}

/** 等待共享 realtime client 报告 online，超时则失败。 */
function waitForOnline(runtime, timeoutMs = 15_000) {
  return new Promise((resolve, reject) => {
    const completeIfOnline = () => {
      const snapshot = runtime.getSnapshot();
      if (snapshot.state === 'online') {
        clearTimeout(timer);
        unsubscribe();
        resolve(snapshot);
      }
    };
    const unsubscribe = runtime.subscribe(completeIfOnline);
    const timer = setTimeout(() => {
      unsubscribe();
      reject(new Error(`Gateway realtime smoke timed out after ${timeoutMs}ms.`));
    }, timeoutMs);
    completeIfOnline();
  });
}

/** 执行一次真实账号登录、WebSocket online 和远端退出闭环。 */
async function runGatewaySmoke() {
  const config = parseWebIMRuntimeConfig({
    VITE_GATEWAY_HTTP_URL: requireEnvironment('IM28_GATEWAY_HTTP_URL'),
    VITE_GATEWAY_WS_URL: requireEnvironment('IM28_GATEWAY_WS_URL'),
    VITE_IM_PLATFORM_ID: process.env.IM28_GATEWAY_PLATFORM_ID ?? '5',
    VITE_IM_LANGUAGE: process.env.IM28_GATEWAY_LANGUAGE ?? 'zh-CN',
  });
  const account = requireEnvironment('IM28_GATEWAY_ACCOUNT');
  const password = requireEnvironment('IM28_GATEWAY_PASSWORD');
  const authSessionStore = createWebIMAuthSessionStore(new MemoryStorage());
  const deviceIdentityStore = createWebIMDeviceIdentityStore(
    new MemoryStorage(),
    () => process.env.IM28_GATEWAY_DEVICE_ID?.trim() || crypto.randomUUID(),
  );
  const runtime = createWebIMRuntime({
    config,
    authSessionStore,
    deviceIdentityStore,
    fetch: createBrowserGatewayFetch(fetch),
    WebSocket,
    accountDatabase: new GatewaySmokeAccountDatabaseLifecycle(),
    reportBackgroundError: cause => {
      throw cause;
    },
    createRequestID: () => crypto.randomUUID(),
  });

  try {
    await runtime.login({ type: 'account', account, password });
    const snapshot = await waitForOnline(runtime);
    process.stdout.write(
      `${JSON.stringify({ status: 'passed', state: snapshot.state, userID: snapshot.userID })}\n`,
    );
  } finally {
    await runtime.signOut();
    runtime.dispose();
  }
}

runGatewaySmoke().catch(error => {
  process.stderr.write(
    `${JSON.stringify({ status: 'failed', message: error instanceof Error ? error.message : String(error) })}\n`,
  );
  process.exitCode = 1;
});
