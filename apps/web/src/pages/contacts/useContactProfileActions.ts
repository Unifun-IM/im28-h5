import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import {
  formatIMUserDisplayName,
  type IMFriendDeleteScope,
  type WebIMPeerProfile,
  type WebIMRuntime,
} from '@im28/im-sdk/web';
import { useNavigate } from 'react-router-dom';

import { copyUserIDToClipboard } from '../../components/clipboard/user-id-clipboard.js';
import { useAppToast } from '../../components/interaction/index.js';
import { useWebIMCall } from '../../runtime/index.js';
import { readContactProfileError } from './ContactProfileActions.js';

/** 联系人资料动作 Hook 只编排已有 shared facade 和浏览器平台端口。 */
export interface UseContactProfileActionsOptions {
  readonly runtime: WebIMRuntime | null;
  readonly profile: WebIMPeerProfile | null;
  readonly blockedByMe: boolean;
  readonly remarkDraft: string;
  readonly setProfile: Dispatch<SetStateAction<WebIMPeerProfile | null>>;
  readonly setBlockedByMe: Dispatch<SetStateAction<boolean>>;
  readonly closeRemark: () => void;
  readonly closeBlacklistConfirm: () => void;
  readonly clearPageError: () => void;
}

/** 联系人资料页消费的动作与并发状态。 */
export interface ContactProfileActions {
  readonly actionPending: boolean;
  readonly openConversation: () => Promise<void>;
  readonly copyUserID: () => Promise<void>;
  readonly startCall: (mediaType: 'audio' | 'video') => Promise<void>;
  readonly toggleStar: () => Promise<void>;
  readonly saveRemark: () => Promise<void>;
  readonly updateBlacklist: () => Promise<void>;
  readonly deleteFriend: (scope: IMFriendDeleteScope) => Promise<void>;
}

