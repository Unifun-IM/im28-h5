import type { WebIMJoinedGroup } from '@im28/im-sdk/web';

/** 群简介编辑页消费的稳定视图状态。 */
export interface GroupIntroductionView {
  readonly introduction: string;
  readonly canEdit: boolean;
}

/** 从 shared 群快照投影 RN 既有简介与统一 capability。 */
export function buildGroupIntroductionView(
  group: WebIMJoinedGroup,
): GroupIntroductionView {
  return {
    introduction: group.introduction,
    canEdit: group.permissions.canEditGroupInfo,
  };
}

/** 保存前对齐 shared SDK 的非空 trim 与 500 字合同。 */
export function normalizeGroupIntroductionDraft(
  value: string,
  maxLength: number,
): string {
  // introduction 是唯一会提交给 shared facade 的表单值。
  const introduction = value.trim();
  if (!introduction) throw new Error('群简介不能为空');
  if (introduction.length > maxLength) {
    throw new Error(`群简介最多 ${maxLength} 个字符`);
  }
  return introduction;
}
