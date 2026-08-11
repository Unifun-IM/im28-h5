/** 命名空间分隔符与既有 Gateway preset_id 契约一致。 */
const PRESET_EMOJI_ID_SEPARATOR = '/';
/** 将未知实体集合规范为合法、非重叠且未越界的 UTF-16 区间。 */
export function normalizePresetEmojiEntities(value, text) {
    if (!Array.isArray(value))
        return [];
    /** 候选实体先完成字段与边界校验。 */
    const entities = value
        .map(normalizePresetEmojiEntity)
        .filter((entity) => entity !== null)
        .filter(entity => entity.offset + entity.length <= text.length)
        .sort((left, right) => left.offset - right.offset);
    /** 上一实体右边界用于剔除重叠输入。 */
    let lastEnd = 0;
    return entities.filter(entity => {
        if (entity.offset < lastEnd)
            return false;
        lastEnd = entity.offset + entity.length;
        return true;
    });
}
/** 仅保留身份可解析且正文 fallback 完全匹配的可渲染实体。 */
export function resolvePresetEmojiEntities(text, value, resolve) {
    return normalizePresetEmojiEntities(value, text).filter(entity => {
        /** 描述由平台无关注册表按双重身份读取。 */
        const descriptor = resolve(entity.packID, entity.presetID);
        return Boolean(descriptor &&
            text.slice(entity.offset, entity.offset + entity.length) === descriptor.unicode);
    });
}
/** 将 App 双层身份编码成 Gateway preset_id。 */
export function encodePresetEmojiID(packID, presetID) {
    return `${packID.trim()}${PRESET_EMOJI_ID_SEPARATOR}${presetID.trim()}`;
}
/** 将 Gateway preset_id 解码为 App 双层身份。 */
export function decodePresetEmojiID(value) {
    /** 规范身份禁止空白前后缀。 */
    const normalized = normalizeString(value);
    /** 首个分隔符保留 presetID 内未来可能出现的分隔内容。 */
    const separatorIndex = normalized.indexOf(PRESET_EMOJI_ID_SEPARATOR);
    if (separatorIndex <= 0 || separatorIndex >= normalized.length - 1)
        return null;
    return {
        packID: normalized.slice(0, separatorIndex),
        presetID: normalized.slice(separatorIndex + 1),
    };
}
/** 将合法 App 实体序列化为 Gateway 线格式。 */
export function serializePresetEmojiEntities(entities, text) {
    return normalizePresetEmojiEntities(entities, text).map(entity => ({
        type: 'preset_emoji',
        offset: entity.offset,
        length: entity.length,
        preset_id: encodePresetEmojiID(entity.packID, entity.presetID),
    }));
}
/** 将正文实体投影到包含昵称或状态前缀的展示文本。 */
export function projectPresetEmojiEntitiesToDisplayText(params) {
    /** 源实体必须先按原正文完成边界校验。 */
    const sourceEntities = normalizePresetEmojiEntities(params.sourceEntities, params.sourceText);
    if (!sourceEntities.length || !params.displayText)
        return [];
    /** 正文完整存在时直接平移，覆盖普通会话预览。 */
    const exactStart = params.displayText.lastIndexOf(params.sourceText);
    if (exactStart >= 0) {
        return sourceEntities.map(entity => ({
            ...entity,
            offset: entity.offset + exactStart,
        }));
    }
    /** 连续搜索起点确保重复 fallback 不会命中同一位置。 */
    let searchStart = 0;
    /** 投影结果只保留能在最终文本重新定位的实体。 */
    const projectedEntities = [];
    sourceEntities.forEach(entity => {
        /** fallback 取原实体覆盖的 UTF-16 正文。 */
        const fallback = params.sourceText.slice(entity.offset, entity.offset + entity.length);
        /** 展示位置从上一命中之后继续查找。 */
        const displayOffset = params.displayText.indexOf(fallback, searchStart);
        if (displayOffset < 0)
            return;
        projectedEntities.push({ ...entity, offset: displayOffset });
        searchStart = displayOffset + entity.length;
    });
    return normalizePresetEmojiEntities(projectedEntities, params.displayText);
}
/** 将预设表情作为原子实体插入当前 UTF-16 选区。 */
export function insertPresetEmojiAtSelection(params) {
    /** 选区钳制到当前正文，且保证 start 不大于 end。 */
    const selection = normalizeSelection(params.document.text, params.selection);
    /** Unicode fallback 是跨端和未知资源场景的可读正文。 */
    const replacement = params.descriptor.unicode;
    /** 新正文使用 JavaScript 原生 UTF-16 slice 语义。 */
    const text = `${params.document.text.slice(0, selection.start)}${replacement}${params.document.text.slice(selection.end)}`;
    /** 旧实体按同一替换区间平移或失效。 */
    const entities = transformEntitiesForReplacement(params.document.entities, selection.start, selection.end, replacement.length);
    entities.push({
        type: 'preset_emoji',
        offset: selection.start,
        length: replacement.length,
        packID: params.descriptor.packID,
        presetID: params.descriptor.presetID,
    });
    /** 光标落在完整 fallback 之后。 */
    const cursor = selection.start + replacement.length;
    return {
        document: { text, entities: sortPresetEmojiEntities(entities) },
        selection: { start: cursor, end: cursor },
    };
}
/** 根据单次文本差量平移实体，并删除与编辑区相交的实体。 */
export function reconcilePresetEmojiEntitiesAfterTextChange(document, nextText) {
    if (document.text === nextText)
        return document;
    /** 公共前缀界定替换区左边界。 */
    const prefixLength = commonPrefixLength(document.text, nextText);
    /** 公共后缀界定替换区右边界。 */
    const suffixLength = commonSuffixLength(document.text, nextText, prefixLength);
    /** 旧正文被替换区间的右边界。 */
    const previousEnd = document.text.length - suffixLength;
    /** 新正文替换片段的 UTF-16 长度。 */
    const replacementLength = nextText.length - prefixLength - suffixLength;
    return {
        text: nextText,
        entities: transformEntitiesForReplacement(document.entities, prefixLength, previousEnd, replacementLength),
    };
}
/** 发送前裁剪首尾空白并同步修正实体偏移。 */
export function trimPresetEmojiDocument(document) {
    /** 头部裁剪长度使用 UTF-16 单元计数。 */
    const leadingLength = document.text.length - document.text.trimStart().length;
    /** 最终正文保持既有文本发送 trim 语义。 */
    const text = document.text.trim();
    /** 旧正文中的保留区右边界。 */
    const end = leadingLength + text.length;
    return {
        text,
        entities: normalizePresetEmojiEntities(document.entities, document.text)
            .filter(entity => entity.offset >= leadingLength && entity.offset + entity.length <= end)
            .map(entity => ({ ...entity, offset: entity.offset - leadingLength })),
    };
}
/** 单项归一化同时兼容 App camelCase 与 Gateway snake_case。 */
function normalizePresetEmojiEntity(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return null;
    /** 通用记录用于读取跨端字段别名。 */
    const record = value;
    /** Gateway 编码身份作为 camelCase 字段缺失时的回退。 */
    const encodedIdentity = decodePresetEmojiID(record.preset_id);
    /** UTF-16 起点必须为非负整数。 */
    const offset = normalizeInteger(record.offset, 0);
    /** UTF-16 长度必须为正整数。 */
    const length = normalizeInteger(record.length, 1);
    /** 表情包身份兼容早期 pack_id 草案。 */
    const packID = normalizeString(record.packID ?? record.pack_id) || encodedIdentity?.packID || '';
    /** 包内身份优先读取 App camelCase 字段。 */
    const presetID = normalizeString(record.presetID) || encodedIdentity?.presetID || '';
    if (record.type !== 'preset_emoji' || offset === null || length === null || !packID || !presetID)
        return null;
    return { type: 'preset_emoji', offset, length, packID, presetID };
}
/** 替换前实体不变、替换后实体平移、相交实体失效。 */
function transformEntitiesForReplacement(entities, start, end, replacementLength) {
    /** 长度差决定替换区后实体的位移。 */
    const delta = replacementLength - (end - start);
    return entities.flatMap(entity => {
        /** 实体右边界用于区间关系判断。 */
        const entityEnd = entity.offset + entity.length;
        if (entityEnd <= start)
            return [entity];
        if (entity.offset >= end)
            return [{ ...entity, offset: entity.offset + delta }];
        return [];
    });
}
/** 规范选区边界并处理反向选区。 */
function normalizeSelection(text, selection) {
    /** 原始起点钳制到正文范围。 */
    const rawStart = Math.max(0, Math.min(text.length, Math.trunc(selection.start)));
    /** 原始终点钳制到正文范围。 */
    const rawEnd = Math.max(0, Math.min(text.length, Math.trunc(selection.end)));
    return { start: Math.min(rawStart, rawEnd), end: Math.max(rawStart, rawEnd) };
}
/** 按起点排序保证序列化和渲染结果确定。 */
function sortPresetEmojiEntities(entities) {
    return [...entities].sort((left, right) => left.offset - right.offset);
}
/** 计算两个字符串共有的 UTF-16 前缀长度。 */
function commonPrefixLength(left, right) {
    /** 扫描上限不超过任一正文。 */
    const limit = Math.min(left.length, right.length);
    /** 游标指向首个不同单元。 */
    let index = 0;
    while (index < limit && left[index] === right[index])
        index += 1;
    return index;
}
/** 计算不与公共前缀重叠的 UTF-16 后缀长度。 */
function commonSuffixLength(left, right, prefixLength) {
    /** 后缀上限为剩余的较短正文。 */
    const limit = Math.min(left.length, right.length) - prefixLength;
    /** 已匹配后缀长度从零递增。 */
    let length = 0;
    while (length < limit && left[left.length - length - 1] === right[right.length - length - 1])
        length += 1;
    return length;
}
/** 将未知值规范为满足下限的整数。 */
function normalizeInteger(value, minimum) {
    return Number.isInteger(value) && Number(value) >= minimum ? Number(value) : null;
}
/** 将未知身份字段规范为去空白字符串。 */
function normalizeString(value) {
    return typeof value === 'string' ? value.trim() : '';
}
//# sourceMappingURL=preset-emoji.js.map