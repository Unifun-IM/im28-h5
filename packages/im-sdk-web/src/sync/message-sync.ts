import {
  ConversationRepository,
  MessageRepository,
  mapGatewayMessageToCore,
  type GatewayHTTPClient,
  type Message,
  type MessageHistoryOptions,
} from '@im28/im-sdk/web';

import {
  createWebIMSyncError,
  requireWebIMSyncContext,
  type WebIMSyncContextDependencies,
} from './sync-context.js';

/** Gateway 历史拉取参数保留 uint64 seq 字符串。 */
export interface WebIMPullMessageHistoryOptions {
  readonly conversationID: string;
  readonly fromSeq: string;
  readonly limit?: number;
  readonly desc?: boolean;
}

/** 文本发送参数由 service 生成稳定 client message ID。 */
export interface WebIMSendTextMessageOptions {
  readonly conversationID: string;
  readonly text: string;
}

/** 页面可消费的消息 cache、pull 与 send 能力。 */
export interface WebIMMessageSync {
  getCachedHistory(
    options: MessageHistoryOptions,
  ): Promise<readonly Message[]>;
  pullHistory(
    options: WebIMPullMessageHistoryOptions,
  ): Promise<readonly Message[]>;
  sendText(options: WebIMSendTextMessageOptions): Promise<Message>;
}

/** 消息同步依赖复用 runtime 的 transport/account owners。 */
export interface WebIMMessageSyncDependencies
  extends WebIMSyncContextDependencies {
  readonly gatewayClient: GatewayHTTPClient;
  readonly createClientMessageID?: () => string;
  readonly now?: () => number;
}

/** 创建认证账号绑定的浏览器消息同步服务。 */
export function createWebIMMessageSync(
  dependencies: WebIMMessageSyncDependencies,
): WebIMMessageSync {
  return new WebIMMessageSyncImpl(dependencies);
}

/** 消息服务编排 shared Gateway mapper 与 Repository 状态机。 */
class WebIMMessageSyncImpl implements WebIMMessageSync {
  // dependencies 动态读取当前认证账号和 database。
  private readonly dependencies: WebIMMessageSyncDependencies;

  /** 保存 runtime owners，不持有独立认证或数据库状态。 */
  constructor(dependencies: WebIMMessageSyncDependencies) {
    this.dependencies = dependencies;
  }

  /** 从当前账号 SQLite 返回 newest-first 历史窗口。 */
  async getCachedHistory(
    options: MessageHistoryOptions,
  ): Promise<readonly Message[]> {
    // context 阻止匿名页面读取其他账号 cache。
    const context = requireWebIMSyncContext(this.dependencies, 'Message sync');
    // repository 每次绑定当前 account database。
    const repository = new MessageRepository(context.database);
    return repository.getHistory(options);
  }

  /** 从 Gateway 拉取历史并持久化后返回本地窗口。 */
  async pullHistory(
    options: WebIMPullMessageHistoryOptions,
  ): Promise<readonly Message[]> {
    // context 固定本轮账号与 database owner。
    const context = requireWebIMSyncContext(this.dependencies, 'Message sync');
    // conversationID 是远端和本地分区共同主键。
    const conversationID = options.conversationID.trim();
    // fromSeq 保留 uint64 string，禁止经过 JS number 截断。
    const fromSeq = options.fromSeq.trim();
    if (!conversationID || !fromSeq) {
      throw createWebIMSyncError(
        'INVALID_HISTORY_CURSOR',
        'Message history requires a conversation ID and fromSeq.',
      );
    }
    // limit 与 Gateway 首批 history window 保持有限范围。
    const limit = clampLimit(options.limit);
    // response failure 直接 reject，不退化为 fake cache success。
    const response = await this.dependencies.gatewayClient.pullMessages({
      conversation_id: conversationID,
      from_seq: fromSeq,
      limit,
      desc: options.desc ?? true,
    });
    // messages 在任何写入前全部完成字段校验和映射。
    const messages = (response.messages ?? []).map(message =>
      mapGatewayMessageToCore(message, {
        currentUserID: context.userID,
        conversationID,
      }),
    );
    // repository 使用稳定 clientMsgID 幂等 upsert。
    const repository = new MessageRepository(context.database);
    // 当前批次按 Gateway 顺序写入，adapter 负责提交串行化。
    for (const message of messages) {
      await repository.upsert(message);
    }
    return repository.getHistory({ conversationID, limit });
  }

