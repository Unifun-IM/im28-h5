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
    {
        version: 7,
        name: 'add_message_entities',
        statements: [
            `ALTER TABLE messages ADD COLUMN entities_json TEXT`,
        ],
    },
    {
        version: 8,
        name: 'create_custom_emoji_cache',
        statements: [
            `CREATE TABLE IF NOT EXISTS custom_emojis (
        emoji_id TEXT PRIMARY KEY NOT NULL,
        url TEXT NOT NULL,
        added_at INTEGER NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at INTEGER NOT NULL
      )`,
            `CREATE INDEX IF NOT EXISTS idx_custom_emojis_added_at ON custom_emojis(added_at DESC, sort_order ASC)`,
        ],
    },
    {
        version: 9,
        name: 'add_message_forward_metadata',
        statements: [
            `ALTER TABLE messages ADD COLUMN forward_origin_json TEXT`,
            `ALTER TABLE messages ADD COLUMN forward_source_msg_id TEXT`,
            `ALTER TABLE messages ADD COLUMN forward_batch_id TEXT`,
        ],
    },
    {
        version: 10,
        name: 'add_message_mentions',
        statements: [
            `ALTER TABLE messages ADD COLUMN mentions_json TEXT`,
        ],
    },
    {
        version: 11,
        name: 'add_conversation_auto_delete_metadata',
        statements: [
            `ALTER TABLE conversations ADD COLUMN auto_delete_seconds INTEGER NOT NULL DEFAULT 0`,
            `ALTER TABLE conversations ADD COLUMN auto_delete_updated_by TEXT`,
            `ALTER TABLE conversations ADD COLUMN auto_delete_updated_at INTEGER NOT NULL DEFAULT 0`,
        ],
    },
    {
        version: 12,
        name: 'add_conversation_clear_boundary',
        statements: [
            `ALTER TABLE conversations ADD COLUMN clear_before_seq TEXT NOT NULL DEFAULT '0'`,
            `ALTER TABLE conversations ADD COLUMN list_hidden INTEGER NOT NULL DEFAULT 0`,
            `ALTER TABLE messages ADD COLUMN seq_text TEXT`,
            `UPDATE messages SET seq_text = CAST(seq AS TEXT) WHERE seq IS NOT NULL`,
            `CREATE INDEX IF NOT EXISTS idx_conversations_list_hidden_updated ON conversations(list_hidden, is_pinned DESC, pinned_at DESC, updated_at DESC)`,
            `CREATE INDEX IF NOT EXISTS idx_messages_conversation_seq_text ON messages(conversation_id, length(seq_text) DESC, seq_text DESC)`,
            `CREATE TRIGGER IF NOT EXISTS trg_messages_ignore_cleared_insert
       BEFORE INSERT ON messages
       WHEN NEW.seq_text IS NOT NULL AND EXISTS (
         SELECT 1 FROM conversations
         WHERE conversation_id = NEW.conversation_id
           AND clear_before_seq <> '0'
           AND (
             length(NEW.seq_text) < length(clear_before_seq)
             OR (length(NEW.seq_text) = length(clear_before_seq) AND NEW.seq_text <= clear_before_seq)
           )
       )
       BEGIN
         SELECT RAISE(IGNORE);
       END`,
        ],
    },
    {
        version: 13,
        name: 'add_conversation_draft_entities',
        statements: [
            `ALTER TABLE conversations ADD COLUMN draft_entities_json TEXT`,
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