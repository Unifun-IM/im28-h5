/** 群管理角色展示只接收 shared permission 的群主专属能力。 */
export interface GroupManagementRoleCapabilities {
  readonly canManageAdmins: boolean;
  readonly canTransferOwner: boolean;
}

/** 群管理角色展示描述 RN 可见但不可操作的行状态。 */
export interface GroupManagementRoleView {
  readonly switchesDisabled: boolean;
  readonly speechFrequencyDisabled: boolean;
  readonly ownerTransferDisabled: boolean;
}

/** 将 shared capability 投影为 H5 展示状态，不解析客户端角色。 */
export function buildGroupManagementRoleView(
  capabilities: GroupManagementRoleCapabilities,
): GroupManagementRoleView {
  return {
    switchesDisabled: !capabilities.canManageAdmins,
    speechFrequencyDisabled: !capabilities.canManageAdmins,
    ownerTransferDisabled: !capabilities.canTransferOwner,
  };
}
