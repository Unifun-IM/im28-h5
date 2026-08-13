import { statement } from '../../db/database.js';
import { Repository } from '../../db/repository.js';
import { parseJsonColumn, readOptionalString, readRequiredNumber, readRequiredString } from '../../db/row.js';
import { normalizePresetEmojiEntities } from '../message/preset-emoji.js';
export class ConversationRepository extends Repository {
    constructor(database) {
        super(database);
    }
    async upsert(conversation) {
        await this.execute(createConversationUpsertStatement(conversation));
    }
    async getByID(conversationID) {
        const rows = await this.query(statement('SELECT * FROM conversations WHERE conversation_id = ?', [conversationID]));
        return rows[0] ? mapStoredConversationRow(rows[0]) : null;
    }
    async list(options = {}) {
        const limit = options.limit ?? 50;
        const offset = options.offset ?? 0;
        if (options.archived !== undefined) {
            const rows = await this.query(statement('SELECT * FROM conversations WHERE is_archived = ? AND list_hidden = 0 ORDER BY is_pinned DESC, pinned_at DESC, updated_at DESC LIMIT ? OFFSET ?', [
                Number(options.archived),
                limit,
                offset,
            ]));
            return rows.map(mapStoredConversationRow);
        }
        const rows = await this.query(statement('SELECT * FROM conversations WHERE list_hidden = 0 ORDER BY is_pinned DESC, pinned_at DESC, updated_at DESC LIMIT ? OFFSET ?', [limit, offset]));
        return rows.map(mapStoredConversationRow);
    }
    async replaceAll(conversations) {
        await this.transaction(async (tx) => {
            /** existingRows 在删除前冻结本地草稿，远端完整快照不得清除未发送内容。 */
            const existingRows = await tx.query(statement('SELECT * FROM conversations'));
            /** existingByID 只为仍存在于新快照的会话恢复本地草稿。 */
            const existingByID = new Map(existingRows.map(row => {
                /** existing 是当前账号旧会话的完整本地快照。 */
                const existing = mapStoredConversationRow(row);
                return [existing.conversationID, existing];
            }));
            await tx.execute(statement('DELETE FROM conversations'));
            await Promise.all(conversations.map(conversation => tx.execute(createConversationUpsertStatement(mergeStoredConversationDraft(conversation, existingByID.get(conversation.conversationID))))));
        });
    }
    /** 只替换普通会话集合，保留独立归档端点维护的归档快照。 */
    async replaceUnarchived(conversations) {
        await this.transaction(async (tx) => {
            /** existingRows 在替换前保留普通会话的账号内草稿。 */
            const existingRows = await tx.query(statement('SELECT * FROM conversations WHERE is_archived = 0'));
            /** existingByID 只为服务端仍返回的会话恢复草稿。 */
            const existingByID = new Map(existingRows.map(row => {
                /** existing 是删除前的规范会话快照。 */
                const existing = mapStoredConversationRow(row);
                return [existing.conversationID, existing];
            }));
            await tx.execute(statement('DELETE FROM conversations WHERE is_archived = 0'));
            await Promise.all(conversations.map(conversation => tx.execute(buildConversationInsertStatement({
                ...mergeStoredConversationDraft(conversation, existingByID.get(conversation.conversationID)),
                isArchived: false,
            }))));
        });
    }
    /** 用服务端完整归档快照收敛索引，同时保留已取消归档会话的其他本地字段。 */
    async reconcileArchivedSnapshot(conversations) {
        /** archivedIDs 是本次服务端完整快照中的稳定会话集合。 */
        const archivedIDs = new Set(conversations.map(item => item.conversationID));
        await this.transaction(async (tx) => {
            /** currentArchivedRows 与写入处于同一事务，避免并发动作造成快照误判。 */
            const currentArchivedRows = await tx.query(statement('SELECT conversation_id FROM conversations WHERE is_archived = 1'));
            await Promise.all(currentArchivedRows
                .map(row => readRequiredString(row, 'conversation_id'))
                .filter(conversationID => !archivedIDs.has(conversationID))
                .map(conversationID => tx.execute(statement('UPDATE conversations SET is_archived = 0, list_hidden = 0 WHERE conversation_id = ?', [conversationID]))));
            await Promise.all(conversations.map(conversation => tx.execute(buildConversationInsertStatement({
                ...conversation,
                isArchived: true,
                listHidden: false,
            }))));
        });
    }
    async updateLatestMessage(conversationID, latestMessageID, updatedAt) {
        await this.execute(statement('UPDATE conversations SET latest_message_id = ?, list_hidden = 0, updated_at = ? WHERE conversation_id = ?', [
            latestMessageID,
            updatedAt,
            conversationID,
        ]));
    }
    async incrementUnread(conversationID, count = 1) {
        await this.execute(statement('UPDATE conversations SET unread_count = unread_count + ? WHERE conversation_id = ?', [count, conversationID]));
    }
    async updatePinned(conversationID, isPinned, pinnedAt = Date.now()) {
        await this.execute(statement('UPDATE conversations SET is_pinned = ?, pinned_at = ? WHERE conversation_id = ?', [
            Number(isPinned),
            isPinned ? pinnedAt : 0,
            conversationID,
        ]));
    }
    async updateMuted(conversationID, isMuted) {
        await this.execute(statement('UPDATE conversations SET is_muted = ? WHERE conversation_id = ?', [Number(isMuted), conversationID]));
    }
    /** 更新服务端确认的自动删除设置，不修改已有消息记录。 */
    async updateAutoDelete(conversationID, autoDeleteSeconds, updatedBy, updatedAt = 0) {
        await this.execute(statement('UPDATE conversations SET auto_delete_seconds = ?, auto_delete_updated_by = ?, auto_delete_updated_at = ? WHERE conversation_id = ?', [autoDeleteSeconds, updatedBy ?? null, updatedAt, conversationID]));
    }
    async updateDraft(conversationID, draft) {
        await this.execute(statement('UPDATE conversations SET draft = ? WHERE conversation_id = ?', [draft || null, conversationID]));
    }
    async deleteByID(conversationID) {
        await this.execute(statement('DELETE FROM conversations WHERE conversation_id = ?', [conversationID]));
    }
}
/** 将 conversations 表行恢复为平台中立会话。 */
export function mapStoredConversationRow(row) {
    const name = readOptionalString(row, 'name');
    const faceURL = readOptionalString(row, 'face_url');
    const latestMessageID = readOptionalString(row, 'latest_message_id');
    const draft = readOptionalString(row, 'draft');
    /** draftEntities 从专用列恢复，避免远端 raw payload 覆盖 App 草稿身份。 */
    const draftEntities = parseJsonColumn(row, 'draft_entities_json', []);
    /** autoDeleteUpdatedBy 保留服务端最近操作者，可为空。 */
    const autoDeleteUpdatedBy = readOptionalString(row, 'auto_delete_updated_by');
    /** clearBeforeSeq 是当前账号已确认的单调清空边界。 */
    const clearBeforeSeq = readRequiredString(row, 'clear_before_seq');
    const raw = parseJsonColumn(row, 'raw_json', {});
    /** rawPayload 保留 Gateway 与其他 App 扩展字段。 */
    const rawPayload = readConversationPayload(raw);
    return {
        ...raw,
        conversationID: readRequiredString(row, 'conversation_id'),
        type: readRequiredString(row, 'type'),
        targetID: readRequiredString(row, 'target_id'),
        ...(name !== undefined ? { name } : {}),
        ...(faceURL !== undefined ? { faceURL } : {}),
        ...(latestMessageID !== undefined ? { latestMessageID } : {}),
        unreadCount: readRequiredNumber(row, 'unread_count'),
        isArchived: readRequiredNumber(row, 'is_archived') === 1,
        isPinned: readRequiredNumber(row, 'is_pinned') === 1,
        pinnedAt: readRequiredNumber(row, 'pinned_at'),
        isMuted: readRequiredNumber(row, 'is_muted') === 1,
        autoDeleteSeconds: readRequiredNumber(row, 'auto_delete_seconds'),
        ...(autoDeleteUpdatedBy !== undefined ? { autoDeleteUpdatedBy } : {}),
        autoDeleteUpdatedAt: readRequiredNumber(row, 'auto_delete_updated_at'),
        clearBeforeSeq,
        listHidden: readRequiredNumber(row, 'list_hidden') === 1,
        draft: draft ?? '',
        payload: {
            ...rawPayload,
            draftPresetEmojiEntities: normalizePresetEmojiEntities(draftEntities, draft ?? ''),
        },
        updatedAt: readRequiredNumber(row, 'updated_at'),
    };
}
function readConversationArchivedFlag(conversation) {
    // 原始 payload 保留 Gateway/app 两套归档字段，写库时统一为索引列。
    const payload = conversation.payload && typeof conversation.payload === 'object'
        ? conversation.payload
        : {};
    return Number(Boolean(conversation.isArchived ??
        payload.archived));
}
/** 构造事务内完整会话写入语句，避免归档同步绕过 Repository 字段契约。 */
export function createConversationUpsertStatement(conversation) {
    return statement(`INSERT OR REPLACE INTO conversations (
      conversation_id,
      type,
      target_id,
      name,
      face_url,
      latest_message_id,
      unread_count,
      updated_at,
      is_archived,
      is_pinned,
      pinned_at,
      is_muted,
      auto_delete_seconds,
      auto_delete_updated_by,
      auto_delete_updated_at,
      clear_before_seq,
      list_hidden,
      draft,
      draft_entities_json,
      raw_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, (SELECT is_pinned FROM conversations WHERE conversation_id = ?), 0), COALESCE(?, (SELECT pinned_at FROM conversations WHERE conversation_id = ?), 0), COALESCE(?, (SELECT is_muted FROM conversations WHERE conversation_id = ?), 0), COALESCE(?, (SELECT auto_delete_seconds FROM conversations WHERE conversation_id = ?), 0), COALESCE(?, (SELECT auto_delete_updated_by FROM conversations WHERE conversation_id = ?), NULL), COALESCE(?, (SELECT auto_delete_updated_at FROM conversations WHERE conversation_id = ?), 0), COALESCE(?, (SELECT clear_before_seq FROM conversations WHERE conversation_id = ?), '0'), COALESCE(?, (SELECT list_hidden FROM conversations WHERE conversation_id = ?), 0), COALESCE(?, (SELECT draft FROM conversations WHERE conversation_id = ?), NULL), COALESCE(?, (SELECT draft_entities_json FROM conversations WHERE conversation_id = ?), NULL), ?)`, [
        conversation.conversationID,
        conversation.type,
        conversation.targetID,
        conversation.name ?? null,
        conversation.faceURL ?? null,
        conversation.latestMessageID ?? null,
        conversation.unreadCount,
        conversation.updatedAt,
        readConversationArchivedFlag(conversation),
        conversation.isPinned === undefined ? null : Number(conversation.isPinned),
        conversation.conversationID,
        conversation.pinnedAt ?? null,
        conversation.conversationID,
        conversation.isMuted === undefined ? null : Number(conversation.isMuted),
        conversation.conversationID,
        conversation.autoDeleteSeconds ?? null,
        conversation.conversationID,
        conversation.autoDeleteUpdatedBy ?? null,
        conversation.conversationID,
        conversation.autoDeleteUpdatedAt ?? null,
        conversation.conversationID,
        conversation.clearBeforeSeq ?? null,
        conversation.conversationID,
        conversation.listHidden === undefined ? null : Number(conversation.listHidden),
        conversation.conversationID,
        conversation.draft ?? null,
        conversation.conversationID,
        readConversationDraftEntitiesJSON(conversation),
        conversation.conversationID,
        JSON.stringify(conversation),
    ]);
}
/** 将远端会话字段与删除前的本地草稿合并。 */
function mergeStoredConversationDraft(conversation, existing) {
    if (!existing)
        return conversation;
    /** incomingPayload 只保留新快照自己的扩展字段。 */
    const incomingPayload = readConversationPayload(conversation);
    /** existingPayload 提供专用列映射回来的草稿 entities。 */
    const existingPayload = readConversationPayload(existing);
    /** incomingHasEntities 允许调用方显式以空数组清除旧实体。 */
    const incomingHasEntities = Object.prototype.hasOwnProperty.call(incomingPayload, 'draftPresetEmojiEntities');
    return {
        ...conversation,
        draft: conversation.draft ?? existing.draft ?? '',
        payload: {
            ...incomingPayload,
            ...(!incomingHasEntities && existingPayload.draftPresetEmojiEntities !== undefined
                ? { draftPresetEmojiEntities: existingPayload.draftPresetEmojiEntities }
                : {}),
        },
    };
}
/** 从会话 payload 提取显式草稿 entities 列值，缺失时交给 SQL 保留旧值。 */
function readConversationDraftEntitiesJSON(conversation) {
    /** payload 是专用列的兼容输入来源。 */
    const payload = readConversationPayload(conversation);
    if (!Object.prototype.hasOwnProperty.call(payload, 'draftPresetEmojiEntities')) {
        return null;
    }
    return JSON.stringify(Array.isArray(payload.draftPresetEmojiEntities)
        ? payload.draftPresetEmojiEntities
        : []);
}
/** 将未知会话 payload 收窄为普通扩展对象。 */
function readConversationPayload(conversation) {
    /** payload 只接受非数组对象。 */
    const payload = conversation.payload;
    return payload && typeof payload === 'object' && !Array.isArray(payload)
        ? payload
        : {};
}
// 旧私有名称继续服务同文件快照替换，实际 SQL owner 已统一为公开构造器。
const buildConversationInsertStatement = createConversationUpsertStatement;
//# sourceMappingURL=repository.js.map