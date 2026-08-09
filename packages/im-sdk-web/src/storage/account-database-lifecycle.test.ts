import { createRequire } from 'node:module';

import { MessageRepository, type Message } from '@im28/im-sdk/web';
import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';

import { createWebIMAccountDatabaseLifecycle } from './account-database-lifecycle.js';

// 当前 package 的解析器用于定位测试环境中的 sql.js WASM。
const require = createRequire(import.meta.url);
// 测试加载真实 sql.js WASM，避免用内存假实现掩盖迁移错误。
const SQLJS_WASM_PATH = require.resolve('sql.js/dist/sql-wasm.wasm');

/** 创建可验证账号切换和持久化恢复的测试消息。 */
function createTestMessage(userID: string): Message {
  return {
    clientMsgID: `client-${userID}`,
    serverMsgID: `server-${userID}`,
    conversationID: 'single-peer',
    senderID: userID,
    direction: 'outgoing',
    contentType: 101,
    status: 'sent',
    sendTime: 1_800_000_000_000,
    seq: 1,
    payload: { text: `hello ${userID}` },
  };
}

// 账号数据库生命周期的真实 sql.js + IndexedDB 回归集合。
describe('Web IM account database lifecycle', () => {
  // 验证切换账号时关闭旧库，并在重开时恢复各自缓存。
  it('migrates, switches and restores account-scoped databases', async () => {
    // 隔离 factory 模拟单一干净浏览器 origin。
    const lifecycle = createWebIMAccountDatabaseLifecycle({
      indexedDB: new IDBFactory(),
      locateWasmFile: () => SQLJS_WASM_PATH,
    });

    await lifecycle.open('user-a');
    // migration 完成后共享 Repository 应可立即读写。
    const userAMessage = createTestMessage('user-a');
    await new MessageRepository(lifecycle.getDatabase()!).upsert(userAMessage);

    await lifecycle.open('user-b');
    // 新账号数据库不能看到前一账号消息。
    await expect(
      new MessageRepository(lifecycle.getDatabase()!).getByClientMsgID(
        userAMessage.clientMsgID,
      ),
    ).resolves.toBeNull();

    await lifecycle.open('user-a');
    // 重开 user-a 时应从 IndexedDB 恢复已提交 snapshot。
    await expect(
      new MessageRepository(lifecycle.getDatabase()!).getByClientMsgID(
        userAMessage.clientMsgID,
      ),
    ).resolves.toEqual(userAMessage);

    await lifecycle.close();
    expect(lifecycle.getDatabase()).toBeNull();
  });
});
