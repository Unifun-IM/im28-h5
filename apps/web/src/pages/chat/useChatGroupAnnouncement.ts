import { useEffect, useMemo, useState } from 'react';
import type { Conversation, Message, WebIMSync } from '@im28/im-sdk/web';

/** 聊天页公告横幅的可见状态。 */
export interface ChatGroupAnnouncementState {
  readonly text: string;
  readonly version: string;
}

/** 群公告 hook 参数只依赖当前会话、消息和 shared sync facade。 */
interface UseChatGroupAnnouncementOptions {
  readonly conversation: Conversation | null;
  readonly messages: readonly Message[];
  readonly sync: WebIMSync | null;
  readonly onError: (message: string) => void;
}

/** 从缓存群和权威 read-status 管理 RN 同款未读公告横幅。 */
export function useChatGroupAnnouncement({
  conversation,
  messages,
  sync,
  onError,
}: UseChatGroupAnnouncementOptions) {
  // announcement 保存当前可见公告和版本，不复制完整群资料。
  const [announcement, setAnnouncement] = useState<ChatGroupAnnouncementState | null>(null);
  // locallyReadVersion 让点击后立即隐藏横幅，服务端状态异步收敛。
  const [locallyReadVersion, setLocallyReadVersion] = useState('');
  // announcementEventID 只跟踪最新 type1519，避免普通消息触发群全量刷新。
  const announcementEventID = useMemo(
    () => messages.find(message => message.contentType === 1519)?.clientMsgID ?? '',
    [messages],
  );
  // groupID 只接受 shared Conversation 的群目标。
  const groupID = conversation?.type === 'group' ? conversation.targetID.trim() : '';

  useEffect(() => {
    if (!sync || !groupID) {
      setAnnouncement(null);
      return;
    }
    // active 阻止切换会话后的旧请求回写。
    let active = true;
    void (async () => {
      try {
        // groups.sync 对齐 RN 进入群聊时刷新群资料，并处理 type1519 后的新版本。
        const groups = await sync.groups.sync({ pageSize: 100 });
        // group 必须精确匹配当前会话目标。
        const group = groups.find(item => item.groupID === groupID);
        if (!group) throw new Error('群公告所属群资料不可用');
        // status 是决定横幅是否出现的唯一权威来源。
        const status = await sync.groups.getAnnouncementReadStatus(groupID);
        if (!active) return;
        // version 优先使用 status 当前版本，兼容空公告。
        const version = status.announcementVersion || group.announcementVersion;
        setAnnouncement(
          group.announcement.trim() && !status.isRead
            ? { text: group.announcement.trim(), version }
            : null,
        );
      } catch (cause) {
        if (!active) return;
        // 查询失败不伪造已读或公告，只显式报告错误。
        setAnnouncement(null);
        onError(cause instanceof Error ? cause.message : '群公告加载失败');
      }
    })();
    return () => {
      active = false;
    };
  }, [announcementEventID, groupID, onError, sync]);

  /** 标记当前实际展示版本并立即隐藏，失败仍由页面反馈。 */
  const markRead = () => {
    if (!sync || !groupID || !announcement?.version) return;
    // version 冻结点击瞬间真实展示的版本。
    const version = announcement.version;
    setLocallyReadVersion(version);
    void sync.groups.markAnnouncementRead(groupID, version).catch(cause => {
      onError(cause instanceof Error ? cause.message : '群公告已读状态更新失败');
    });
  };

  // visibleAnnouncement 防止本地点击后等待服务端回读期间重复出现。
  const visibleAnnouncement = announcement?.version !== locallyReadVersion
    ? announcement
    : null;
  return { announcement: visibleAnnouncement, markRead };
}
