import { GroupTextDetailPage } from './GroupTextDetailPage.js';
import './group-text-detail-page.css';

/** RN 群公告页的 H5 只读实现，公告只来自 shared joined-group facade。 */
export function GroupAnnouncementPage() {
  return (
    <GroupTextDetailPage
      title="群公告"
      emptyText="暂无群公告"
      loadingText="正在加载群公告"
      fallbackError="群公告加载失败"
      selectText={group => group.announcement}
    />
  );
}

export default GroupAnnouncementPage;
