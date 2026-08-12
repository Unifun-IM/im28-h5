import { GroupTextDetailPage } from './GroupTextDetailPage.js';
import './group-introduction-page.css';

/** RN 群简介页的 H5 只读实现，数据只来自 shared sync facade。 */
export function GroupIntroductionPage() {
  return (
    <GroupTextDetailPage
      title="群简介"
      emptyText="暂无群简介"
      loadingText="正在加载群简介"
      fallbackError="群简介加载失败"
      footerText="仅群主及群管理员可编辑"
      selectText={group => group.introduction}
    />
  );
}

export default GroupIntroductionPage;
