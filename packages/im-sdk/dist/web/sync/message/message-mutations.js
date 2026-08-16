import { deleteWebIMMessages, } from './message-delete.js';
import { editWebIMTextMessage, } from './message-edit.js';
import { forwardWebIMMessages, } from './message-forward.js';
import { forwardWebIMMessagesToTargets, } from './message-forward-targets.js';
import { requireWebIMSyncContext, } from '../sync-context.js';
import { createWebIMSyncMutationQueue, } from '../sync-mutation-queue.js';
/** 创建 RN、Web 与 Desktop 共用的消息 mutation facade。 */
export function createIMMessageMutationSync(dependencies) {
    /** mutationQueue 串行化同一账号的转发、删除和编辑。 */
    const mutationQueue = dependencies.mutationQueue ?? createWebIMSyncMutationQueue();
    return new IMMessageMutationSyncImpl(dependencies, mutationQueue);
}
/** 中性实现仅负责编排共享 context 和既有 canonical mutation。 */
class IMMessageMutationSyncImpl {
    /** dependencies 动态读取当前认证账号、数据库和 Gateway。 */
    dependencies;
    /** mutationQueue 是三类主动写入的唯一串行 owner。 */
    mutationQueue;
    /** 保存平台注入端口，不持有客户端 UI 或生命周期状态。 */
    constructor(dependencies, mutationQueue) {
        this.dependencies = dependencies;
        this.mutationQueue = mutationQueue;
    }
    /** 从当前账号 cache 重读来源并执行逐项可审计的批量转发。 */
    async forward(options) {
        /** context 在来源读取和 optimistic 写入前固定账号数据库。 */
        const context = requireWebIMSyncContext(this.dependencies, 'Message forward');
        return this.mutationQueue.enqueue(() => forwardWebIMMessages(context, options, this.dependencies));
    }
    /** 在唯一 mutation queue 内逐目标复用既有转发状态机。 */
    async forwardToTargets(options) {
        /** context 在全部目标开始前固定当前账号数据库。 */
        const context = requireWebIMSyncContext(this.dependencies, 'Message forward to targets');
        return this.mutationQueue.enqueue(() => forwardWebIMMessagesToTargets(context, options, this.dependencies));
    }
    /** 从当前账号 cache 重读目标并执行 self/all 单删或批删。 */
    async delete(options) {
        /** context 在 Gateway 和 SQLite mutation 前固定账号 owner。 */
        const context = requireWebIMSyncContext(this.dependencies, 'Message delete');
        return this.mutationQueue.enqueue(() => deleteWebIMMessages(context, options, this.dependencies));
    }
    /** 从当前账号 cache 重读目标并编辑同一条已发送文本消息。 */
    async editText(options) {
        /** context 在 Gateway 和 SQLite mutation 前固定账号 owner。 */
        const context = requireWebIMSyncContext(this.dependencies, 'Message edit');
        return this.mutationQueue.enqueue(() => editWebIMTextMessage(context, options, this.dependencies));
    }
}
//# sourceMappingURL=message-mutations.js.map