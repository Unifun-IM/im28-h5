import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  formatIMUserDisplayName,
  IM_GROUP_CREATION_MAX_MEMBER_COUNT,
  type GatewayUser,
  type WebIMContact,
  type WebIMSync,
} from '@im28/im-sdk/web';

import { useAppToast } from '../../components/interaction/index.js';
import {
  buildCreateGroupCandidates,
  buildCreateGroupMemberUserIDs,
  buildSelectedCreateGroupCandidates,
  canSubmitCreateGroup,
  isGroupCreationRemoteCompletedError,
  resolveSingleChatCreateGroupPeer,
  toggleCreateGroupMemberSelection,
  updateVisibleCreateGroupMemberSelection,
  type CreateGroupCandidate,
} from './create-group-view.js';

/** 建群状态 owner 只接收受控路由事实和当前账号 shared facade。 */
interface UseCreateGroupPageStateOptions {
  readonly sync: WebIMSync | null;
  readonly userID: string;
  readonly conversationID: string;
  readonly fromSingleSettings: boolean;
  readonly initialSelectedUserIDs: readonly string[];
  readonly onCreated: (conversationID: string) => void;
}

/** 建群页消费的缓存、选择、提交和展示投影。 */
interface CreateGroupPageStateBinding {
  readonly keyword: string;
  readonly selectedUserIDs: ReadonlySet<string>;
  readonly selectedReviewOpen: boolean;
  readonly candidates: readonly CreateGroupCandidate[];
  readonly selectedCandidates: readonly CreateGroupCandidate[];
  readonly fixedUserIDs: readonly string[];
  readonly selectedCount: number;
  readonly canSubmit: boolean;
  readonly allSelected: boolean;
  readonly loading: boolean;
  readonly refreshing: boolean;
  readonly submitting: boolean;
  readonly remoteCompleted: boolean;
  readonly error: string | null;
  readonly refreshContacts: () => Promise<void>;
  readonly updateKeyword: (keyword: string) => void;
  readonly toggleMember: (userID: string) => void;
  readonly toggleAllMembers: () => void;
  readonly openSelectedReview: () => void;
  readonly closeSelectedReview: () => void;
  readonly clearSelectedMembers: () => void;
  readonly submitCreation: () => Promise<void>;
}

