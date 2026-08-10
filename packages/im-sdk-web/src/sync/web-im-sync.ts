import type { GatewayHTTPClient } from '@im28/im-sdk/web';

import { createWebIMCallSync, type WebIMCallSync } from './call-sync.js';

import {
  createWebIMConversationSync,
  type WebIMConversationSync,
} from './conversation-sync.js';
import {
  createWebIMMessageSync,
  type WebIMMessageSync,
} from './message-sync.js';
import {
  createWebIMRealtimeSync,
  type WebIMRealtimeSync,
} from './realtime-sync.js';
import { createWebIMSyncMutationQueue } from './sync-mutation-queue.js';
import type { WebIMSyncContextDependencies } from './sync-context.js';
import {
  createWebIMContactSync,
  type WebIMContactSync,
} from './contact-sync.js';
import { createWebIMProfileSync, type WebIMProfileSync } from './profile-sync.js';

/** Runtime 对页面公开的聚合数据同步入口。 */
export interface WebIMSync {
  readonly calls: WebIMCallSync;
  readonly contacts: WebIMContactSync;
  readonly conversations: WebIMConversationSync;
  readonly messages: WebIMMessageSync;
  readonly profile: WebIMProfileSync;
  readonly realtime: WebIMRealtimeSync;
}

/** 聚合入口依赖复用同一 Gateway、account DB 与 auth owner。 */
export interface WebIMSyncDependencies extends WebIMSyncContextDependencies {
  readonly gatewayClient: GatewayHTTPClient;
  readonly createClientMessageID?: () => string;
  readonly now?: () => number;
}

/** 创建联系人、会话与消息共享认证上下文的同步 facade。 */
export function createWebIMSync(
  dependencies: WebIMSyncDependencies,
): WebIMSync {
  // mutationQueue 让所有远端拉取和本地写入按调用顺序完整执行。
  const mutationQueue = createWebIMSyncMutationQueue();
  // sharedDependencies 仅增加队列 owner，不复制 Gateway 或账号状态。
  const sharedDependencies = { ...dependencies, mutationQueue };
  return {
    calls: createWebIMCallSync(sharedDependencies),
    contacts: createWebIMContactSync(dependencies),
    conversations: createWebIMConversationSync(sharedDependencies),
    messages: createWebIMMessageSync(sharedDependencies),
    profile: createWebIMProfileSync(dependencies),
    realtime: createWebIMRealtimeSync(sharedDependencies),
  };
}
