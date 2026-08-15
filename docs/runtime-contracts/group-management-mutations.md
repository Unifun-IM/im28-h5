# Group Management Mutations

> TYPE: CONTRACT / AUDIT
> STATUS: `permission-owner-converged / member-removal-converged / member-invite-web-converged / admin-owner-web-converged / settings-mute-web-converged / lifecycle-web-converged`
> SLICE: `W6.a6.18.3.13`

## Axioms

- canonical owner: `im28-sdk/src/sync/**`; RN/H5/Desktop 只保留 UI、路由、平台生命周期和事件投影。
- one action -> one Gateway write；Gateway 或后置 cache sync 失败均不得回退 OpenIM 再写一次。
- remote success + local convergence failure = partial-success；只能重试 cache convergence，禁止重放 remote mutation。
- permission source: explicit `group.user_permission` -> cached self member role fallback -> fail-closed。
- H5 已迁移成员移除、邀请、管理员设置/取消、群主转让、设置/禁言和群生命周期 caller；transport method 存在仍不等于能力已迁移。
- 本合同不授权真实邀请、移除、角色变更、转让、退群或解散。

## Current Inventory

| domain | RN production caller | current runtime owner | SDK state | H5 state | risk |
| :--- | :--- | :--- | :--- | :--- | :--- |
| invite members | `GroupAddFriendsScreen` | RN `openIMService.inviteUsersToGroup` 保持冻结基线 | neutral Web owner: `inviteIMGroupMembers` -> one application/direct write -> strict response -> optional member refresh | `/settings/members/invite` -> `groupMembers.inviteMembers` | `shared-core-ready/web-consumed/rn-frozen`；真实邀请未执行 |
| remove members | `GroupRemoveMembersScreen` | `openIMService.kickGroupMembers` -> shared `createIMGroupMentionSync.removeMembers` | neutral owner: permission/target validation -> one `removeGroupMember` -> cross-table transaction -> authoritative refresh | `/settings/members/remove` -> `groupMembers.removeMembers` | `converged/destructive-acceptance-gated`；无 OpenIM fallback，真实移除未执行 |
| admin role | `GroupAdminsScreen`; `GroupAddAdminsScreen` | RN `updateGroupMemberRole` 保持冻结基线 | neutral Web owner: owner/target/limit preflight -> one batch set/cancel -> group/member transaction -> independent refresh | `/settings/manage` -> `groupMembers.setAdmins/cancelAdmins` | `shared-core-ready/web-consumed/rn-frozen`；真实角色变更未执行 |
| group settings | `GroupManageScreen`; `GroupSpeechFrequencyScreen` | RN `updateGroupAdminPermissions/updateGroupSettings` 冻结 | neutral Web owner: `createIMGroupManagementSync.updateSettings` -> field permission -> one explicit patch -> strict group merge | `/settings/manage`、`/manage/speech-frequency` | `shared-core-ready/web-consumed/rn-frozen`；真实 toggle 未执行 |
| group/member mute | `GroupMuteScreen`; `UserProfileScreen` | RN `changeGroupMute/updateGroupMemberMute` 冻结 | neutral Web owner: `updateMute/updateMemberMute` -> capability/target preflight -> one write -> strict group/member merge | `/settings/manage/mute` | `shared-core-ready/web-consumed/rn-frozen`；真实 mute 未执行 |
| transfer owner | `GroupTransferOwnerScreen`; owner-exit selection flow | RN `transferGroupOwner` 保持冻结基线 | neutral Web owner: owner/active-target preflight -> one transfer -> atomic role swap/group owner update -> independent refresh | `/settings/manage` -> `groupMembers.transferOwner` | `shared-core-ready/web-consumed/rn-frozen`；真实转让未执行 |
| leave group | `GroupSettingsScreen`; `GroupRowActionMenu`; `GroupOwnerQuitActionSheets` | RN `quitGroup` 与 earliest-admin UI 保持冻结基线 | neutral Web owner: `selectIMEarliestGroupAdmin` -> permission/admin successor -> one Gateway leave -> group-domain transaction | 普通成员确认层或群主双分支底部面板 -> `groupLifecycle.leave` | `shared-core-ready/web-consumed/rn-frozen`；群主无管理员 fail-closed，有管理员由 Gateway 自动转移；真实退群未执行 |
| dismiss group | `GroupSettingsScreen` | RN `dismissGroup` 保持冻结基线 | neutral Web owner: `groupLifecycle.dismiss` -> owner permission -> one Gateway write -> group-domain transaction | 群设置确认层 -> `groupLifecycle.dismiss` | `shared-core-ready/web-consumed/rn-frozen`；真实解散未执行 |

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
| `.13.4-admin-and-owner` | set admin; cancel admin; transfer owner | shared role state machine and member/group cache convergence | `done-local`；owner/target/limit/failure/exactly-once tests；H5 SPA caller；no real mutation |
| `.13.5-group-settings-and-mute` | group settings patch; group mute; member mute | field-specific permission and strict response merge | no duplicate patch mapper; no real toggle |
| `.13.6-group-lifecycle` | leave; dismiss | destructive shared lifecycle and cross-table cleanup | `done-local`；explicit confirmation、exactly-once、transaction/rollback、partial-success；real action remains separately authorized |

