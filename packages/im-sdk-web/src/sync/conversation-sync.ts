import {
  ConversationRepository,
  MessageRepository,
  mapGatewayConversationToCore,
  type Conversation,
  type ConversationListOptions,
  type GatewayConversation,
  type GatewayHTTPClient,
  type Message,
} from '@im28/im-sdk/web';

import {
  createWebIMSyncError,
  requireWebIMSyncContext,
  type WebIMSyncContext,
  type WebIMSyncContextDependencies,
} from './sync-context.js';
import {
  createWebIMSyncMutationQueue,
  type WebIMSyncMutationQueue,
  type WebIMSyncMutationQueueDependencies,
} from './sync-mutation-queue.js';

/** 单次远端会话同步的分页限制。 */
export interface WebIMConversationSyncOptions {
  readonly pageSize?: number;
}

/** 会话列表缓存项同时提供对应的最新消息，避免页面直接查询 Repository。 */
export interface WebIMConversationListItem {
  readonly conversation: Conversation;
  readonly latestMessage: Message | null;
}

/** 页面可消费的 cache-first 会话能力。 */
export interface WebIMConversationSync {
  listCached(
    options?: ConversationListOptions,
  ): Promise<readonly Conversation[]>;
  listCachedItems(
    options?: ConversationListOptions,
  ): Promise<readonly WebIMConversationListItem[]>;
  sync(
    options?: WebIMConversationSyncOptions,
  ): Promise<readonly Conversation[]>;
}

/** 会话同步依赖只接收 runtime 已持有的 canonical owners。 */
export interface WebIMConversationSyncDependencies
  extends WebIMSyncContextDependencies,
    WebIMSyncMutationQueueDependencies {
  readonly gatewayClient: GatewayHTTPClient;
}

/** 创建认证账号绑定的浏览器会话同步服务。 */
export function createWebIMConversationSync(
  dependencies: WebIMConversationSyncDependencies,
): WebIMConversationSync {
  return new WebIMConversationSyncImpl(dependencies);
}

/** 会话服务只编排 Gateway、mapping 和共享 Repository。 */
class WebIMConversationSyncImpl implements WebIMConversationSync {
  // dependencies 动态读取当前 runtime 账号和数据库。
  private readonly dependencies: WebIMConversationSyncDependencies;
  // mutationQueue 在聚合 facade 中与消息和 realtime 共用。
  private readonly mutationQueue: WebIMSyncMutationQueue;

  /** 保存 runtime owners，不复制 transport 或 storage 状态。 */
  constructor(dependencies: WebIMConversationSyncDependencies) {
    this.dependencies = dependencies;
    this.mutationQueue =
      dependencies.mutationQueue ?? createWebIMSyncMutationQueue();
  }

  /** 从当前账号 SQLite 返回排序后的会话 cache。 */
  async listCached(
    options: ConversationListOptions = {},
  ): Promise<readonly Conversation[]> {
    // context 保证 auth 与 account database 同时可用。
    const context = requireWebIMSyncContext(
      this.dependencies,
      'Conversation sync',
    );
    // repository 每次绑定当前 database，禁止跨账号复用实例。
    const repository = new ConversationRepository(context.database);
    return repository.list(options);
  }

  /** 从当前账号 SQLite 组合会话与最新消息，供列表稳定渲染摘要。 */
  async listCachedItems(
    options: ConversationListOptions = {},
  ): Promise<readonly WebIMConversationListItem[]> {
    // context 保证会话与消息读取始终来自同一账号数据库。
    const context = requireWebIMSyncContext(
      this.dependencies,
      'Conversation sync',
    );
    // conversationRepository 保留共享 SDK 的排序和归档语义。
    const conversationRepository = new ConversationRepository(
      context.database,
    );
    // messageRepository 是最新消息 payload 的唯一读取 owner。
    const messageRepository = new MessageRepository(context.database);
    // conversations 先冻结本轮列表窗口，避免组合过程中改变排序。
    const conversations = await conversationRepository.list(options);
    return Promise.all(
      conversations.map(async conversation => ({
        conversation,
        latestMessage: conversation.latestMessageID
          ? await messageRepository.getByClientMsgID(
              conversation.latestMessageID,
            )
          : null,
      })),
    );
  }

