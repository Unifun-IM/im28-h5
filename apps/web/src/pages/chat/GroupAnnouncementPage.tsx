import {
  IM_GROUP_ANNOUNCEMENT_MAX_LENGTH,
  type WebIMJoinedGroup,
  type WebIMJoinedGroupSync,
} from '@im28/im-sdk/web';

import { GroupTextDetailPage } from './GroupTextDetailPage.js';
import './group-text-detail-page.css';

/** 读取 shared 群公告字段，避免每次渲染改变 effect 依赖。 */
function selectGroupAnnouncement(group: WebIMJoinedGroup): string {
  return group.announcement;
}

/** 群公告表单只接受 RN 同款非空 trim 和 1000 字上限。 */
function normalizeGroupAnnouncementDraft(value: string): string {
  // announcement 禁止把空字符串当成服务端清除成功。
  const announcement = value.trim();
  if (!announcement) throw new Error('请输入群公告');
  if (announcement.length > IM_GROUP_ANNOUNCEMENT_MAX_LENGTH) {
    throw new Error(`群公告最多 ${IM_GROUP_ANNOUNCEMENT_MAX_LENGTH} 个字`);
  }
  return announcement;
}

/** 群公告保存只调用 shared 发布 facade，不在页面编排消息。 */
function publishGroupAnnouncement(
  groups: WebIMJoinedGroupSync,
  groupID: string,
  announcement: string,
  conversationID: string,
): Promise<WebIMJoinedGroup> {
  return groups.publishAnnouncement({ groupID, conversationID, announcement })
    .then(result => result.group);
}

/** RN 群公告页的 H5 实现，资料、权限、发布和消息都来自 shared facade。 */
export function GroupAnnouncementPage() {
  return (
    <GroupTextDetailPage
      title="群公告"
      emptyText="暂无群公告"
      loadingText="正在加载群公告"
      fallbackError="群公告加载失败"
      footerText="仅群主可以编辑"
      selectText={selectGroupAnnouncement}
      editor={{
        maxLength: IM_GROUP_ANNOUNCEMENT_MAX_LENGTH,
        placeholder: `填写群公告(${IM_GROUP_ANNOUNCEMENT_MAX_LENGTH}字)`,
        successText: '群公告已更新',
        confirmTitle: '发布群公告',
        confirmText: '发布后，群成员将收到一条群公告消息。',
        canEdit: group => group.canEditAnnouncement,
        normalize: normalizeGroupAnnouncementDraft,
        update: publishGroupAnnouncement,
      }}
    />
  );
}

export default GroupAnnouncementPage;
