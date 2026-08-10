import {
  type GatewayFriend,
  type GatewayHTTPClient,
} from '@im28/im-sdk/web';

import { createWebIMSyncError } from './sync-context.js';

/** 页面可消费的标准化好友记录。 */
export interface WebIMContact {
  readonly userID: string;
  readonly displayName: string;
  readonly nickname: string;
  readonly remark: string;
  readonly avatarURL: string;
  readonly isStarred: boolean;
  readonly addedAt: string;
}

/** 通讯录远端分页参数。 */
export interface WebIMContactListOptions {
  readonly pageSize?: number;
}

/** 页面可消费的认证通讯录能力。 */
export interface WebIMContactSync {
  list(options?: WebIMContactListOptions): Promise<readonly WebIMContact[]>;
}

/** 通讯录能力只依赖 runtime 已持有的 Gateway 与认证 owner。 */
export interface WebIMContactSyncDependencies {
  readonly gatewayClient: GatewayHTTPClient;
  readonly getCurrentUserID: () => string | null;
}

/** 创建只通过共享 Gateway client 读取好友列表的 Web facade。 */
export function createWebIMContactSync(
  dependencies: WebIMContactSyncDependencies,
): WebIMContactSync {
  return new WebIMContactSyncImpl(dependencies);
}

/** 通讯录 service 负责分页与 Gateway 字段归一化。 */
class WebIMContactSyncImpl implements WebIMContactSync {
  // dependencies 保持唯一 Gateway client 和动态认证状态。
  private readonly dependencies: WebIMContactSyncDependencies;

  /** 保存 runtime owners，不复制 token 或 transport 状态。 */
  constructor(dependencies: WebIMContactSyncDependencies) {
    this.dependencies = dependencies;
  }

  /** 拉取全部好友分页并返回稳定、去重的页面记录。 */
  async list(
    options: WebIMContactListOptions = {},
  ): Promise<readonly WebIMContact[]> {
    this.requireAuthenticatedUser();
    // pageSize 限制异常调用造成的服务端压力。
    const pageSize = clampContactPageSize(options.pageSize);
    // contacts 仅在远端分页完整成功后交给页面。
    const contacts: WebIMContact[] = [];
    // seenUserIDs 防止服务端跨页重复好友。
    const seenUserIDs = new Set<string>();
    // page 从 Gateway 的 1-based 首屏递增，最多执行安全上限次数。
    for (let page = 1; page <= 1000; page += 1) {
      // response 复用共享 client 的 endpoint 和 envelope 错误语义。
      const response = await this.dependencies.gatewayClient.listFriends({
        page,
        page_size: pageSize,
      });
      // friends 保留当前页原始顺序供 addedAt 排序稳定回退。
      const friends = response.friends ?? [];
      for (const friend of friends) {
        // contact 丢弃没有稳定用户 ID 的无效记录。
        const contact = normalizeWebIMContact(friend);
        if (contact && !seenUserIDs.has(contact.userID)) {
          seenUserIDs.add(contact.userID);
          contacts.push(contact);
        }
      }
      // total 在服务端提供时优先作为完成信号。
      const total = Math.max(0, Math.trunc(response.total ?? 0));
      if (friends.length < pageSize || (total > 0 && contacts.length >= total)) {
        return sortWebIMContacts(contacts);
      }
    }
    throw createWebIMSyncError(
      'CONTACT_PAGE_LIMIT_EXCEEDED',
      'Gateway friend pagination exceeded the safety limit.',
    );
  }

  /** 在网络请求前拒绝匿名通讯录读取。 */
  private requireAuthenticatedUser(): void {
    if (!this.dependencies.getCurrentUserID()?.trim()) {
      throw createWebIMSyncError(
        'CONTACT_AUTH_REQUIRED',
        'Contact list requires an authenticated Web IM session.',
      );
    }
  }
}

/** 将共享 Gateway friend 映射为最小 Web 页面模型。 */
function normalizeWebIMContact(friend: GatewayFriend): WebIMContact | null {
  // user 保存 Gateway 嵌套的公开用户资料。
  const user = friend.user;
  // userID 优先使用好友关系主键，回退公开用户 ID。
  const userID = (friend.friend_user_id ?? user?.user_id ?? '').trim();
  if (!userID) return null;
  // remark 对齐 RN alias 优先显示语义。
  const remark = friend.alias?.trim() ?? '';
  // nickname 保留联系人原始昵称供副标题使用。
  const nickname = (user?.nickname ?? '').trim();
  // displayName 按 RN remark -> nickname -> account -> phone -> ID 回退。
  const displayName = remark || nickname || user?.account?.trim() ||
    user?.phone?.trim() || userID;
  return {
    userID,
    displayName,
    nickname,
    remark,
    avatarURL: user?.avatar_url?.trim() ?? '',
    isStarred: friend.is_starred ?? false,
    addedAt: friend.created_at?.trim() ?? '',
  };
}

/** 按 RN 好友添加时间倒序，并保持无时间记录的原始顺序。 */
function sortWebIMContacts(contacts: readonly WebIMContact[]): readonly WebIMContact[] {
  return contacts
    .map((contact, index) => ({ contact, index }))
    .sort((left, right) => {
      // rightTime 与 leftTime 只接受可解析时间。
      const rightTime = Date.parse(right.contact.addedAt);
      // leftTime 与原列表 index 共同保证稳定排序。
      const leftTime = Date.parse(left.contact.addedAt);
      if (Number.isFinite(rightTime) && Number.isFinite(leftTime)) {
        return rightTime - leftTime || left.index - right.index;
      }
      if (Number.isFinite(rightTime)) return 1;
      if (Number.isFinite(leftTime)) return -1;
      return left.index - right.index;
    })
    .map(item => item.contact);
}

/** 将通讯录 page size 限制在 Gateway 可控范围。 */
function clampContactPageSize(value: number | undefined): number {
  if (!Number.isFinite(value)) return 100;
  return Math.min(200, Math.max(1, Math.trunc(value ?? 100)));
}
