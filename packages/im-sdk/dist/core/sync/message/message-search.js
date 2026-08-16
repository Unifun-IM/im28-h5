import { MessageRepository, } from '@im28/im-sdk/core';
import { createWebIMSyncError, requireWebIMSyncContext, } from '../sync-context.js';
/** 单次 SQLite 候选读取数量，兼顾分页完整性与 Worker 往返成本。 */
const MESSAGE_SEARCH_BATCH_SIZE = 100;
/** 单次公开搜索最多返回的消息数，覆盖 RN 单月最多十二页历史索引。 */
const MESSAGE_SEARCH_MAX_LIMIT = 720;
/** 候选分页安全上限，防止异常缓存导致无界读取。 */
const MESSAGE_SEARCH_MAX_PAGES = 100;
/** 创建绑定当前 runtime 账号数据库的中性消息搜索 facade。 */
export function createIMMessageSearchSync(dependencies) {
    return {
        search: options => {
            // context 阻止匿名调用或跨账号读取缓存。
            const context = requireWebIMSyncContext(dependencies, 'Message search');
            return searchCachedIMMessages(context.database, options);
        },
    };
}
/** 按 RN 可见正文语义搜索当前账号 SQLite 消息缓存。 */
async function searchCachedIMMessages(database, options) {
    /** keyword 是正文匹配和空搜索校验共用的规范化关键词。 */
    const keyword = options.keyword?.trim() ?? '';
    /** contentTypes 去重后决定无关键词的媒体/文件分类搜索是否合法。 */
    const contentTypes = Array.from(new Set(options.contentTypes ?? []));
    /** hasTimeRange 允许日期索引在无关键词、无类型时读取受限时间窗口。 */
    const hasTimeRange = Number.isFinite(options.afterSendTime)
        || Number.isFinite(options.beforeSendTime);
    if (!keyword && !contentTypes.length && !hasTimeRange) {
        throw createWebIMSyncError('MESSAGE_SEARCH_QUERY_REQUIRED', 'Message search requires a keyword, content type, or time range.');
    }
    /** limit 限制页面一次读取的本地结果数量。 */
    const requestedLimit = Number.isFinite(options.limit)
        ? Math.trunc(options.limit)
        : 100;
    /** limit 拒绝 NaN/Infinity 扩散到 SQLite，并限制单次公开结果。 */
    const limit = Math.min(MESSAGE_SEARCH_MAX_LIMIT, Math.max(1, requestedLimit));
    /** requestedOffset 将非法分页值收敛到首页。 */
    const requestedOffset = Number.isFinite(options.offset)
        ? Math.trunc(options.offset)
        : 0;
    /** resultOffset 基于最终可见结果，而不是宽泛 JSON 候选计算。 */
    const resultOffset = Math.max(0, requestedOffset);
    /** requiredCount 是截取当前页前必须收集的过滤后结果数量。 */
    const requiredCount = resultOffset + limit;
    /** repository 是参数绑定、删除/撤回过滤和 newest-first 排序的唯一 owner。 */
    const repository = new MessageRepository(database);
    /** matches 仅保存 RN 可见正文或无关键词类型搜索的有效候选。 */
    const matches = [];
    for (let page = 0; page < MESSAGE_SEARCH_MAX_PAGES; page += 1) {
        /** candidates 是当前 SQLite 候选页，宽泛 LIKE 结果会再按正文收窄。 */
        const candidates = await repository.search({
            ...options,
            ...(keyword ? { keyword } : {}),
            contentTypes,
            limit: MESSAGE_SEARCH_BATCH_SIZE,
            offset: page * MESSAGE_SEARCH_BATCH_SIZE,
        });
        for (const message of candidates) {
            if (!keyword || matchesVisibleMessageText(message, keyword)) {
                matches.push(message);
            }
        }
        if (matches.length >= requiredCount || candidates.length < MESSAGE_SEARCH_BATCH_SIZE) {
            return matches.slice(resultOffset, requiredCount);
        }
    }
    throw createWebIMSyncError('MESSAGE_SEARCH_PAGE_LIMIT_EXCEEDED', 'Message search exceeded the local pagination safety limit.');
}
/** 判断关键词是否命中 RN 搜索结果允许展示的消息正文。 */
function matchesVisibleMessageText(message, keyword) {
    /** searchableText 聚合文本、mention、引用、文件和名片可见字段。 */
    const searchableText = readSearchablePayloadText(message.payload);
    return searchableText.toLocaleLowerCase().includes(keyword.toLocaleLowerCase());
}
/** 从 Gateway 消息 body 提取可被聊天记录搜索的用户可见字段。 */
function readSearchablePayloadText(payload) {
    /** body 只接受普通对象，畸形缓存不会伪造命中。 */
    const body = asRecord(payload);
    /** text 对应普通文本消息。 */
    const text = asRecord(body.text);
    /** mention 对应 type 106 群提及正文。 */
    const mention = asRecord(body.mention);
    /** quote 对应 type 114 回复正文。 */
    const quote = asRecord(body.quote);
    /** file 对应普通文件名称。 */
    const file = asRecord(body.file);
    /** card 对应用户或群名片可见字段。 */
    const card = asRecord(body.card);
    /** user 对应个人名片快照。 */
    const user = asRecord(card.user);
    /** group 对应群名片快照。 */
    const group = asRecord(card.group);
    /** markdown 保留协议兼容文本字段。 */
    const markdown = asRecord(body.markdown);
    return [
        readString(text.text),
        readString(text.content),
        readString(mention.text),
        readString(quote.reply_text),
        readString(file.name),
        readString(user.nickname),
        readString(user.user_id),
        readString(group.title),
        readString(group.group_id),
        readString(markdown.text),
    ].filter(Boolean).join('\n');
}
/** 将未知 JSON 值收窄为只读普通对象。 */
function asRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? value
        : {};
}
/** 只读取字符串字段，避免对象隐式序列化进入搜索正文。 */
function readString(value) {
    return typeof value === 'string' ? value : '';
}
//# sourceMappingURL=message-search.js.map