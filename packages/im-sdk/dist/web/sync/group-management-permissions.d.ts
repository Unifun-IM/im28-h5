/** 群管理页面跨 RN、Web、Desktop 共用的 capability 快照。 */
export interface IMGroupManagementPermissions {
    readonly canEditGroupInfo: boolean;
    readonly canEditAnnouncement: boolean;
    readonly canInviteMembers: boolean;
    readonly canRemoveMembers: boolean;
    readonly canAuditApplications: boolean;
    readonly canOpenGroupManage: boolean;
    readonly canManageAdmins: boolean;
    readonly canTransferOwner: boolean;
    readonly canDismissGroup: boolean;
    readonly canQuitGroup: boolean;
    readonly canMuteAll: boolean;
    readonly canMuteMembers: boolean;
    readonly canClearMessages: boolean;
    readonly canMentionAll: boolean;
}
/** 群管理权限解析只接收服务端显式快照和当前成员角色。 */
export interface IMResolveGroupManagementPermissionsInput {
    readonly userPermission?: unknown;
    readonly currentMemberRole?: unknown;
}
/** 按显式 capability、角色回退、fail-closed 顺序解析群管理权限。 */
export declare function resolveIMGroupManagementPermissions(input: IMResolveGroupManagementPermissionsInput): IMGroupManagementPermissions;
//# sourceMappingURL=group-management-permissions.d.ts.map