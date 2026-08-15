/**
 * Adapts a structured database RPC port to the shared repository contract.
 * The adapter serializes public operations and transaction child statements.
 */
export function createDatabaseRPCAdapter(options) {
    return new DatabaseRPCAdapter(options);
}
class DatabaseRPCAdapter {
    name;
    port;
    operationQueue = Promise.resolve();
    state = 'new';
    constructor(options) {
        this.name = options.name;
        this.port = options.port;
    }
    open() {
        return this.runSerialized(() => this.openDirect());
    }
    close() {
        return this.runSerialized(async () => {
            if (this.state === 'closed') {
                return;
            }
            if (this.state === 'ready') {
                await this.port.close();
            }
            this.state = 'closed';
        });
    }
    execute(statement) {
        return this.runSerialized(async () => {
            await this.openDirect();
            return this.port.execute(statement);
        });
    }
    query(statement) {
        return this.runSerialized(async () => {
            await this.openDirect();
            return this.port.query(statement);
        });
    }
    transaction(run) {
        return this.runSerialized(async () => {
            await this.openDirect();
            const transactionID = await this.port.beginTransaction();
            let transactionQueue = Promise.resolve();
            const enqueue = (operation) => {
                const result = transactionQueue.then(operation, operation);
                transactionQueue = result.then(() => undefined, () => undefined);
                return result;
            };
            const transaction = {
                execute: statement => enqueue(() => this.port.executeTransaction(transactionID, statement)),
                query: (statement) => enqueue(() => this.port.queryTransaction(transactionID, statement)),
            };
            try {
                const result = await run(transaction);
                await transactionQueue;
                await this.port.commitTransaction(transactionID);
                return result;
            }
            catch (cause) {
                await transactionQueue.catch(() => undefined);
                await this.port.rollbackTransaction(transactionID).catch(() => undefined);
                throw cause;
            }
        });
    }
    runSerialized(run) {
        const result = this.operationQueue.then(run, run);
        this.operationQueue = result.then(() => undefined, () => undefined);
        return result;
    }
    async openDirect() {
        if (this.state === 'ready') {
            return;
        }
        if (this.state !== 'new') {
            throw new Error(`Database RPC adapter cannot open from ${this.state} state.`);
        }
        await this.port.open();
        this.state = 'ready';
    }
}
//# sourceMappingURL=rpc-database-adapter.js.map