/** 统一拥有建群 cache-first 数据、选择规则和 shared 创建事务编排。 */
export function useCreateGroupPageState({
  sync,
  userID,
  conversationID,
  fromSingleSettings,
  initialSelectedUserIDs,
  onCreated,
}: UseCreateGroupPageStateOptions): CreateGroupPageStateBinding {
  /** toast 只投影 shared 创建事务的明确成功和失败。 */
  const { toast } = useAppToast();
  /** contacts 保存当前账号 cache-first 好友快照。 */
  const [contacts, setContacts] = useState<readonly WebIMContact[]>([]);
  /** profile 只为 RN 默认群名提供当前昵称。 */
  const [profile, setProfile] = useState<GatewayUser | null>(null);
  /** fixedPeerUserID 是单聊设置入口验证后的真实对端。 */
  const [fixedPeerUserID, setFixedPeerUserID] = useState('');
  /** keyword 只过滤单聊设置选择层的当前好友。 */
  const [keyword, setKeyword] = useState('');
  /** selectedUserIDs 只保存稳定好友身份。 */
  const [selectedUserIDs, setSelectedUserIDs] = useState<ReadonlySet<string>>(
    () => new Set(initialSelectedUserIDs),
  );
  /** loading 表示首次 cache-first 恢复。 */
  const [loading, setLoading] = useState(true);
  /** refreshing 区分用户下拉和首次恢复。 */
  const [refreshing, setRefreshing] = useState(false);
  /** submitting 阻止重复创建群。 */
  const [submitting, setSubmitting] = useState(false);
  /** remoteCompleted 锁定远端成功但本地失败后的重复提交。 */
  const [remoteCompleted, setRemoteCompleted] = useState(false);
  /** error 呈现真实 SDK、Gateway 或缓存失败。 */
  const [error, setError] = useState<string | null>(null);
  /** selectedReviewOpen 控制普通建群的已选好友复核层。 */
  const [selectedReviewOpen, setSelectedReviewOpen] = useState(false);

  /** load 先读好友缓存，再刷新好友、本人资料和可选固定对端。 */
  const load = useCallback(async (): Promise<void> => {
    if (!sync || !userID) return;
    setLoading(true);
    setError(null);
    if (fromSingleSettings) resetSingleSettingsSelection(setFixedPeerUserID, setSelectedUserIDs, setKeyword);
    try {
      try {
        setContacts(await sync.contacts.listCached());
      } catch {
        // 缓存不可用仍允许 canonical 远端好友读取完成首屏。
      }
      /** refreshedContacts 和 currentProfile 均来自公开 Web facade。 */
      const [refreshedContacts, currentProfile] = await Promise.all([
        sync.contacts.list({ pageSize: 100 }),
        sync.profile.getCurrent(),
      ]);
      setContacts(refreshedContacts);
      setProfile(currentProfile);
      if (fromSingleSettings) {
        setFixedPeerUserID(await resolveCreateGroupFixedPeer(sync, conversationID, userID));
      }
    } catch (cause) {
      setError(readCreateGroupError(cause, '加载好友失败，请稍后重试'));
    } finally {
      setLoading(false);
    }
  }, [conversationID, fromSingleSettings, sync, userID]);

  useEffect(() => { void load(); }, [load]);

  /** refreshContacts 只刷新好友 facade，失败时保留旧快照。 */
  const refreshContacts = useCallback(async (): Promise<void> => {
    if (!sync || !userID || refreshing || fromSingleSettings) return;
    setRefreshing(true);
    setError(null);
    try {
      setContacts(await sync.contacts.list({ pageSize: 100 }));
    } catch (cause) {
      setError(readCreateGroupError(cause, '加载好友失败，请稍后重试'));
    } finally {
      setRefreshing(false);
    }
  }, [fromSingleSettings, refreshing, sync, userID]);

  /** fixedUserIDs 在单聊模式下只包含已验证的当前对端。 */
  const fixedUserIDs = useMemo(() => fixedPeerUserID ? [fixedPeerUserID] : [], [fixedPeerUserID]);
  /** candidates 展示好友网格并排除单聊固定对端。 */
  const candidates = useMemo(
    () => fromSingleSettings && !fixedPeerUserID
      ? []
      : buildCreateGroupCandidates(
          contacts,
          fromSingleSettings ? keyword : '',
          new Set(fixedUserIDs),
        ),
    [contacts, fixedPeerUserID, fixedUserIDs, fromSingleSettings, keyword],
  );
  /** selectedCandidates 只展示刷新后仍有效的已选好友。 */
  const selectedCandidates = useMemo(
    () => buildSelectedCreateGroupCandidates(candidates, selectedUserIDs),
    [candidates, selectedUserIDs],
  );
  /** selectedCount 直接投影稳定身份集合。 */
  const selectedCount = selectedUserIDs.size;
  /** canSubmit 把固定对端计入共享 2–998 人规则。 */
  const canSubmit = canSubmitCreateGroup(selectedUserIDs, fixedUserIDs);
  /** allSelected 对齐 RN 当前可见好友的全选语义。 */
  const allSelected = candidates.length > 0 && (fromSingleSettings
    ? candidates.every(candidate => selectedUserIDs.has(candidate.contact.userID))
    : selectedCount === candidates.length);

  useEffect(() => {
    if (selectedReviewOpen && selectedCandidates.length === 0) setSelectedReviewOpen(false);
  }, [selectedCandidates.length, selectedReviewOpen]);

  /** toggleMember 切换单个好友并维持 998 人上限。 */
  const toggleMember = useCallback((memberUserID: string): void => {
    setError(null);
    setSelectedUserIDs(current => {
      /** result 由纯选择 owner 保证共享人数上限。 */
      const result = toggleCreateGroupMemberSelection(current, memberUserID, fixedUserIDs.length);
      if (result.limitReached) setError('群成员人数已达上限，请联系客服开启更大群聊。');
      return result.selectedUserIDs;
    });
  }, [fixedUserIDs.length]);

  /** toggleAllMembers 对齐 RN 当前可见项全选、取消和上限保护。 */
  const toggleAllMembers = useCallback((): void => {
    setError(null);
    if (candidates.length + fixedUserIDs.length > IM_GROUP_CREATION_MAX_MEMBER_COUNT) {
      setError('群成员人数已达上限，请联系客服开启更大群聊。');
      return;
    }
    /** visibleUserIDs 只覆盖当前筛选结果。 */
    const visibleUserIDs = candidates.map(candidate => candidate.contact.userID);
    setSelectedUserIDs(current => updateVisibleCreateGroupMemberSelection(
      current,
      visibleUserIDs,
      allSelected,
      fromSingleSettings,
    ));
  }, [allSelected, candidates, fixedUserIDs.length, fromSingleSettings]);

  /** submitCreation 只调用 shared create owner 并处理明确缓存状态。 */
  const submitCreation = useCallback(async (): Promise<void> => {
    if (!sync || !canSubmit || submitting || remoteCompleted) return;
    setSubmitting(true);
    setError(null);
    try {
      /** result 保留远端和本地事务的真实完成状态。 */
      const result = await sync.groups.create({
        memberUserIDs: buildCreateGroupMemberUserIDs(selectedUserIDs, fixedUserIDs),
        ownerDisplayName: profile?.nickname?.trim() || formatIMUserDisplayName(userID),
      });
      if (result.cacheState === 'remote-only') {
        setRemoteCompleted(true);
        setError('群聊已在服务端创建，本地会话尚未保存；请返回会话列表并下拉刷新。');
        return;
      }
      toast.success('群聊创建成功');
      onCreated(result.conversation.conversationID);
    } catch (cause) {
      handleCreateGroupFailure(cause, setRemoteCompleted, setError, toast.error);
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, fixedUserIDs, onCreated, profile?.nickname, remoteCompleted, selectedUserIDs, submitting, sync, toast, userID]);

  return {
    keyword, selectedUserIDs, selectedReviewOpen, candidates, selectedCandidates,
    fixedUserIDs, selectedCount, canSubmit, allSelected, loading, refreshing,
    submitting, remoteCompleted, error, refreshContacts,
    updateKeyword: setKeyword, toggleMember, toggleAllMembers,
    openSelectedReview: () => setSelectedReviewOpen(true),
    closeSelectedReview: () => setSelectedReviewOpen(false),
    clearSelectedMembers: () => setSelectedUserIDs(new Set()),
    submitCreation,
  };
}

/** 单聊设置入口加载前清空可能残留的选择状态。 */
function resetSingleSettingsSelection(
  setFixedPeerUserID: (value: string) => void,
  setSelectedUserIDs: (value: ReadonlySet<string>) => void,
  setKeyword: (value: string) => void,
): void {
  setFixedPeerUserID('');
  setSelectedUserIDs(new Set());
  setKeyword('');
}

/** 从当前账号会话缓存解析固定对端，缺失时执行 canonical full sync。 */
async function resolveCreateGroupFixedPeer(
  sync: WebIMSync,
  conversationID: string,
  userID: string,
): Promise<string> {
  /** conversations 优先来自当前账号缓存。 */
  let conversations = await sync.conversations.listCached({ limit: 500 });
  /** peerUserID 拒绝群聊、本人、失效或任意外部 route 身份。 */
  let peerUserID = resolveSingleChatCreateGroupPeer(conversations, conversationID, userID);
  if (!peerUserID) {
    conversations = await sync.conversations.sync({ pageSize: 100 });
    peerUserID = resolveSingleChatCreateGroupPeer(conversations, conversationID, userID);
  }
  if (!peerUserID) throw new Error('单聊会话不存在或对端身份不可用');
  return peerUserID;
}

/** 处理远端已完成防重放错误和普通创建失败 Toast。 */
function handleCreateGroupFailure(
  cause: unknown,
  setRemoteCompleted: (value: boolean) => void,
  setError: (value: string) => void,
  notifyError: (message: string) => void,
): void {
  if (isGroupCreationRemoteCompletedError(cause)) {
    setRemoteCompleted(true);
    setError('服务端已处理创建，但未返回完整会话信息；请返回会话列表并下拉刷新。');
    return;
  }
  notifyError(readCreateGroupError(cause, '创建群聊失败，请稍后重试'));
}

/** 将未知创建群异常转换为不含凭据的页面提示。 */
function readCreateGroupError(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}
