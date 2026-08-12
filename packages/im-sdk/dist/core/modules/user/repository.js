import { statement } from '../../db/database.js';
import { Repository } from '../../db/repository.js';
import { parseJsonColumn, readOptionalString, readRequiredNumber, readRequiredString } from '../../db/row.js';
export class UserRepository extends Repository {
    /** 绑定当前账号数据库。 */
    constructor(database) {
        super(database);
    }
    /** 合并写入单个用户，缺失字段不得清空已有完整资料。 */
    async upsert(user) {
        /** existing 是其他能力此前保存的完整用户快照。 */
        const existing = await this.getByID(user.userID);
        /** mergedUser 只用明确传入字段覆盖旧值。 */
        const mergedUser = mergeUserSnapshots(existing, user);
        await this.execute(createUserUpsertStatement(mergedUser));
    }
    /** 原子合并写入一批用户，避免群成员资料出现半批更新。 */
    async upsertMany(users) {
        /** normalizedUsers 按身份去重，后出现的增量覆盖本批早期值。 */
        const normalizedUsers = [...new Map(users
                .filter(user => user.userID.trim())
                .map(user => [user.userID.trim(), { ...user, userID: user.userID.trim() }])).values()];
        if (!normalizedUsers.length)
            return;
        /** existingUsers 一次读取本批完整旧快照。 */
        const existingUsers = await this.getByIDs(normalizedUsers.map(user => user.userID));
        /** existingByID 支持常数时间合并。 */
        const existingByID = new Map(existingUsers.map(user => [user.userID, user]));
        /** mergedUsers 在事务前完成纯数据合并。 */
        const mergedUsers = normalizedUsers.map(user => mergeUserSnapshots(existingByID.get(user.userID) ?? null, user));
        await this.transaction(async (transaction) => {
            await Promise.all(mergedUsers.map(user => transaction.execute(createUserUpsertStatement(user))));
        });
    }
    /** 按稳定身份读取单个用户。 */
    async getByID(userID) {
        const rows = await this.query(statement('SELECT * FROM users WHERE user_id = ?', [userID]));
        return rows[0] ? mapUserRow(rows[0]) : null;
    }
    /** 一次读取多个稳定身份，供展示投影避免逐成员查询。 */
    async getByIDs(userIDs) {
        /** normalizedUserIDs 去重并过滤空身份。 */
        const normalizedUserIDs = [...new Set(userIDs.map(userID => userID.trim()).filter(Boolean))];
        if (!normalizedUserIDs.length)
            return [];
        /** placeholders 只由受控身份数量生成，不拼接用户输入。 */
        const placeholders = normalizedUserIDs.map(() => '?').join(', ');
        /** rows 保持数据库返回顺序，调用方按 userID 建索引。 */
        const rows = await this.query(statement(`SELECT * FROM users WHERE user_id IN (${placeholders})`, normalizedUserIDs));
        return rows.map(mapUserRow);
    }
    /** 删除指定用户快照。 */
    async deleteByUserID(userID) {
        await this.execute(statement('DELETE FROM users WHERE user_id = ?', [userID]));
    }
}
/** 将数据库行映射为用户实体。 */
function mapUserRow(row) {
    const nickname = readOptionalString(row, 'nickname');
    const faceURL = readOptionalString(row, 'face_url');
    return {
        userID: readRequiredString(row, 'user_id'),
        ...(nickname !== undefined ? { nickname } : {}),
        ...(faceURL !== undefined ? { faceURL } : {}),
        payload: {
            ...parseJsonColumn(row, 'raw_json', {}),
            cachedAt: readRequiredNumber(row, 'updated_at'),
        },
    };
}
/** 生成稳定用户写入语句。 */
function createUserUpsertStatement(user) {
    return statement(`INSERT OR REPLACE INTO users (
      user_id,
      nickname,
      face_url,
      updated_at,
      raw_json
    ) VALUES (?, ?, ?, ?, ?)`, [
        user.userID,
        user.nickname ?? null,
        user.faceURL ?? null,
        Date.now(),
        JSON.stringify(user.payload ?? user),
    ]);
}
/** 合并新旧用户字段，undefined 表示未提供而不是清空。 */
function mergeUserSnapshots(existing, incoming) {
    /** payload 合并公开资料增量，同时剔除读取时附加的缓存时间。 */
    const payload = mergeUserPayload(existing?.payload, incoming.payload);
    /** nickname 只在新旧任一快照明确提供时写入。 */
    const nickname = incoming.nickname ?? existing?.nickname;
    /** faceURL 只在新旧任一快照明确提供时写入。 */
    const faceURL = incoming.faceURL ?? existing?.faceURL;
    return {
        userID: incoming.userID,
        ...(nickname !== undefined ? { nickname } : {}),
        ...(faceURL !== undefined ? { faceURL } : {}),
        ...(payload !== undefined ? { payload } : {}),
    };
}
/** 合并对象型 payload；非对象新值仍按调用方显式输入覆盖。 */
function mergeUserPayload(existing, incoming) {
    /** existingRecord 是剔除 Repository 读取元数据后的旧 payload。 */
    const existingRecord = toPayloadRecord(existing);
    /** incomingRecord 是本次明确提供的资料增量。 */
    const incomingRecord = toPayloadRecord(incoming);
    if (incomingRecord)
        return { ...(existingRecord ?? {}), ...incomingRecord };
    if (incoming !== undefined)
        return incoming;
    return existingRecord ?? existing;
}
/** 将普通对象转为可持久化 payload，并移除缓存读取元数据。 */
function toPayloadRecord(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return null;
    /** cachedAt 仅描述本次数据库读取时间，不能回写 raw_json。 */
    const { cachedAt: _cachedAt, ...record } = value;
    return record;
}
//# sourceMappingURL=repository.js.map