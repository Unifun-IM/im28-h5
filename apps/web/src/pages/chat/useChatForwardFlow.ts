import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  canForwardWebIMMessage,
  type Conversation,
  type Message,
  type WebIMForwardMessagesResult,
  type WebIMSync,
} from '@im28/im-sdk/web';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  buildChatForwardTargetRoute,
  createChatForwardRouteState,
  readChatForwardLocationState,
  type ChatForwardLocationState,
  type ChatForwardRouteState,
} from './chat-forward-route.js';

/** ChatPage 转发编排只接收 facade、可见实体和页面反馈入口。 */
interface UseChatForwardFlowOptions {
  readonly conversation: Conversation | null;
  readonly messages: readonly Message[];
  readonly sync: WebIMSync | null;
  readonly sending: boolean;
  readonly onSending: (message: Message) => void;
  readonly runMessageOperation: (
    operation: (activeSync: WebIMSync) => Promise<void>,
  ) => Promise<void>;
  readonly onError: (message: string | null) => void;
  readonly onNotice: (message: string | null) => void;
}

/** 待发送预览由路由 ID 重新加载，不接收来源页面消息 body。 */
export interface ChatPendingForward {
  readonly routeState: ChatForwardRouteState;
  readonly messages: readonly Message[];
  readonly loading: boolean;
}

