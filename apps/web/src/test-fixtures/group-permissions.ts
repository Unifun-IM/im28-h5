import type {
  IMGroupManagementPermissions,
  WebIMJoinedGroupRole,
} from '@im28/im-sdk/web';
import { resolveIMGroupManagementPermissions } from '@im28/im-sdk/web';

/** 按 shared 角色回退语义构造测试专用群管理权限。 */
export function createGroupPermissionsFixture(
  role: WebIMJoinedGroupRole = 'member',
  overrides: Partial<IMGroupManagementPermissions> = {},
): IMGroupManagementPermissions {
  /** permissions 直接调用 production resolver，测试不复制业务算法。 */
  const permissions = resolveIMGroupManagementPermissions({ currentMemberRole: role });
  return {
    ...permissions,
    ...overrides,
  };
}
