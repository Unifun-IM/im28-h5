# Group Management Mutations

> TYPE: CONTRACT / AUDIT
> STATUS: `permission-owner-converged / member-removal-converged / member-invite-web-converged / remaining-mutations-pending`
> SLICE: `W6.a6.18.3.13`

## Axioms

- canonical owner: `im28-sdk/src/sync/**`; RN/H5/Desktop 只保留 UI、路由、平台生命周期和事件投影。
- one action -> one Gateway write；Gateway 或后置 cache sync 失败均不得回退 OpenIM 再写一次。
- remote success + local convergence failure = partial-success；只能重试 cache convergence，禁止重放 remote mutation。
- permission source: explicit `group.user_permission` -> cached self member role fallback -> fail-closed。
- H5 当前已迁移成员移除与邀请 caller；其他群管理 mutation caller 仍为 `0`，transport method 存在不等于能力已迁移。
- 本合同不授权真实邀请、移除、角色变更、转让、退群或解散。

## Current Inventory

| domain | RN production caller | current runtime owner | SDK state | H5 state | risk |
| :--- | :--- | :--- | :--- | :--- | :--- |
| invite members | `GroupAddFriendsScreen` | RN `openIMService.inviteUsersToGroup` 保持冻结基线 | neutral Web owner: `inviteIMGroupMembers` -> one application/direct write -> strict response -> optional member refresh | `/settings/members/invite` -> `groupMembers.inviteMembers` | `shared-core-ready/web-consumed/rn-frozen`；真实邀请未执行 |
| remove members | `GroupRemoveMembersScreen` | `openIMService.kickGroupMembers` -> shared `createIMGroupMentionSync.removeMembers` | neutral owner: permission/target validation -> one `removeGroupMember` -> cross-table transaction -> authoritative refresh | `/settings/members/remove` -> `groupMembers.removeMembers` | `converged/destructive-acceptance-gated`；无 OpenIM fallback，真实移除未执行 |
| admin role | `GroupAdminsScreen`; `GroupAddAdminsScreen` | `updateGroupMemberRole` -> set/cancel admin -> OpenIM fallback | transport only | no route/caller | Gateway success 后不收敛 member role cache；任意 error 可触发第二次写 |
| group settings | `GroupManageScreen`; `GroupSpeechFrequencyScreen` | `updateGroupAdminPermissions`; `updateGroupSettings` | transport only: `updateGroupSetting` | no mutation caller | RN 持有权限字段映射、group cache merge 与事件语义，跨端会漂移 |
| group/member mute | `GroupMuteScreen`; `UserProfileScreen` | `changeGroupMute`; `updateGroupMemberMute` | transport only | no route/caller | 全群 mute 仍有 OpenIM fallback；成员 mute 只有 Gateway，但成员 cache 未收敛 |
| transfer owner | `GroupTransferOwnerScreen`; owner-exit selection flow | `transferGroupOwner` -> Gateway/OpenIM fallback | transport only | no route/caller | owner/admin role snapshot 未同步；失败回退可能重复转让 |
| leave group | `GroupSettingsScreen`; `GroupRowActionMenu` | `quitGroup` -> Gateway/OpenIM fallback -> RN conversation cleanup | transport only: `leaveGroup` | no route/caller | destructive lifecycle；任意 Gateway error 可触发第二次 leave；conversation/group/member cleanup 非 shared transaction |
| dismiss group | `GroupSettingsScreen` | `dismissGroup` -> Gateway/OpenIM fallback -> RN conversation cleanup | transport only: `dismissGroup` | no route/caller | destructive owner-only lifecycle；双写风险与跨表 cleanup 不原子 |

## Frozen Behavior

