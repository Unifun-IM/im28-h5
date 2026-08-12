# IM28 H5 Foundation Cleanup

> TYPE: W6 CLOSEOUT SSOT. `local gate green` does not imply real Gateway、device or destructive-flow acceptance.

## 1. Verdict

| dimension | state | evidence |
| :--- | :--- | :--- |
| shared business owner | `converged` | clear/realtime/search logic exists once in `im28-sdk/src/sync`; RN/H5 own composition and presentation |
| SDK -> RN compatibility floor | `green` | 5 suites/176 tests + RN typecheck |
| H5 local migration floor | `green` | 466 assets + SDK Web 58/200 + H5 typecheck/build |
| RN repository floor | `green` | TypeScript passed；164/164 suites、1369/1369 tests；ChatDetail 166/166 |
| W6 local closeout | `done-local/acceptance-gated` | local P0/P1 zero；external gates remain explicit |

## 2. RN Regression Ledger

| owner | failures | classification | next action |
| :--- | ---: | :--- | :--- |
| `ChatDetailScreen.test.tsx` | 0 | segmented history/staged unread integration contract converged | `166/166` green；production fixes and current native event sequence are covered |
| `ActionBubble.test.tsx` | 0 | fixed product SVG paint propagation | `5/5` green |
| `ConversationListScreen.test.tsx` | 0 | standalone contract is green；prior full-run leakage not reproduced after convergence | targeted suite green |
| `BroadcastComposeScreen.test.tsx` | 0 | fixed owned ScrollView lookup | targeted suite green |
| `ChatHomeScreen.test.tsx` | 0 | chronological cache ordering expectation aligned | targeted suite green |
| `ProfileQRCodeOverlay.test.tsx` | 0 | React Native `Platform.default` mock repaired | targeted suite green |
| `ForwardTargetSelector.test.tsx` | 0 | restored card-share message input | targeted suite green |
| `chatMessageHelpers.test.ts` | 0 | `im-` fallback identity contract frozen | targeted suite green |
| `scripts/__tests__/svg-icon-paints.test.js` | 0 | registered as a real Jest test | targeted suite green |

Resolved ChatDetail production defects: no-boundary history no longer duplicates rows；server-cleared/deleted unread gaps use an explicit non-user read convergence path；voice played persistence and rendering use one stable message identity. Corrected guards: delete marker order is `marker -> shatter -> animation end -> remove`，and incomplete history mocks no longer inject `clientMsgID=undefined` rows.

Resolved closeout drift: staged unread anchors use index `0` before the unread batch enters the native document flow；read reporting requires a completed anchor plus real user drag/scroll/end events；presence tests cover cache-first status followed by deferred Gateway refresh. No SDK business rule was weakened to satisfy legacy UI assertions.

## 3. Boundary Audit

| rule | result | retained exception |
| :--- | :--- | :--- |
| H5 page MUST NOT own SQL/Gateway client | `pass` | `chat-media-download.ts` uses injected browser resource `fetch`; no IM API/cache mutation |
| RN screen MUST NOT call SDK runtime directly | `pass` | screen imports are types or pure preset/icon helpers only |
| shared clear/realtime/search MUST have one owner | `pass` | SDK neutral sync + RN/H5 composition facades |
| fake-success main path MUST NOT exist | `pass` | visible errors remain visible；no local success fallback |
| generated app packages MUST NOT own source | `pass` | app `packages/im-sdk` contains generated package artifacts only |

## 4. Accepted Debt

| debt | reason | exit condition |
| :--- | :--- | :--- |
| RN `ChatDetailScreen.tsx` exceeds 1000 lines | current change restores a narrowly scoped production notice regression；splitting the high-risk screen inside closeout would expand blast radius | dedicated guarded refactor with behavioral baseline |
| H5 production main chunk exceeds 500 KB warning | migration remains functional and build is green | route/module chunking performance slice |
| Jest reports open handles under `--forceExit` | full suite completes but teardown ownership is not isolated | run targeted `--detectOpenHandles` and fix owning service mocks |
| RN lint unavailable | repository has no usable ESLint config in the current package baseline | restore declared lint toolchain/config and rerun |

## 5. External Gates

| gate | state | required authority/environment |
| :--- | :--- | :--- |
| real Gateway login/data-backed parity | `blocked-external` | stable test Gateway credentials/data |
| clear/delete/edit/send mutations | `blocked-authorization` | explicit destructive/mutation approval |
| dual-account realtime/list-back | `blocked-external` | two simultaneous authenticated clients |
| Safari/Firefox/browser matrix | `blocked-environment` | runnable target browsers |
| RTC authentication/call flow | `blocked-external` | valid RTC credentials and device permissions |

