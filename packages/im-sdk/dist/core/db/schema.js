export const SDK_SCHEMA_VERSION = 10;
export const SDK_SCHEMA_V1_STATEMENTS = [
    `CREATE TABLE IF NOT EXISTS sdk_meta (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
    `CREATE TABLE IF NOT EXISTS sessions (
    user_id TEXT PRIMARY KEY NOT NULL,
    logged_in INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL,
    raw_json TEXT
  )`,
    `CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY NOT NULL,
    nickname TEXT,
    face_url TEXT,
    updated_at INTEGER NOT NULL DEFAULT 0,
    raw_json TEXT
  )`,
    `CREATE TABLE IF NOT EXISTS friendships (
    user_id TEXT PRIMARY KEY NOT NULL,
    is_friend INTEGER NOT NULL DEFAULT 1,
    updated_at INTEGER NOT NULL DEFAULT 0,
    raw_json TEXT
  )`,
    `CREATE TABLE IF NOT EXISTS groups (
    group_id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    face_url TEXT,
    member_count INTEGER,
    updated_at INTEGER NOT NULL DEFAULT 0,
    raw_json TEXT
  )`,
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
    `CREATE TABLE IF NOT EXISTS conversations (
    conversation_id TEXT PRIMARY KEY NOT NULL,
    type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    name TEXT,
    face_url TEXT,
    latest_message_id TEXT,
    unread_count INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL,
    is_pinned INTEGER NOT NULL DEFAULT 0,
    is_muted INTEGER NOT NULL DEFAULT 0,
    draft TEXT,
    raw_json TEXT
  )`,
    `CREATE TABLE IF NOT EXISTS messages (
    client_msg_id TEXT PRIMARY KEY NOT NULL,
    server_msg_id TEXT,
    conversation_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    direction TEXT NOT NULL,
    content_type INTEGER NOT NULL,
    status TEXT NOT NULL,
    send_time INTEGER NOT NULL,
    seq INTEGER,
    payload_json TEXT NOT NULL,
    local_extra_json TEXT,
    deleted INTEGER NOT NULL DEFAULT 0,
    revoked INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL
  )`,
    `CREATE TABLE IF NOT EXISTS attachments (
    attachment_id TEXT PRIMARY KEY NOT NULL,
    message_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    local_path TEXT,
    remote_url TEXT,
    mime_type TEXT,
    size INTEGER,
    updated_at INTEGER NOT NULL
  )`,
    `CREATE TABLE IF NOT EXISTS pending_tasks (
    task_id TEXT PRIMARY KEY NOT NULL,
    kind TEXT NOT NULL,
    status TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    retry_count INTEGER NOT NULL DEFAULT 0,
    next_retry_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
    `CREATE TABLE IF NOT EXISTS sync_cursors (
    cursor_key TEXT PRIMARY KEY NOT NULL,
    cursor_value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
    `CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id, updated_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_messages_conversation_time ON messages(conversation_id, send_time DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_messages_conversation_seq ON messages(conversation_id, seq DESC)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_server_msg_id ON messages(server_msg_id) WHERE server_msg_id IS NOT NULL`,
    `CREATE INDEX IF NOT EXISTS idx_attachments_message_id ON attachments(message_id)`,
    `CREATE INDEX IF NOT EXISTS idx_pending_tasks_status_next_retry ON pending_tasks(status, next_retry_at)`,
];
//# sourceMappingURL=schema.js.map