| operation | input | preflight | success-only local convergence | unresolved acceptance |
| :--- | :--- | :--- | :--- | :--- |
| remove members | stable `groupID` + deduped non-self member IDs | explicit `can_remove_member(s)`；fallback owner/admin | remove selected member rows -> refresh authoritative member snapshot -> update group member count | authorized disposable member removal + second-account realtime/list-back |
| invite members | stable `groupID` + deduped non-member friend IDs | explicit `can_invite_member(s)`；fallback owner/admin；friend `allow_group_invite=true` | approval=true 创建批量 application；false 直接邀请并独立刷新权威成员；partial-success 不重放 | authorized real invite + second-account application/member realtime/list-back |
| set/cancel admin | stable group/member IDs + target role | owner / explicit `can_manage_admins`; reject self/owner target | refresh member roles and group profile | authorized role change + second-account realtime/list-back |
| update settings/mute | one explicit patch with at least one supported field | field-specific explicit permission; owner fallback only where RN currently requires owner | strict response group/member merge; preserve unrelated raw fields | authorized toggle + server-denial sample + realtime/list-back |
| transfer owner | stable group/new-owner IDs | current user owner; target active non-owner member | refresh member roles/group permission before UI transition | explicit destructive authorization and two-account proof |
| leave/dismiss | stable group and explicit cleanup scope | leave rejects owner; dismiss requires owner | one shared transaction removes group/member/conversation/message state only after remote success | explicit destructive authorization; rollback/partial-success and realtime/list-back |

## Forbidden Paths

- ❌ `catch(any Gateway error) -> OpenIM mutation`。
- ❌ remote mutation succeeded but cache refresh failed -> replay remote mutation。
- ❌ page imports `GatewayHTTPClient`, Repository, SQL or OpenIM client。
- ❌ H5 implements permission rules copied from RN helper。
- ❌ render a success toast before shared facade returns an authoritative success/partial-success result。
- ❌ infer invite-application success from `GatewayGroup` response。

## Execution Queue

| slice | operations | deliverable | exit gate |
| :--- | :--- | :--- | :--- |
| `.13.1-shared-group-management-permissions` | read-only permission projection | one neutral permission DTO consumed by RN/H5 group settings | `done-local`；explicit-field/role/fail-closed tests；RN helper 与 H5 joined-group actual consumers；zero page raw-payload parser |
| `.13.2-shared-member-removal` | remove members | shared validation/Gateway/cache state + RN caller adoption + H5 SPA selection route | `done-local`；one remote write、no OpenIM fallback、failure/partial-success/cache tests；no real removal |
| `.13.3-invite-contract-and-core` | invite members | backend semantic freeze, shared Web core, H5 caller；RN frozen | `done-local`；direct/application strict response；no fake success；no real invite |
| `.13.4-admin-and-owner` | set admin; cancel admin; transfer owner | shared role state machine and member/group cache convergence | max three operations; owner/target/failure tests; no real mutation |
| `.13.5-group-settings-and-mute` | group settings patch; group mute; member mute | field-specific permission and strict response merge | no duplicate patch mapper; no real toggle |
| `.13.6-group-lifecycle` | leave; dismiss | destructive shared lifecycle and cross-table cleanup | explicit confirmation contract + transactional/partial-success tests; real action remains separately authorized |

## Audit Verdict

`W6.a6.18.3.13 = active`；`.13.1 = shared-core-ready/web-consumed/rn-frozen`；`.13.2 = shared-core-ready/web-consumed/rn-frozen`；`.13.3 = shared-core-ready/web-consumed/rn-frozen`。成员移除与邀请的 H5 caller 消费 shared owner，RN production caller 保持冻结基线，不宣称双端 convergence。真实移除/邀请与第二账号 realtime/list-back 仍需单独授权；下一切片是 `.13.4 admin and owner`。

## Invite Contract Resolution (2026-08-12)

| group fact | one allowed write | strict success proof |
| :--- | :--- | :--- |
| `join_approval_required=true` | `POST /v1/group/application/invite` with batch `requester_user_ids` | `data.list[].application` 与请求 group/targets 一一对应且具有稳定 application ID/type=invite |
| `join_approval_required=false` | `POST /v1/group/member/invite` with batch `member_user_ids` | 回包 group ID 与请求完全一致；随后可独立刷新权威成员快照 |
| missing/invalid setting | none | fail-closed，不猜测 endpoint |

邀请 preflight 必须验证当前群、当前成员、`canInviteMembers`、目标非群成员、目标仍是好友且 `allow_group_invite=true`。一次用户提交只允许一次远端写；远端成功后的群 cache 或成员 refresh 失败返回可见 partial-success，禁止自动重放 application/direct invite。
