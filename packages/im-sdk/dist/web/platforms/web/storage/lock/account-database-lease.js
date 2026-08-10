/** Web Lock 协调失败的结构化错误。 */
export class AccountDatabaseLeaseError extends Error {
    code;
    /** 保存稳定错误码与原始浏览器异常。 */
    constructor(code, message, cause) {
        super(message, cause === undefined ? undefined : { cause });
        this.name = 'AccountDatabaseLeaseError';
        this.code = code;
    }
}
/** 创建 fail-closed 的账户数据库 Web Lock manager。 */
export function createAccountDatabaseLeaseManager(lockManager) {
    return new BrowserAccountDatabaseLeaseManager(lockManager);
}
/** 生成同源内稳定且账号隔离的 Web Lock 名称。 */
export function createAccountDatabaseLockName(databaseName) {
    if (!databaseName.trim()) {
        throw new AccountDatabaseLeaseError('STORAGE_COORDINATION_FAILED', 'Account database lock requires a database name.');
    }
    return `im28-h5:sqlite:${databaseName}`;
}
// Browser owner 使用 ifAvailable 快速失败，不让第二个标签页无限等待。
class BrowserAccountDatabaseLeaseManager {
    // 缺失端口保留到 acquire 时转成稳定 fail-closed 错误。
    lockManager;
    /** 保存浏览器原生或测试 LockManager 端口。 */
    constructor(lockManager) {
        this.lockManager = lockManager;
    }
    /** 在读取 snapshot 前尝试取得账号数据库独占 lease。 */
    async acquire(databaseName) {
        if (!this.lockManager) {
            throw new AccountDatabaseLeaseError('STORAGE_COORDINATION_UNAVAILABLE', '当前浏览器不支持安全的本地消息缓存协调。');
        }
        // lockName 同时包含产品 namespace 与账号数据库名。
        const lockName = createAccountDatabaseLockName(databaseName);
        // 原生 LockManager 重载与最小测试端口语义相同，在 canonical owner 内收敛签名。
        const lockRequest = this.lockManager.request.bind(this.lockManager);
        // acquisition 显式拥有本次 request 的 deferred 与状态转换。
        return new WebLockAcquisition(lockName).start(lockRequest);
    }
}
/** 创建可由 Web Locks callback 外部完成的 Promise。 */
function createDeferred() {
    // resolve/reject 在 Promise executor 同步赋值后才返回。
    let resolveDeferred;
    let rejectDeferred;
    // promise 是 deferred 对外唯一异步结果。
    const promise = new Promise((resolve, reject) => {
        resolveDeferred = resolve;
        rejectDeferred = reject;
    });
    return { promise, resolve: resolveDeferred, reject: rejectDeferred };
}
// 单次 acquisition 显式管理 acquire、release signal 与 request completion。
class WebLockAcquisition {
    lockName;
    // acquired 决定 lifecycle 是否可以创建 Worker。
    acquired = createDeferred();
    // releaseSignal 保持 Web Locks callback pending 到 Worker close 后。
    releaseSignal = createDeferred();
    // requestDone 证明浏览器已经释放命名 lock。
    requestDone = createDeferred();
    // acquisitionSettled 阻止 request failure 重复覆盖 busy/success 结果。
    acquisitionSettled = false;
    /** 保存本次账户数据库 lock identity。 */
    constructor(lockName) {
        this.lockName = lockName;
    }
    /** 启动 ifAvailable request 并返回 acquire 结果。 */
    start(lockRequest) {
        void this.requestDone.promise.catch(() => undefined);
        try {
            // requestPromise 生命周期与浏览器命名 lock 完全一致。
            const requestPromise = lockRequest(this.lockName, { mode: 'exclusive', ifAvailable: true }, lock => this.hold(lock));
            void requestPromise.then(() => this.requestDone.resolve(undefined), cause => this.handleRequestFailure(cause));
        }
        catch (cause) {
            this.handleRequestFailure(cause);
        }
        return this.acquired.promise;
    }
    /** 在 callback 内公开 lease，并等待显式 release signal。 */
    async hold(lock) {
        if (!lock) {
            this.acquisitionSettled = true;
            this.acquired.reject(new AccountDatabaseLeaseError('ACCOUNT_DATABASE_BUSY', '本地消息缓存正在其他标签页中使用，请关闭该标签页后重试。'));
            return;
        }
        // lease 只有在浏览器确认独占 lock 后才向 lifecycle 公开。
        const lease = new BrowserAccountDatabaseLease(this.lockName, () => this.releaseSignal.resolve(undefined), this.requestDone.promise);
        this.acquisitionSettled = true;
        this.acquired.resolve(lease);
        await this.releaseSignal.promise;
    }
    /** 归一化 request 失败，并完成 release/acquire 两条等待链。 */
    handleRequestFailure(cause) {
        this.requestDone.reject(cause);
        if (this.acquisitionSettled) {
            return;
        }
        this.acquisitionSettled = true;
        this.acquired.reject(new AccountDatabaseLeaseError('STORAGE_COORDINATION_FAILED', '无法取得本地消息缓存所有权。', cause));
    }
}
// Lease 通过一次性 release signal 结束 Web Locks callback。
class BrowserAccountDatabaseLease {
    lockName;
    // releaseSignal 只能触发一次，避免重复结束 callback。
    releaseSignal;
    // requestDone 证明浏览器已完成 lock request。
    requestDone;
    // releasePromise 保证幂等调用共享同一结果。
    releasePromise = null;
    /** 保存 lock identity 和生命周期完成信号。 */
    constructor(lockName, releaseSignal, requestDone) {
        this.lockName = lockName;
        this.releaseSignal = releaseSignal;
        this.requestDone = requestDone;
    }
    /** 结束 callback 并等待浏览器确认独占 lock 已释放。 */
    release() {
        if (!this.releasePromise) {
            this.releaseSignal();
            this.releasePromise = this.requestDone.catch(cause => {
                throw new AccountDatabaseLeaseError('STORAGE_COORDINATION_FAILED', '释放本地消息缓存所有权失败。', cause);
            });
        }
        return this.releasePromise;
    }
}
//# sourceMappingURL=account-database-lease.js.map