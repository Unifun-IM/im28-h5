import { ConversationRepository, MessageRepository, UserRepository, mapGatewayConversationToCore, mapGatewayMessageToCore, } from '@im28/im-sdk/core';
import { createTransactionDatabaseAdapter, } from '../db/database.js';
import { ACCOUNT_DIFFERENCE_CURSOR_KEY, ACCOUNT_DIFFERENCE_PAGE_TOKEN_KEY, createConversationDifferencePTSKey, createMessageUpdateCursorKey, deleteGatewayDifferenceValue, readGatewayDifferenceCursor, readGatewayDifferenceValue, writeGatewayDifferenceValue, } from './gateway-difference-cursor-store.js';
import { assertGatewayConversationDifferenceState, deduplicateGatewayDifferenceStates, mapGatewayDifferenceUsers, mergeGatewayDifferenceConversationState, } from './gateway-difference-data.js';
import { createWebIMSyncError } from './sync-context.js';
import { readMessageUpdateCursor, writeMessageUpdateCursor } from './message-update-cursor-store.js';
import { collectRealtimeMessageUpdates } from './realtime-message-update-data.js';
import { applyIMMessageUpdate } from './realtime-message-update-sync.js';
/** 按新 OpenAPI Difference 协议收敛账号与会话差量。 */
export async function syncIMGatewayDifference(gatewayClient, context, pageSize = 100) {
    // normalizedPageSize 与 OpenAPI 的 1..100 限制保持一致。
    const normalizedPageSize = Math.min(100, Math.max(1, Math.trunc(pageSize)));
    // persistedPTS 是上次已与账号更新同事务提交的游标。
    let persistedPTS = await readGatewayDifferenceCursor(context.database, ACCOUNT_DIFFERENCE_CURSOR_KEY, '0');
    // pageToken 与 intermediate pts 成对恢复，不能跨同步轮次复用。
    let pageToken = await readGatewayDifferenceValue(context.database, ACCOUNT_DIFFERENCE_PAGE_TOKEN_KEY);
    // changedConversationIDs 按服务端首次出现顺序去重。
    const changedConversationIDs = new Set();
    // seenPageTokens 阻止异常 token 造成无界循环。
    const seenPageTokens = new Set();
    for (let page = 0; page < 1000; page += 1) {
        // response 由 transport 统一校验 HTTP 和业务信封。
        const response = await gatewayClient.getDifference({
            pts: persistedPTS,
            limit: normalizedPageSize,
            ...(pageToken ? { page_token: pageToken } : {}),
        });
        // accountStates 按会话保留本页最高 pts 对应状态，避免重复补拉和重复 unread。
        const accountStates = deduplicateGatewayDifferenceStates(response.updates);
        // bundles 在写库前完成全部会话网络读取，任何失败都不推进账号 pts。
        const bundles = await Promise.all(accountStates.map(accountState => prepareConversationBundle(gatewayClient, context, accountState)));
        // nextState 必须与本页 updates 同事务提交。
        const nextState = response.has_more
            ? response.intermediate_state
            : response.state;
        if (!nextState?.pts || !/^\d+$/.test(nextState.pts)) {
            throw createWebIMSyncError('GATEWAY_DIFFERENCE_STATE_INVALID', 'Gateway account difference returned an invalid state cursor.');
        }
        // nextPageToken 只在 has_more 时允许存在且必须稳定非空。
        const nextPageToken = response.next_page_token?.trim();
        if (response.has_more && !nextPageToken) {
            throw createWebIMSyncError('GATEWAY_DIFFERENCE_PAGE_TOKEN_MISSING', 'Gateway account difference omitted the required page token.');
        }
        await context.database.transaction(async (transaction) => {
            // transactionDatabase 让现有 Repository 和 update owner 复用当前事务。
            const transactionDatabase = createTransactionDatabaseAdapter(`${context.database.name}:difference`, transaction);
            for (const bundle of bundles) {
                await applyConversationBundle(transactionDatabase, context.userID, bundle);
                changedConversationIDs.add(bundle.conversationID);
            }
            await writeGatewayDifferenceValue(transaction, ACCOUNT_DIFFERENCE_CURSOR_KEY, nextState.pts);
            if (response.has_more && nextPageToken) {
                await writeGatewayDifferenceValue(transaction, ACCOUNT_DIFFERENCE_PAGE_TOKEN_KEY, nextPageToken);
            }
            else {
                await deleteGatewayDifferenceValue(transaction, ACCOUNT_DIFFERENCE_PAGE_TOKEN_KEY);
            }
        });
        persistedPTS = nextState.pts;
        if (!response.has_more) {
            return {
                conversationIDs: [...changedConversationIDs],
                pts: persistedPTS,
            };
        }
        if (!nextPageToken || seenPageTokens.has(nextPageToken)) {
            throw createWebIMSyncError('GATEWAY_DIFFERENCE_PAGINATION_LOOP', 'Gateway account difference returned a repeated page token.');
        }
        seenPageTokens.add(nextPageToken);
        pageToken = nextPageToken;
    }
    throw createWebIMSyncError('GATEWAY_DIFFERENCE_PAGE_LIMIT_EXCEEDED', 'Gateway account difference exceeded the safety page limit.');
}
/** 为账号页中的单个会话读取完整消息、更新、资料和会话详情。 */
async function prepareConversationBundle(gatewayClient, context, accountState) {
    // conversationID 是后续所有请求和游标的稳定 owner。
    const conversationID = accountState.conversation_id?.trim();
    if (!conversationID) {
        throw createWebIMSyncError('GATEWAY_DIFFERENCE_CONVERSATION_INVALID', 'Gateway account difference returned a conversation without identity.');
    }
    // removed 表示服务端要求当前用户从本地列表移除该会话。
    const removed = accountState.state === 'left' || accountState.state === 'removed';
    if (removed) {
        return { conversationID, accountState, removed, differences: [] };
    }
    // existing 提供从旧同步链平滑迁移时的消息 pts 回退。
    const existing = await new ConversationRepository(context.database).getByID(conversationID);
    // initialPTS 优先使用新 Difference cursor，首次使用旧 lastMsgSeq 防止重复补拉全部历史。
    const initialPTS = await readGatewayDifferenceCursor(context.database, createConversationDifferencePTSKey(conversationID), existing?.lastMsgSeq ?? '0');
    // initialQTS 复用原有消息更新 cursor，维持唯一更新水位。
    const initialQTS = await readMessageUpdateCursor(context.database, conversationID);
    // differences 保存完整分页，统一在账号页事务内提交。
    const differences = [];
    // pts 与 qts 始终使用上一页响应的权威双游标。
    let pts = initialPTS;
    let qts = initialQTS;
    for (let page = 0; page < 1000; page += 1) {
        // difference 同时返回普通消息与编辑删除更新。
        const difference = await gatewayClient.getConversationDifference({
            conversation_id: conversationID,
            pts,
            qts,
            message_limit: 100,
            update_limit: 100,
        });
        assertGatewayConversationDifferenceState(difference, conversationID, pts, qts);
        differences.push(difference);
        pts = difference.state.pts;
        qts = difference.state.qts;
        if (!difference.has_more)
            break;
        if (page === 999) {
            throw createWebIMSyncError('GATEWAY_CONVERSATION_DIFFERENCE_PAGE_LIMIT_EXCEEDED', 'Gateway conversation difference exceeded the safety page limit.');
        }
    }
    // conversation 在差量读取后获取，避免把更早的详情快照覆盖新状态。
    const conversation = await gatewayClient.getConversation({
        conversation_id: conversationID,
    });
    return { conversationID, accountState, removed, conversation, differences };
}
/** 在账号页事务内依次应用资料、消息、更新、会话和双游标。 */
async function applyConversationBundle(database, currentUserID, bundle) {
    // conversations 和 messages 共享同一个事务 adapter。
    const conversations = new ConversationRepository(database);
    // messages 同时服务新消息写入和编辑删除 target 查询。
    const messages = new MessageRepository(database);
    if (bundle.removed) {
        await messages.deleteByConversationID(bundle.conversationID);
        await conversations.deleteByID(bundle.conversationID);
        await deleteGatewayDifferenceValue(database, createConversationDifferencePTSKey(bundle.conversationID));
        await deleteGatewayDifferenceValue(database, createMessageUpdateCursorKey(bundle.conversationID));
        return;
    }
    if (!bundle.conversation) {
        throw createWebIMSyncError('GATEWAY_DIFFERENCE_CONVERSATION_DETAIL_MISSING', 'Gateway conversation difference cannot persist without conversation detail.');
    }
    // users 按本账号所有分页聚合并去重，供发送人和转发来源展示复用。
    const users = mapGatewayDifferenceUsers(bundle.differences.flatMap(item => item.users));
    await new UserRepository(database).upsertMany(users);
    // mapping 在完整详情上执行，先写详情 latest，后续 Difference 更新拥有最终覆盖权。
    const mapping = mapGatewayConversationToCore(bundle.conversation, currentUserID);
    if (mapping.latestMessage)
        await messages.upsert(mapping.latestMessage);
    for (const difference of bundle.differences) {
        // gatewayMessages 只接受 wrapper 中明确存在的消息实体。
        const gatewayMessages = difference.new_messages.flatMap(item => item.message ? [item.message] : []);
        for (const gatewayMessage of gatewayMessages) {
            await messages.upsert(mapGatewayMessageToCore(gatewayMessage, {
                currentUserID,
                conversationID: bundle.conversationID,
            }));
        }
        // parsedUpdates 必须与服务端数组等长，禁止静默跳过未知变更。
        const parsedUpdates = collectRealtimeMessageUpdates(difference.message_updates);
        if (parsedUpdates.length !== difference.message_updates.length) {
            throw createWebIMSyncError('GATEWAY_CONVERSATION_DIFFERENCE_UPDATE_INVALID', 'Gateway conversation difference returned an invalid message update.');
        }
        // updateContext 复用 realtime 的 canonical 编辑/删除 owner。
        const updateContext = { userID: currentUserID, database };
        for (const parsedUpdate of parsedUpdates) {
            await applyIMMessageUpdate(messages, updateContext, parsedUpdate);
        }
        await writeGatewayDifferenceValue(database, createConversationDifferencePTSKey(bundle.conversationID), difference.state.pts);
        await writeMessageUpdateCursor(database, bundle.conversationID, difference.state.qts);
    }
    // 会话最后写入，保证 latest 指针引用的消息已经完成编辑或删除收敛。
    await conversations.upsert(mergeGatewayDifferenceConversationState(mapping.conversation, bundle.accountState));
}
//# sourceMappingURL=gateway-difference-sync.js.map