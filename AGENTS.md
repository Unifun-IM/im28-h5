# Project AGENTS

> TYPE: OPERATING_CONTRACT / H5_IM

## Reading Order

1. `AGENTS.md`
2. `architecture.md`
3. `docs/rn-h5-migration-contract.md` before page, style, asset, route or capability migration changes
4. `docs/web-im-storage.md`
5. `docs/runtime-contracts/web-gateway-runtime.md` before auth, token, Gateway HTTP/WebSocket or runtime lifecycle changes
6. `README.md`
7. task-specific source under `apps/**` or sibling `../im28-sdk/src/platforms/web/**`

## Hard Rules

- `im28-h5/` owns browser-only code and documentation; it must not import React Native modules.
- `packages/im-sdk/` is a committed generated Web distribution from sibling `im28-sdk`; never edit it directly or add SDK source there.
- `im28-phone/src/theme/**` and the corresponding RN screen/component `StyleSheet` are the visual truth; migrated H5 pages must record source mappings and may adapt browser mechanics without redesigning the page.
- RN business assets must be mirrored byte-for-byte under `apps/web/src/assets/rn/**`; use `npm run assets:sync` and keep `npm run assets:check` passing. Do not substitute an RN asset with a generic icon when the RN source exists.
- Page switching must use React Router SPA routes under the Web App owner; full-screen states need stable routes, pages must not manipulate History API directly, and valid deep links must survive refresh/back/forward.
- App/page code imports SDK APIs only from `@im28/im-sdk/web`. Do not import `/core`, `/rn`, `/desktop`, duplicate IM DTO/Repository semantics, call generated OpenAPI, or issue Gateway `fetch` from a page.
- Keep Gateway HTTP/WebSocket, auth token and browser lifecycle logic behind `../im28-sdk/src/platforms/web/runtime/**`; pages must not instantiate shared Gateway clients directly.
- Browser SQLite uses `sql.js`; IndexedDB persists exported database bytes and is not a second query model.
- Local data is a rebuildable cache; Gateway remains authoritative for messages, read state, conversation state, and sync cursors.
- Scope each database by normalized `userID`; never persist access or refresh tokens inside the SQLite payload.
- Database writes must be serialized. A successful transaction persists one database snapshot after `COMMIT`.
- Do not claim multi-tab write safety until an exclusive Web Locks/SharedWorker owner is implemented and tested.
- Every generated TypeScript `interface`, `type`, `function`, `const`, and `let` requires a concise useful Chinese comment.
- Source files should remain at or below 300 lines and expose named public exports through the nearest `index.ts` facade.
- Storage implementation changes must update `architecture.md` or `docs/web-im-storage.md` when ownership, persistence, or failure semantics change.

## Verification

- Use Node.js `>=22.11.0`.
- Run commands from `im28-h5/`.
- Storage changes require `npm run verify`.
- Page migration requires source trace plus 390x844 and desktop light/dark visual evidence, route refresh/back/forward checks and focused API evidence.
- Browser integration changes require a Chromium smoke; production browser acceptance still requires Chromium, Firefox and Safari evidence.
