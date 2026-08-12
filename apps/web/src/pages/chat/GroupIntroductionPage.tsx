import {
  IM_GROUP_INTRODUCTION_MAX_LENGTH,
  type WebIMJoinedGroup,
  type WebIMJoinedGroupSync,
} from '@im28/im-sdk/web';

import { GroupTextDetailPage } from './GroupTextDetailPage.js';
import {
  buildGroupIntroductionView,
  normalizeGroupIntroductionDraft,
} from './group-introduction-view.js';
import './group-text-detail-page.css';

/** 读取 shared 群简介字段，保持详情 owner 的配置稳定。 */
function selectGroupIntroduction(group: WebIMJoinedGroup): string {
  return group.introduction;
}

/** 群简介保存只调用 shared joined-group facade。 */
function updateGroupIntroduction(
  groups: WebIMJoinedGroupSync,
  groupID: string,
  introduction: string,
  _conversationID: string,
): Promise<WebIMJoinedGroup> {
  return groups.updateIntroduction(groupID, introduction);
}

/** RN 群简介页的 H5 编辑/只读实现，业务状态只来自 shared sync facade。 */
export function GroupIntroductionPage() {
  return (
    <GroupTextDetailPage
      title="群简介"
      emptyText="暂无群简介"
      loadingText="正在加载群简介"
      fallbackError="群简介加载失败"
      footerText="仅群主及群管理员可编辑"
      selectText={selectGroupIntroduction}
      editor={{
        maxLength: IM_GROUP_INTRODUCTION_MAX_LENGTH,
        placeholder: `填写群简介(${IM_GROUP_INTRODUCTION_MAX_LENGTH}字)`,
        successText: '群简介已更新',
        canEdit: group => buildGroupIntroductionView(group).canEdit,
        normalize: value => normalizeGroupIntroductionDraft(
          value,
          IM_GROUP_INTRODUCTION_MAX_LENGTH,
        ),
        update: updateGroupIntroduction,
      }}
    />
  );
}

export default GroupIntroductionPage;