  /** 先落 sending 消息，再按 Gateway 结果收敛为 sent/failed。 */
  async sendText(options: WebIMSendTextMessageOptions): Promise<Message> {
    // context 保证发送账号与消息 direction 一致。
    const context = requireWebIMSyncContext(this.dependencies, 'Message sync');
    // conversationID 必须指向当前 cache 的已有会话。
    const conversationID = options.conversationID.trim();
    // text 在创建 optimistic row 前统一 trim。
    const text = options.text.trim();
    if (!conversationID || !text) {
      throw createWebIMSyncError(
        'INVALID_TEXT_MESSAGE',
        'Text sending requires a conversation ID and non-empty text.',
      );
    }
    // conversationRepository 验证默认聊天路径已打开真实会话。
    const conversationRepository = new ConversationRepository(
      context.database,
    );
    // conversation 防止向不存在的本地目标构造 fake direct session。
    const conversation = await conversationRepository.getByID(conversationID);
    if (!conversation) {
      throw createWebIMSyncError(
        'CONVERSATION_NOT_FOUND',
        'Text sending requires an existing cached conversation.',
      );
    }
    // clientMsgID 在重试和状态更新中保持同一主键。
    const clientMsgID = this.createClientMessageID();
    // sendTime 由注入 clock 提供可测试的 optimistic 排序时间。
    const sendTime = this.dependencies.now?.() ?? Date.now();
    // localMessage 是 Gateway 调用前必须持久化的 sending row。
    const localMessage: Message = {
      clientMsgID,
      conversationID,
      senderID: context.userID,
      direction: 'outgoing',
      contentType: 101,
      status: 'sending',
      sendTime,
      payload: { text: { text } },
    };
    // messageRepository 管理 sending -> sent/failed 状态。
    const messageRepository = new MessageRepository(context.database);
    await messageRepository.upsert(localMessage);
    await conversationRepository.updateLatestMessage(
      conversationID,
      clientMsgID,
      sendTime,
    );
    try {
      // remoteMessage 必须回显相同幂等 ID，避免产生双消息。
      const remoteMessage = await this.dependencies.gatewayClient.sendMessage({
        conversation_id: conversationID,
        client_msg_id: clientMsgID,
        body: { text: { text } },
      });
      // sentMessage 复用唯一 shared mapper。
      const sentMessage = mapGatewayMessageToCore(remoteMessage, {
        currentUserID: context.userID,
        conversationID,
      });
      if (sentMessage.clientMsgID !== clientMsgID) {
        throw createWebIMSyncError(
          'CLIENT_MESSAGE_ID_MISMATCH',
          'Gateway returned a different client message ID.',
        );
      }
      await messageRepository.upsert({ ...sentMessage, status: 'sent' });
      await conversationRepository.updateLatestMessage(
        conversationID,
        clientMsgID,
        sentMessage.sendTime,
      );
      return { ...sentMessage, status: 'sent' };
    } catch (cause) {
      try {
        await messageRepository.updateStatus(clientMsgID, 'failed');
      } catch (statusCause) {
        throw new AggregateError(
          [cause, statusCause],
          'Text send and failed-state persistence both failed.',
        );
      }
      throw cause;
    }
  }

  /** 创建并校验本地消息幂等 ID。 */
  private createClientMessageID(): string {
    // id 优先使用测试/宿主注入生成器，否则使用浏览器 randomUUID。
    const id = (
      this.dependencies.createClientMessageID?.() ??
      globalThis.crypto?.randomUUID?.()
    )?.trim();
    if (!id) {
      throw createWebIMSyncError(
        'CLIENT_MESSAGE_ID_UNAVAILABLE',
        'A stable client message ID generator is required.',
      );
    }
    return id;
  }
}

/** 将 history window 限制在 Gateway 可控范围。 */
function clampLimit(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return 30;
  }
  return Math.min(100, Math.max(1, Math.trunc(value ?? 30)));
}