/** 集中持有联系人资料 mutation，页面只负责展示与弹层开关。 */
export function useContactProfileActions(
  options: UseContactProfileActionsOptions,
): ContactProfileActions {
  /** navigate 只在真实 operation 成功后切换 SPA route。 */
  const navigate = useNavigate();
  /** toast 统一承载联系人动作的瞬时成功和失败反馈。 */
  const { toast } = useAppToast();
  /** callOwner 是 H5 全局唯一通话生命周期 owner。 */
  const callOwner = useWebIMCall();
  /** actionPending 阻止联系人写操作或会话创建重复提交。 */
  const [actionPending, setActionPending] = useState(false);

  /** 创建并持久化真实单聊后进入现有聊天 route。 */
  const openConversation = useCallback(async (): Promise<void> => {
    if (!options.runtime || !options.profile || actionPending) return;
    setActionPending(true);
    options.clearPageError();
    try {
      /** conversation 已由 SDK 写入当前账号 SQLite。 */
      const conversation = await options.runtime.getSync().peerProfile
        .openConversation(options.profile.userID);
      navigate(`/conversations/${encodeURIComponent(conversation.conversationID)}`);
    } catch (cause) {
      toast.error(readContactProfileError(cause, '打开会话失败，请重试'));
    } finally {
      setActionPending(false);
    }
  }, [actionPending, navigate, options, toast]);

  /** 复制按钮只在浏览器 clipboard 成功后结束。 */
  const copyUserID = useCallback(async (): Promise<void> => {
    if (!options.profile) return;
    try {
      await copyUserIDToClipboard(options.profile.userID);
      options.clearPageError();
      toast.success('复制ID成功');
    } catch (cause) {
      toast.error(readContactProfileError(cause, '复制用户ID失败'));
    }
  }, [options, toast]);

  /** 发起通话前通过 shared peer facade 获取真实单聊主键。 */
  const startCall = useCallback(async (mediaType: 'audio' | 'video'): Promise<void> => {
    if (
      !options.runtime ||
      !options.profile ||
      options.profile.relationship !== 'friend' ||
      actionPending
    ) return;
    setActionPending(true);
    options.clearPageError();
    try {
      /** conversation 由 Gateway 与 SQLite 收敛，页面不拼接 conversation ID。 */
      const conversation = await options.runtime.getSync().peerProfile
        .openConversation(options.profile.userID);
      await callOwner.startOutgoing({
        conversationID: conversation.conversationID,
        peerName: options.profile.displayName,
        peerAvatarURL: options.profile.avatarURL,
        mediaType,
      });
    } catch (cause) {
      toast.error(readContactProfileError(cause, '发起通话失败'));
    } finally {
      setActionPending(false);
    }
  }, [actionPending, callOwner, options, toast]);

  /** 星标更新只在 shared facade 成功后替换页面关系快照。 */
  const toggleStar = useCallback(async (): Promise<void> => {
    if (!options.runtime || !options.profile || actionPending) return;
    setActionPending(true);
    options.clearPageError();
    try {
      /** result 是 SDK 成功写入关系缓存后的标准投影。 */
      const result = await options.runtime.getSync().contacts.updateFriendStar(
        options.profile.userID,
        !options.profile.isStarred,
      );
      options.setProfile(current => current
        ? { ...current, isStarred: result.isStarred }
        : current);
      toast.success(result.isStarred ? '已设为星标好友' : '已取消星标');
    } catch (cause) {
      toast.error(readContactProfileError(cause, '星标设置失败'));
    } finally {
      setActionPending(false);
    }
  }, [actionPending, options, toast]);

  /** 备注保存调用 SDK success-only 关系写入并更新展示优先级。 */
  const saveRemark = useCallback(async (): Promise<void> => {
    if (!options.runtime || !options.profile || actionPending) return;
    setActionPending(true);
    options.clearPageError();
    try {
      /** result 保留远端确认后的备注、昵称和头像。 */
      const result = await options.runtime.getSync().contacts.updateFriendRemark(
        options.profile.userID,
        options.remarkDraft,
      );
      options.setProfile(current => current ? {
        ...current,
        remark: result.remark,
        displayName: result.remark || result.nickname ||
          formatIMUserDisplayName(current.userID),
      } : current);
      options.closeRemark();
      toast.success('备注保存成功');
    } catch (cause) {
      toast.error(readContactProfileError(cause, '备注保存失败'));
    } finally {
      setActionPending(false);
    }
  }, [actionPending, options, toast]);

  /** 黑名单二次确认后只调用共享联系人动作 facade。 */
  const updateBlacklist = useCallback(async (): Promise<void> => {
    if (!options.runtime || !options.profile || actionPending) return;
    setActionPending(true);
    options.clearPageError();
    try {
      /** nextBlocked 是本次用户明确选择的目标状态。 */
      const nextBlocked = !options.blockedByMe;
      await options.runtime.getSync().contacts.setBlacklist(
        options.profile.userID,
        nextBlocked,
      );
      options.setBlockedByMe(nextBlocked);
      options.closeBlacklistConfirm();
      toast.success(nextBlocked ? '已加入黑名单' : '已移出黑名单');
    } catch (cause) {
      toast.error(readContactProfileError(cause, '黑名单设置失败'));
    } finally {
      setActionPending(false);
    }
  }, [actionPending, options, toast]);

  /** 删除好友在明确消息清理范围后执行 shared 原子状态机。 */
  const deleteFriend = useCallback(async (scope: IMFriendDeleteScope): Promise<void> => {
    if (!options.runtime || !options.profile || actionPending) return;
    setActionPending(true);
    options.clearPageError();
    try {
      await options.runtime.getSync().contacts.deleteFriend({
        friendUserID: options.profile.userID,
        clearScope: scope,
      });
      toast.success('好友已删除');
      navigate('/contacts', { replace: true });
    } catch (cause) {
      toast.error(readContactProfileError(cause, '删除好友失败'));
    } finally {
      setActionPending(false);
    }
  }, [actionPending, navigate, options, toast]);

  return {
    actionPending,
    openConversation,
    copyUserID,
    startCall,
    toggleStar,
    saveRemark,
    updateBlacklist,
    deleteFriend,
  };
}
