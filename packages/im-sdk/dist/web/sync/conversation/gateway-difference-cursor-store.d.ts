import { type DatabaseExecutor } from '../../db/database.js';
export declare const ACCOUNT_DIFFERENCE_CURSOR_KEY = "gateway_difference:account:pts";
export declare const ACCOUNT_DIFFERENCE_PAGE_TOKEN_KEY = "gateway_difference:account:page_token";
/** 读取十进制游标，缺失时返回调用方提供的迁移回退值。 */
export declare function readGatewayDifferenceCursor(database: DatabaseExecutor, key: string, fallback: string): Promise<string>;
/** 读取可选同步值，供数字游标和不透明分页 token 复用。 */
export declare function readGatewayDifferenceValue(database: DatabaseExecutor, key: string): Promise<string | undefined>;
/** 在当前事务中覆盖同步值。 */
export declare function writeGatewayDifferenceValue(database: DatabaseExecutor, key: string, value: string): Promise<void>;
/** 在当前事务中删除已完成或已失效的同步值。 */
export declare function deleteGatewayDifferenceValue(database: DatabaseExecutor, key: string): Promise<void>;
/** 构造会话消息 Difference pts 的物理隔离 key。 */
export declare function createConversationDifferencePTSKey(conversationID: string): string;
/** 与既有 message-update store 生成同一个 qts key。 */
export declare function createMessageUpdateCursorKey(conversationID: string): string;
//# sourceMappingURL=gateway-difference-cursor-store.d.ts.map