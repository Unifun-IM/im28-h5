# Project AGENTS

> TYPE: OPERATING_CONTRACT / H5_IM

## Reading Order

1. `AGENTS.md`
2. `architecture.md`
3. `docs/web-im-storage.md`
4. `docs/runtime-contracts/web-gateway-runtime.md` before auth, token, Gateway HTTP/WebSocket or runtime lifecycle changes
5. `README.md`
6. task-specific source under `apps/**` or `packages/**`

## Hard Rules

- `im28-h5/` owns browser-only code and documentation; it must not import React Native modules.
- Page switching must use React Router under the Web App owner; pages must not manipulate History API directly.
- Reuse platform-neutral contracts from `@im28/im-sdk/web`; do not duplicate IM DTO or SQL repository semantics in page code.
- Keep Gateway HTTP/WebSocket, auth token and lifecycle logic behind `packages/im-sdk-web/src/runtime/**`; pages must not instantiate shared Gateway clients directly.
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
- Browser integration changes require a Chromium smoke; production browser acceptance still requires Chromium, Firefox and Safari evidence.