  /** 全分页拉取 Gateway 会话后替换当前账号 cache。 */
  async sync(
    options: WebIMConversationSyncOptions = {},
  ): Promise<readonly Conversation[]> {
    // context 在网络请求前冻结本轮 user/database owner。
    const context = requireWebIMSyncContext(
      this.dependencies,
      'Conversation sync',
    );
    return this.mutationQueue.enqueue(() => this.syncDirect(context, options));
  }

  /** 在共享队列内完成全分页拉取、映射和 cache 替换。 */
  private async syncDirect(
    context: WebIMSyncContext,
    options: WebIMConversationSyncOptions,
  ): Promise<readonly Conversation[]> {
    // pageSize 限制异常调用造成的服务端或内存压力。
    const pageSize = clampPageSize(options.pageSize);
    // remoteConversations 仅在所有分页成功后进入持久化阶段。
    const remoteConversations = await this.fetchAllPages(pageSize);
    // mappings 在任何写入前完成，字段错误不会替换旧 cache。
    const mappings = remoteConversations.map(conversation =>
      mapGatewayConversationToCore(conversation, context.userID),
    );
    // conversations 按 ID 去重，最后一页版本覆盖早期页版本。
    const conversations = [
      ...new Map(
        mappings.map(mapping => [
          mapping.conversation.conversationID,
          mapping.conversation,
        ]),
      ).values(),
    ];
    // messageRepository 先保存会话引用的 latest message。
    const messageRepository = new MessageRepository(context.database);
    for (const mapping of mappings) {
      if (mapping.latestMessage) {
        await messageRepository.upsert(mapping.latestMessage);
      }
    }
    // conversationRepository 最后原子替换完整会话集合。
    const conversationRepository = new ConversationRepository(
      context.database,
    );
    await conversationRepository.replaceAll(conversations);
    return conversationRepository.list();
  }

  /** 拉取全部分页，并拒绝循环 token 和无界分页。 */
  private async fetchAllPages(
    pageSize: number,
  ): Promise<readonly GatewayConversation[]> {
    // conversations 在远端完整成功前只存在于内存。
    const conversations: GatewayConversation[] = [];
    // seenTokens 阻止服务端重复 token 导致死循环。
    const seenTokens = new Set<string>();
    // pageToken 为空表示首屏或同步完成。
    let pageToken: string | undefined;
    for (let page = 0; page < 1000; page += 1) {
      // response 由共享 client 验证 HTTP/envelope 错误语义。
      const response = await this.dependencies.gatewayClient.listConversations({
        limit: pageSize,
        ...(pageToken ? { page_token: pageToken } : {}),
      });
      conversations.push(...(response.conversations ?? []));
      // nextPageToken 只接受非空稳定 token。
      const nextPageToken = response.next_page_token?.trim();
      if (!nextPageToken) {
        return conversations;
      }
      if (seenTokens.has(nextPageToken)) {
        throw createWebIMSyncError(
          'SYNC_PAGINATION_LOOP',
          'Gateway conversation pagination returned a repeated token.',
        );
      }
      seenTokens.add(nextPageToken);
      pageToken = nextPageToken;
    }
    throw createWebIMSyncError(
      'SYNC_PAGE_LIMIT_EXCEEDED',
      'Gateway conversation pagination exceeded the safety limit.',
    );
  }

}

/** 将调用方 page size 限制在 Gateway 可控范围。 */
function clampPageSize(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return 100;
  }
  return Math.min(200, Math.max(1, Math.trunc(value ?? 100)));
}
