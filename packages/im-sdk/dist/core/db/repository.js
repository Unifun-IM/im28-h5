export class Repository {
    database;
    constructor(database) {
        this.database = database;
    }
    execute(statement) {
        return this.database.execute(statement);
    }
    query(statement) {
        return this.database.query(statement);
    }
    transaction(run) {
        return this.database.transaction(run);
    }
}
//# sourceMappingURL=repository.js.map