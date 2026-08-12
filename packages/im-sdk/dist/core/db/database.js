/** 把现有事务执行器适配为 Repository 可复用的数据库端口，不开启嵌套事务。 */
export function createTransactionDatabaseAdapter(name, transaction) {
    return {
        name,
        open: async () => undefined,
        close: async () => undefined,
        execute: statement => transaction.execute(statement),
        query: statement => transaction.query(statement),
        transaction: run => run(transaction),
    };
}
export function statement(sql, params) {
    return params ? { sql, params } : { sql };
}
//# sourceMappingURL=database.js.map