/** 确保 Web app-owned 通话缓存表和索引存在。 */
export async function ensureCallSchema(database) {
    await database.execute({
        sql: `CREATE TABLE IF NOT EXISTS call_records (
      call_id TEXT PRIMARY KEY NOT NULL, client_call_id TEXT, conversation_id TEXT,
      caller_id TEXT, direction TEXT, user_id TEXT, nickname TEXT, avatar_url TEXT,
      call_type TEXT, status TEXT, answer_status TEXT, started_at TEXT,
      started_at_ms INTEGER NOT NULL DEFAULT 0, answered_at TEXT, ended_at TEXT,
      raw_json TEXT NOT NULL, updated_at INTEGER NOT NULL
    )`,
    });
    await database.execute({
        sql: 'CREATE INDEX IF NOT EXISTS idx_call_records_started ON call_records(started_at_ms DESC, call_id DESC)',
    });
    await database.execute({
        sql: 'CREATE INDEX IF NOT EXISTS idx_call_records_answer_status ON call_records(answer_status, started_at_ms DESC, call_id DESC)',
    });
}
/** 用完整远端 snapshot 原子替换本地通话记录。 */
export async function replaceCachedCalls(database, calls) {
    await database.transaction(async (transaction) => {
        await transaction.execute({ sql: 'DELETE FROM call_records' });
        // updatedAt 为本次完整 snapshot 使用同一写入时间。
        const updatedAt = Date.now();
        for (const call of calls)
            await upsertCachedCall(transaction, call, updatedAt);
    });
}
/** 删除服务端已确认隐藏的本地通话记录。 */
export async function removeCachedCalls(database, callIDs) {
    // placeholders 只由已归一化 ID 数量生成，值始终走参数绑定。
    const placeholders = callIDs.map(() => '?').join(', ');
    await database.execute({
        sql: `DELETE FROM call_records WHERE call_id IN (${placeholders})`,
        params: callIDs,
    });
}
/** 查询缓存列表并复用同一筛选条件统计总数。 */
export async function queryCachedCalls(database, options) {
    // query 为 count 和 list 提供相同 where 与绑定参数。
    const query = buildCallQuery(options);
    // limit 与 offset 防止页面发起无界缓存读取。
    const limit = clampInteger(options.limit, 30, 1, 100);
    // offset 只允许非负整数。
    const offset = clampInteger(options.offset, 0, 0, Number.MAX_SAFE_INTEGER);
    // totalRows 读取 SQLite count 的 number/string 兼容值。
    const totalRows = await database.query({
        sql: `SELECT COUNT(1) AS total FROM call_records ${query.whereSql}`,
        params: query.params,
    });
    // rows 保持 RN started_at_ms + call_id 倒序。
    const rows = await database.query({
        sql: `SELECT * FROM call_records ${query.whereSql} ORDER BY started_at_ms DESC, call_id DESC LIMIT ? OFFSET ?`,
        params: [...query.params, limit, offset],
    });
    // total 转换异常时以零处理，不制造虚假记录。
    const total = Number(totalRows[0]?.total ?? 0);
    return { list: rows.map(mapCallRow), total: Number.isFinite(total) ? total : 0 };
}
/** 写入单条具备稳定服务端 ID 的通话记录。 */
async function upsertCachedCall(executor, call, updatedAt) {
    // callID 是本地 cache 唯一主键。
    const callID = call.call_id?.trim();
    if (!callID)
        return;
    // startedAtMs 为列表倒序提供稳定数字索引。
    const startedAtMs = normalizeTimestamp(call.started_at) || updatedAt;
    await executor.execute({
        sql: `INSERT OR REPLACE INTO call_records (
      call_id, client_call_id, conversation_id, caller_id, direction, user_id,
      nickname, avatar_url, call_type, status, answer_status, started_at,
      started_at_ms, answered_at, ended_at, raw_json, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        params: [callID, call.client_call_id ?? null, call.conversation_id ?? null,
            call.caller_id ?? null, call.direction ?? null, call.user_id ?? null,
            call.nickname ?? null, call.avatar_url ?? null, call.call_type ?? null,
            call.status ?? null, normalizeAnswerStatus(call.answer_status) || null,
            call.started_at ?? null, startedAtMs, call.answered_at ?? null,
            call.ended_at ?? null, JSON.stringify(call), updatedAt],
    });
}
/** 构造状态与昵称/用户 ID 搜索条件。 */
function buildCallQuery(options) {
    // where 只保存固定 SQL 片段，不插入用户文本。
    const where = [];
    // params 与 where 顺序一致。
    const params = [];
    if (options.answerStatus === 'missed' || options.answerStatus === 'answered') {
        where.push('answer_status = ?');
        params.push(options.answerStatus);
    }
    if (options.keyword?.trim()) {
        // pattern 转义 LIKE 控制字符后使用参数绑定。
        const pattern = `%${options.keyword.trim().toLowerCase().replace(/[\\%_]/g, '\\$&')}%`;
        where.push("(LOWER(COALESCE(nickname, '')) LIKE ? ESCAPE '\\' OR LOWER(COALESCE(user_id, '')) LIKE ? ESCAPE '\\')");
        params.push(pattern, pattern);
    }
    return { whereSql: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
}
/** 将 SQLite 行还原为 Gateway 通话 DTO。 */
function mapCallRow(row) {
    // optionalFields 只在 SQLite 真实有值时写入 DTO。
    const optionalFields = {
        ...(readString(row.client_call_id) ? { client_call_id: readString(row.client_call_id) } : {}),
        ...(readString(row.conversation_id) ? { conversation_id: readString(row.conversation_id) } : {}),
        ...(readString(row.caller_id) ? { caller_id: readString(row.caller_id) } : {}),
        ...(readString(row.direction) ? { direction: readString(row.direction) } : {}),
        ...(readString(row.user_id) ? { user_id: readString(row.user_id) } : {}),
        ...(readString(row.nickname) ? { nickname: readString(row.nickname) } : {}),
        ...(readString(row.avatar_url) ? { avatar_url: readString(row.avatar_url) } : {}),
        ...(readString(row.call_type) ? { call_type: readString(row.call_type) } : {}),
        ...(readString(row.status) ? { status: readString(row.status) } : {}),
        ...(normalizeAnswerStatus(row.answer_status) ? { answer_status: normalizeAnswerStatus(row.answer_status) } : {}),
        ...(readString(row.started_at) ? { started_at: readString(row.started_at) } : {}),
        ...(readString(row.answered_at) ? { answered_at: readString(row.answered_at) } : {}),
        ...(readString(row.ended_at) ? { ended_at: readString(row.ended_at) } : {}),
    };
    return { call_id: readString(row.call_id), ...optionalFields };
}
/** 归一化服务端接听分类值。 */
function normalizeAnswerStatus(value) {
    // text 兼容 SQLite 与 Gateway 输入。
    const text = String(value ?? '').trim().toLowerCase();
    return text === 'answered' || text === 'missed' ? text : '';
}
/** 将可解析时间转换为毫秒索引。 */
function normalizeTimestamp(value) {
    // timestamp 只接受有效正数。
    const timestamp = value ? Date.parse(value) : 0;
    return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : 0;
}
/** 将 SQLite 值收敛为字符串。 */
function readString(value) {
    return typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '';
}
/** 将分页数字约束在稳定整数范围。 */
function clampInteger(value, fallback, min, max) {
    return Number.isFinite(value) ? Math.min(max, Math.max(min, Math.trunc(value ?? fallback))) : fallback;
}
//# sourceMappingURL=call-record-store.js.map