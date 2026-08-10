import { statement } from './database.js';
import { SDK_SCHEMA_V1_STATEMENTS, SDK_SCHEMA_VERSION } from './schema.js';
const SCHEMA_VERSION_KEY = 'schema_version';
export const SDK_MIGRATIONS = [
    {
        version: 1,
        name: 'create_initial_im_sdk_schema',
        statements: SDK_SCHEMA_V1_STATEMENTS,
    },
    {
        version: 2,
        name: 'create_friendships_cache',
        statements: [
            `CREATE TABLE IF NOT EXISTS friendships (
        user_id TEXT PRIMARY KEY NOT NULL,
        is_friend INTEGER NOT NULL DEFAULT 1,
        updated_at INTEGER NOT NULL DEFAULT 0,
        raw_json TEXT
      )`,
        ],
    },
    {
        version: 3,
        name: 'add_conversation_pinned_at',
        statements: [
            `ALTER TABLE conversations ADD COLUMN pinned_at INTEGER NOT NULL DEFAULT 0`,
            `CREATE INDEX IF NOT EXISTS idx_conversations_pinned_at ON conversations(is_pinned DESC, pinned_at DESC, updated_at DESC)`,
        ],
    },
    {
        version: 4,
        name: 'create_group_members_cache',
        statements: [
            `CREATE TABLE IF NOT EXISTS group_members (
        group_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        nickname TEXT,
        face_url TEXT,
        role_level INTEGER,
        updated_at INTEGER NOT NULL DEFAULT 0,
        raw_json TEXT,
        PRIMARY KEY (group_id, user_id)
      )`,
            `CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id, updated_at DESC)`,
        ],
    },
    {
        version: 5,
        name: 'add_group_member_admin_since',
        statements: [
            `ALTER TABLE group_members ADD COLUMN admin_since TEXT`,
            `CREATE INDEX IF NOT EXISTS idx_group_members_admin_since ON group_members(group_id, admin_since)`,
        ],
    },
    {
        version: 6,
        name: 'add_conversation_archived_index',
        statements: [
            `ALTER TABLE conversations ADD COLUMN is_archived INTEGER NOT NULL DEFAULT 0`,
            `UPDATE conversations SET is_archived = 1 WHERE raw_json LIKE '%"archived":true%' OR raw_json LIKE '%"list_hidden":true%' OR raw_json LIKE '%"listHidden":true%'`,
            `CREATE INDEX IF NOT EXISTS idx_conversations_archived_updated ON conversations(is_archived, is_pinned DESC, pinned_at DESC, updated_at DESC)`,
        ],
    },
];
export async function runMigrations(database, migrations = SDK_MIGRATIONS) {
    await database.open();
    return database.transaction(async (tx) => {
        await ensureMetaTable(tx);
        const currentVersion = await getSchemaVersion(tx);
        const pendingMigrations = migrations
            .filter(migration => migration.version > currentVersion)
            .sort((left, right) => left.version - right.version);
        for (const migration of pendingMigrations) {
            for (const sql of migration.statements) {
                await tx.execute(statement(sql));
            }
            await setSchemaVersion(tx, migration.version);
        }
        return pendingMigrations.at(-1)?.version ?? currentVersion;
    });
}
export async function getSchemaVersion(executor) {
    await ensureMetaTable(executor);
    const rows = await executor.query(statement('SELECT value FROM sdk_meta WHERE key = ?', [SCHEMA_VERSION_KEY]));
    const rawVersion = rows[0]?.value;
    if (typeof rawVersion === 'number') {
        return rawVersion;
    }
    if (typeof rawVersion === 'string') {
        const parsed = Number(rawVersion);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}
export function getTargetSchemaVersion() {
    return SDK_SCHEMA_VERSION;
}
async function ensureMetaTable(executor) {
    await executor.execute(statement(`CREATE TABLE IF NOT EXISTS sdk_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )`));
}
async function setSchemaVersion(executor, version) {
    await executor.execute(statement('INSERT OR REPLACE INTO sdk_meta (key, value, updated_at) VALUES (?, ?, ?)', [
        SCHEMA_VERSION_KEY,
        String(version),
        Date.now(),
    ]));
}
//# sourceMappingURL=migrations.js.map