/** 为聊天页提供单条、多选、目标路由和真实批量发送编排。 */
export function useChatForwardFlow({
  conversation,
  messages,
  sync,
  sending,
  onSending,
  runMessageOperation,
  onError,
  onNotice,
}: UseChatForwardFlowOptions) {
  // location.state 是待发送转发在 SPA 生命周期内的唯一 owner。
  const location = useLocation();
  // navigate 负责选择器、目标聊天和清除待发送状态。
  const navigate = useNavigate();
  // multiSelecting 控制消息列表进入 RN 多选模式。
  const [multiSelecting, setMultiSelecting] = useState(false);
  // selectedIDs 只保存当前来源消息稳定身份。
  const [selectedIDs, setSelectedIDs] = useState<ReadonlySet<string>>(new Set());
  // previewMessages 从 SDK 当前账号 cache 精确重读。
  const [previewMessages, setPreviewMessages] = useState<readonly Message[]>([]);
  // previewLoading 区分目标聊天历史和来源预览加载状态。
  const [previewLoading, setPreviewLoading] = useState(false);
  // routeState 缺失代表普通聊天或刷新后安全丢弃。
  const routeState = useMemo(
    () => readChatForwardLocationState(location.state),
    [location.state],
  );

  useEffect(() => {
    if (!sync || !routeState) {
      setPreviewMessages([]);
      setPreviewLoading(false);
      return;
    }
    // active 阻止目标切换后旧 cache 查询回写。
    let active = true;
    // 新来源读取期间不保留上一批消息，避免跨目标短暂串用预览。
    setPreviewMessages([]);
    setPreviewLoading(true);
    void sync.messages.getCachedByClientMsgIDs(routeState.sourceClientMsgIDs)
      .then(cached => {
        if (!active) return;
        if (cached.length !== routeState.sourceClientMsgIDs.length) {
          throw new Error('部分转发来源已不在本地缓存，请重新选择');
        }
        setPreviewMessages(cached);
      })
      .catch(cause => {
        if (!active) return;
        onError(readForwardFlowError(cause));
        // 来源无法完整恢复时丢弃失效 Router state，禁止留下“0 条”空预览。
        navigate(location.pathname, { replace: true, state: null });
      })
      .finally(() => {
        if (active) setPreviewLoading(false);
      });
    return () => { active = false; };
  }, [location.pathname, navigate, onError, routeState, sync]);

  /** 用当前会话和来源 ID 进入目标选择器。 */
  const openTargetSelector = useCallback((sourceClientMsgIDs: readonly string[]) => {
    if (!conversation || !sourceClientMsgIDs.length) return;
    // forward 保存选择时稳定身份，不引用当前 messages 数组。
    const forward = createChatForwardRouteState({
      sourceConversationID: conversation.conversationID,
      sourceConversationTitle: conversation.name?.trim() || conversation.targetID || '聊天',
      sourceClientMsgIDs,
    });
    // state 仅包含 ID 和会话展示名。
    const state: ChatForwardLocationState = { forward };
    navigate(buildChatForwardTargetRoute(conversation.conversationID), { state });
  }, [conversation, navigate]);

  /** 从动作菜单直接转发一条已通过 shared guard 的消息。 */
  const forwardMessage = useCallback((message: Message) => {
    if (!canForwardWebIMMessage(message)) {
      onError('当前消息暂不支持转发');
      return;
    }
    openTargetSelector([message.clientMsgID]);
  }, [onError, openTargetSelector]);

  /** 以当前消息为首选项进入 RN 多选模式。 */
  const beginMultiSelect = useCallback((message: Message) => {
    if (!canForwardWebIMMessage(message)) {
      onError('当前消息暂不支持转发');
      return;
    }
    setSelectedIDs(new Set([message.clientMsgID]));
    setMultiSelecting(true);
  }, [onError]);

  /** 切换可转发消息选择，最多保留 SDK 支持的 100 条。 */
  const toggleSelectedMessage = useCallback((message: Message) => {
    if (!canForwardWebIMMessage(message)) return;
    setSelectedIDs(current => {
      // next 在不可变 Set 上更新，保证 React 可以观察变化。
      const next = new Set(current);
      if (next.has(message.clientMsgID)) next.delete(message.clientMsgID);
      else if (next.size < 100) next.add(message.clientMsgID);
      return next;
    });
  }, []);

  /** 退出多选并清除来源身份。 */
  const cancelMultiSelect = useCallback(() => {
    setMultiSelecting(false);
    setSelectedIDs(new Set());
  }, []);

  // selectedSourceIDs 按聊天时间从旧到新生成稳定发送顺序。
  const selectedSourceIDs = useMemo(
    () => messages
      .filter(message => selectedIDs.has(message.clientMsgID))
      .slice()
      .reverse()
      .map(message => message.clientMsgID),
    [messages, selectedIDs],
  );

  /** 将多选结果交给同一目标选择器。 */
  const forwardSelectedMessages = useCallback(() => {
    if (!selectedSourceIDs.length) {
      onError('请选择要转发的消息');
      return;
    }
    openTargetSelector(selectedSourceIDs);
  }, [onError, openTargetSelector, selectedSourceIDs]);

  /** 清除目标聊天的内存待发送状态，不写浏览器持久存储。 */
  const clearPendingForward = useCallback(() => {
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, navigate]);

  /** 以当前选项重新进入目标选择器并保持已编辑来源集合。 */
  const changeForwardTarget = useCallback((
    sourceClientMsgIDs: readonly string[],
    hideSenderName: boolean,
  ) => {
    if (!routeState) return;
    // forward 仅延续稳定 ID 和隐藏发送人布尔值。
    const forward = createChatForwardRouteState({
      ...routeState,
      sourceClientMsgIDs,
      hideSenderName,
    });
    // state 不携带 previewMessages。
    const state: ChatForwardLocationState = { forward };
    navigate(buildChatForwardTargetRoute(routeState.sourceConversationID), { state });
  }, [navigate, routeState]);

  /** 调用 shared messages.forward，并按逐项结果呈现真实完成状态。 */
  const submitForward = useCallback(async (options: {
    readonly sourceClientMsgIDs: readonly string[];
    readonly hideSenderName: boolean;
    readonly comment: string;
  }): Promise<void> => {
    if (!sync || !conversation || sending || !options.sourceClientMsgIDs.length) return;
    // result 仅在 facade 返回真实逐项结果后赋值。
    let result: WebIMForwardMessagesResult | null = null;
    await runMessageOperation(async activeSync => {
      result = await activeSync.messages.forward({
        conversationID: conversation.conversationID,
        sourceClientMsgIDs: options.sourceClientMsgIDs,
        hideSenderName: options.hideSenderName,
        comment: options.comment,
        onSending: sendingMessages => sendingMessages.forEach(onSending),
      });
    });
    if (!result) return;
    onNotice(buildForwardResultNotice(result));
    clearPendingForward();
  }, [clearPendingForward, conversation, onNotice, onSending, runMessageOperation, sending, sync]);

  // pending 只在合法 state 存在时向 composer 暴露精确缓存结果。
  const pending: ChatPendingForward | null = routeState ? {
    routeState,
    messages: previewMessages,
    loading: previewLoading,
  } : null;

  return {
    multiSelecting,
    selectedIDs,
    selectedCount: selectedSourceIDs.length,
    pending,
    forwardMessage,
    beginMultiSelect,
    toggleSelectedMessage,
    cancelMultiSelect,
    forwardSelectedMessages,
    clearPendingForward,
    changeForwardTarget,
    submitForward,
  };
}

/** 汇总逐项成功和失败，不将部分失败显示为整批成功。 */
function buildForwardResultNotice(result: WebIMForwardMessagesResult): string {
  // results 同时纳入转发项和可选评论结果。
  const results = result.comment ? [...result.list, result.comment] : result.list;
  // failed 以显式 error 或最终 failed 状态为准。
  const failed = results.filter(item => Boolean(item.error) || item.message.status === 'failed').length;
  // succeeded 是真实返回项减去失败项。
  const succeeded = results.length - failed;
  return failed ? `转发完成：${succeeded}条成功，${failed}条失败` : `已转发${succeeded}条消息`;
}

/** 将未知异常转换为页面可见但不泄露本地数据的文案。 */
function readForwardFlowError(cause: unknown): string {
  return cause instanceof Error && cause.message ? cause.message : '转发消息加载失败';
}