## Audit Verdict

`W6.a6.18.3.13 = closed-local`；`.13.1-.13.6 = shared-core-ready/web-consumed/rn-frozen`。H5 caller 消费 shared owner，RN production caller 保持冻结基线，不宣称双端 convergence。全部真实群管理 mutation 与第二账号 realtime/list-back 仍需单独授权。

## Lifecycle Contract Resolution (2026-08-13)

| operation | preflight | one allowed write | local convergence |
| :--- | :--- | :--- | :--- |
| leave | cached group/current member；reject owner；`canQuitGroup=true` | one `leaveGroup`；`clear_history` only when explicit | strict group ID -> transaction deletes attachments/messages/all group conversations/members/group；failure=`remote-only` |
| dismiss | cached group/current member；owner role + `canDismissGroup=true` | one `dismissGroup` | same transaction；single conversation with same target ID is preserved |

H5 设置页只消费 `WebIMJoinedGroup.permissions`、完整成员快照和 `WebIMSync.groupLifecycle`。普通成员使用确认层；群主使用 RN 同款底部动作面板，并由 shared `selectIMEarliestGroupAdmin` 决定无管理员阻断或最早管理员继任分支。页面不调用显式 transfer；确认后一次 leave 由 Gateway 自动转移。`remote-only` 关闭 modal、显示远端已成功，并锁定当前页面危险按钮，禁止重放。真实退群/解散未执行；本轮浏览器登录态已失效，认证群主面板视觉与真实动作保持 gated。

## Settings And Mute Contract Resolution (2026-08-13)

| operation | permission/preflight | one allowed write | local convergence |
| :--- | :--- | :--- | :--- |
| group settings | `canManageAdmins`；patch 至少一个显式字段；frequency 为 `30/60/180/300/600/1800/3600` | one `updateGroupSetting` | strict group ID；merge old raw + remote + explicit patch；错群/SQLite failure=`remote-only` |
| group mute | `canMuteAll`；`mute_all/mute_member` 至少一个显式字段 | one `updateGroupMute` | strict group ID；preserve unrelated group raw fields |
| member mute | `canMuteMembers`；target=active normal member；reject self/owner/admin；empty expiry=unmute，non-empty=future RFC3339 | one `updateGroupMemberMute` | strict group/member ID；single-member upsert preserves role/profile raw fields |

H5 三页只消费 `WebIMSync.groupManagement`，所有开关/mute 使用 confirmation，发言频率使用显式“确定”；页面不导入 Gateway/Repository/SQL/OpenIM，也不复制角色权限。真实 mutation、server-denial 和 second-account realtime/list-back 保留授权门。

## Admin And Owner Contract Resolution (2026-08-13)

| operation | preflight | one allowed write | local convergence |
| :--- | :--- | :--- | :--- |
| set admins | current owner + explicit/fallback `canManageAdmins`; targets are normal members; total admins <= 10 | one batch `setGroupAdmin` | merge group response + atomically upsert all confirmed target roles, then independent full member refresh |
| cancel admins | current owner + `canManageAdmins`; targets are current admins | one batch `cancelGroupAdmin` | remove admin role/adminSince in the same group/member transaction, then independent refresh |
| transfer owner | current owner + `canTransferOwner`; target is active admin/member and not self | one `transferGroupOwner` | atomically downgrade previous owner, promote target, update `owner_user_id`; missing returned permission becomes member fail-closed; then independent refresh |

H5 候选过滤调用 SDK `filterIMGroupAdminCandidates/filterIMGroupOwnerTransferCandidates`，页面不复制角色表。远端返回错群、本地事务失败或后置刷新失败均不得重放 mutation；返回 `remote-only|local|authoritative` 供页面显式反馈。

## Invite Contract Resolution (2026-08-12)

| group fact | one allowed write | strict success proof |
| :--- | :--- | :--- |
| `join_approval_required=true` | `POST /v1/group/application/invite` with batch `requester_user_ids` | `data.list[].application` 与请求 group/targets 一一对应且具有稳定 application ID/type=invite |
| `join_approval_required=false` | `POST /v1/group/member/invite` with batch `member_user_ids` | 回包 group ID 与请求完全一致；随后可独立刷新权威成员快照 |
| missing/invalid setting | none | fail-closed，不猜测 endpoint |

邀请 preflight 必须验证当前群、当前成员、`canInviteMembers`、目标非群成员、目标仍是好友且 `allow_group_invite=true`。一次用户提交只允许一次远端写；远端成功后的群 cache 或成员 refresh 失败返回可见 partial-success，禁止自动重放 application/direct invite。