## 6. Exit Rule

`W6.closeout = local P0/P1 zero + SDK all-runtime green + H5 verify green + RN full local floor green + residual external gates explicitly retained`.

## 7. W6.a6.19 Incremental Cleanup

| check | result | evidence |
| :--- | :--- | :--- |
| canonical display-name owner | `pass` | `resolveIMGroupMemberDisplayName` owns `备注 > 群内昵称 > 公开昵称 > userID` and is exported by RN/Web/Desktop；H5 has no duplicate priority chain |
| generated-package boundary | `pass` | source changed only under `im28-sdk/src`；`build:web`/`build:rn` synced committed app distributions；`build:package:desktop:web` remained unchanged |
| platform-only presentation | `pass` | H5 owns sender placement、role badge、180px image ratio、voice width and browser OSS decode fallback；message URL/cache/mention identity remain immutable |
| file-size convergence | `pass` | touched `chat-page.css` was split from 1138 to 902 lines；message content styles moved to a 235-line owned file；all touched TS/TSX stay below 300 lines |
| placeholders/debug/dead exports | `pass` | no new TODO/FIXME/HACK/console path；shared resolver has RN/Web consumers and focused tests |
| local verification | `green` | H5 5/22 focused + full verify；SDK Web 59/204 + sender 1/4；466 assets；RN/Web/Desktop typecheck；build:rn/build:web/H5 build |

Incremental P0/P1 is zero. Accepted gates are a real owner/admin sender sample、signed/private OSS media、Safari/Firefox media behavior and already registered authorized mutation/realtime/RTC flows.

## 8. W6.a5.2.1.3 Incremental Cleanup

| check | result | evidence |
| :--- | :--- | :--- |
| current RN route truth | `pass` | one contact shortcut opens `验证消息` with `好友验证/群聊验证` tabs；H5 removed the two-shortcut drift |
| business owner | `pass` | verification container owns route/presentation only；existing friend/group pages retain their sole facade and mutation flows |
| compatibility exit | `pass` | two old index paths are redirect-only；unused standalone page/header/search branches were deleted；group detail remains one route |
| platform boundary | `pass` | no SDK、RN、Gateway、SQLite or generated package source changed；no fake badge/success was added |
| local/browser gate | `green` | SDK Web 59/204；H5 typecheck/build；real 5-row friend/empty group data、390x844/760x900、redirect/reload/back、zero-overflow/zero-console proof passed |

Incremental P0/P1 is zero. Pending friend、non-empty owner/admin group、unread badges、approved mutations and Safari/Firefox remain explicit gates.

## 10. W6.a6.18.3.4 Incremental Cleanup

| check | result | evidence |
| :--- | :--- | :--- |
| shared business owner | `pass` | group introduction remains `WebIMJoinedGroup.introduction` behind existing group cache/sync facade；H5 adds no Gateway、SQL、DTO or update state machine |
| route ownership | `pass` | one lazy React Router child route owns the read-only detail；settings entry uses current verified conversation identity |
| parity/no fake path | `pass` | RN order and three canonical strings are source-traced；cache miss and mismatched group fail visibly rather than fabricating content/success |
| code hygiene | `pass` | new TSX is 140 lines、CSS 92 lines；no TODO/FIXME/HACK、console、dead export、platform-cross import or duplicate helper |
| local/browser gate | `green` | focused 5/5、H5 54/177、SDK Web 70/272、466 assets/typecheck/build；authenticated 567/390px entry/detail/back/overflow/console proof |

Incremental P0/P1 is zero. Non-empty remote content、owner/admin editing、dark/device/Safari/Firefox and all group mutations remain explicit acceptance gates.

## 9. W6.a5.2.15 Incremental Cleanup

| check | result | evidence |
| :--- | :--- | :--- |
| shared business owner | `pass` | member cache/sync and display-name priority remain in the existing SDK facades；H5 adds no transport、SQL or identity state machine |
| route ownership | `pass` | one React Router member route；profile return state is allowlisted to that exact route family |
| duplicate/dead code | `pass` | settings preview now reuses the shared display-name resolver；member row/view/page responsibilities are separated and all new TS/TSX files stay below 300 lines |
| debug/placeholders | `pass` | no new console、TODO/FIXME/HACK、mock or fake-success path |
| local/browser gate | `green` | focused 4/15、typecheck/build/full verify、authenticated 4-row/search/profile-back and 567/390px zero-overflow proof |

Incremental P0/P1 is zero. SDK/RN source and `build:package:desktop:web` remain untouched；all group mutations and RTC remain outside this slice.
