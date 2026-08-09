import { z } from 'zod';

// Web 数据库账号标识约束：与现有设备 ID 上限一致，拒绝空账号。
const USER_ID_SCHEMA = z.string().trim().min(1).max(128);

/** 为单个账号生成无碰撞、可作为 IndexedDB key 的 SQLite 数据库名。 */
export function createAccountDatabaseName(userID: string): string {
  // 标准化后的账号是本地数据库隔离的唯一输入，不包含 token。
  const normalizedUserID = USER_ID_SCHEMA.parse(userID);
  return `im28-web-${encodeURIComponent(normalizedUserID)}.sqlite`;
}
