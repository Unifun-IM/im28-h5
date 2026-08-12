# Web Settings Cache and Version Contract

> TYPE: RUNTIME_CONTRACT / MIGRATION_GATE
> STATUS: FROZEN / 2026-08-10
> AXIOM: H5 只能清理已证明可丢弃且可恢复的数据；版本更新只能基于部署注入的真实 build identity 与受控 HTTP(S) target，不得用 workspace version、全库删除或普通 reload 制造成功态。

## 1. RN Source Trace

| branch | RN owner | RN behavior | H5 semantic difference |
| :--- | :--- | :--- | :--- |
| space | `ProfileScreen.clearCacheDirectory` | 统计并删除 `RNFS.CachesDirectoryPath` children；不删除 SQLite/auth/preferences | Browser 无等价 app-owned filesystem cache；当前主要本地空间是混合语义的 IndexedDB SQLite snapshot |
| version | `versionService.checkClientVersion` | `platform=ios/android` -> Gateway check -> optional/forced modal -> `Linking.openURL(download_url)` | H5 必须使用 `platform=web`、部署 build identity 和 Web URL policy；无法阻止关闭 tab/browser |

## 2. Cache Decision

Current verdict: `blocked-storage-semantics`；不注册 route、不显示空间管理行。

| local data class | current owner | disposable | clear decision |
| :--- | :--- | :--- | :--- |
| auth session | `sessionStorage` / auth runtime | no | **PRESERVE**；清缓存不得退出账号 |
| device identity | `sessionStorage` / tab device store | no | **PRESERVE**；清缓存不得改变当前 tab 设备身份 |
| theme preference | `localStorage` / Web theme owner | no | **PRESERVE** |
| conversations/messages/cursors/calls | account SQLite snapshot | partially | remote rows 可重建，但当前与 local state 共库，禁止整库删除 |
| drafts、`sending/failed` messages、`pending_tasks` | account SQLite snapshot | no without product decision | **PRESERVE**；Gateway 不能完整恢复 |
| generated RN assets / JS / CSS / WASM | browser HTTP cache | deployment-managed | 页面不得计量或清除；由 cache headers/browser 控制 |
| media/temp objects | no canonical H5 owner | n/a | 当前不存在，不得显示虚构字节数 |

`navigator.storage.estimate()` 只提供 origin-wide approximate usage，无法证明当前账号或可丢弃范围，因此不得作为 RN“当前缓存”数值。

### Cache implementation exit gate

未来实现必须同时满足：

1. `disposable storage registry` 明确列出可清 owner；默认拒绝未登记 store/table。
2. `WebIMAccountCacheManager.inspectCurrent()` 只统计已登记可丢弃 bytes。
3. `clearCurrent()` 由 runtime/storage owner 执行：暂停 realtime -> 排空 shared mutation queue -> close Worker -> release lease -> clear registered data -> reopen/migrate -> restart realtime -> publish `dataVersion`。
4. clear failure 必须恢复可用 lifecycle 或 fail closed；不得显示“缓存已清除”后留下关闭的 DB。
5. operation 只影响当前 account；不得删除其他账号 snapshot、auth、device identity、theme 或 browser origin storage。
6. destructive browser proof 必须使用隔离测试账号/IndexedDB；未经明确授权不得清理用户当前数据。

## 3. Version Decision

Current verdict: `runtime-chain-partial`；shared Gateway operation ready，Web adapter/deployment config missing。

| concern | contract |
| :--- | :--- |
| current identity | deployment MUST inject non-empty `VITE_APP_VERSION`; optional `VITE_APP_BUILD_NUMBER` is a non-negative decimal string |
| request | `GatewayHTTPClient.checkClientVersion({ platform:'web', version, build_number? })`；operation remains public/no-auth |
| disabled config | `client_version.is_enable === false` -> `needUpdate=false` |
| display | row shows the exact injected app version；latest/title/description come only from Gateway |
| update target | parse `download_url` with `URL`; production allows `https:` only；localhost development may allow `http:`；other schemes reject visibly |
| optional update | user may dismiss modal or navigate to validated target |
| forced update | modal blocks in-app route actions and cannot dismiss；H5 does **not** claim it can prevent tab/browser close |
| success | navigation/reload initiation is not update success；new boot must expose a different injected build before the app can be considered updated |
| missing URL | show `暂无更新地址`；no reload、countdown or success state |
| missing build identity | version capability fails closed and the row remains omitted；workspace package `0.1.0` is not a production fallback |

Canonical future chain:

```text
MeSettingsPage version action
-> WebIMRuntime.checkClientVersion()
-> web client-version adapter
-> shared GatewayHTTPClient.checkClientVersion(platform=web)
-> route-owned modal state
-> validated browser navigation only after explicit user action
```

## 4. Slice Decisions

| slice | state | deliverable | gate |
| :--- | :--- | :--- | :--- |
| `W6.a5.2.7.4-cache-contract` | `blocked-storage-semantics` | disposable registry + lifecycle-safe inspect/clear | preserve local-only rows；isolated destructive tests；real Worker/Web Lock recovery |
| `W6.a5.2.7.5-web-version-check` | `done-local/acceptance-gated` | required deployment config + runtime adapter + RN settings row/modal | 11 focused tests；27 files/81 tests verify；real no-update + mobile/desktop/reload/guest proof；real update response pending |
| `W6.a5.2.7.3-network-settings` | `blocked-browser-semantics` | deployment proxy contract | browser fetch proxy ownership exists |

## 5. Anti-Fake Gate

- ❌ delete the whole IndexedDB database and call it RN cache parity.
- ❌ use `navigator.storage.estimate()` as current-account cache bytes.
- ❌ use `package.json` workspace version as deployed build identity.
- ❌ call `location.reload()` and immediately report update success.
- ❌ expose cache/version rows before their required runtime/config owner exists.
