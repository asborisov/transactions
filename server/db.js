const uuid = require("uuid/v4");
const { reduceObject, hasNonEmptyInObject } = require("./utils");
const { createUsers, createAccounts, createCategories, createTransactions } = require("./creatDbQueries");

const castObjectToQueryArgs = input =>
    reduceObject(input, (acc, value, key) => Object.assign(acc, { [`$${key}`]: value }), {});

const joinFields = (separator, mapFn, input) => Object.keys(input).filter(key => input[key]).map(mapFn).join(separator);
const joinUpdateFields = joinFields.bind(this, ", ", key => `${key} = $${key}`);
const joinInsertFields = joinFields.bind(this, ", ", key => `$${key}`);
const joinWhereAndFields = joinFields.bind(this, " AND ", key => `${key} = $${key}`);

const removeEmptyParams = input =>
    reduceObject(input, (acc, value, key) => value === undefined ? acc : Object.assign(acc, {[key]: value}), {});

const updateByIdBase = (db, tableName, id, values) => new Promise((resolve, reject) => {
    if (!id) return reject("No Id");
    if (!hasNonEmptyInObject(values)) return reject("Nothing to update");

    const updateArgs = removeEmptyParams(values);
    const updateQuery = `UPDATE ${tableName} SET ${joinUpdateFields(updateArgs)} WHERE id = $id`;

    db.run(updateQuery, Object.assign({ $id: id }, castObjectToQueryArgs(updateArgs)), (err) => {
        if (!err) resolve(id);
        else reject(err);
    });
});
const insertBase = (db, tableName, values) => new Promise((resolve, reject) => {
    const id = uuid();
    if (!hasNonEmptyInObject(values)) return reject("Nothing to insert");
    const query = `INSERT INTO ${tableName} (id, ${Object.keys(values).join(", ")}) VALUES ($id, ${joinInsertFields(values)})`;

    db.run(query, castObjectToQueryArgs(Object.assign({id}, values)), err => {
        if (!err) resolve(id);
        else reject(err);
    });
});
const selectBase = (db, tableName, fields = [], conditions = {}) => new Promise((resolve, reject) => {
    const whereClause = joinWhereAndFields(conditions);
    const query = `SELECT ${fields.join(", ") || "*"} FROM ${tableName}${whereClause ? ` WHERE ${whereClause}` : ""}`;
    db.all(query, conditions, (err, rows) => {
        if (!err) resolve(rows);
        else reject(err);
    });
});

const create = db => new Promise((resolve, reject) => {
    const cb = err => {
        if (err) reject(err);
    };
    db.serialize(() => {
        db.parallelize(() => {
            db.run(createUsers, cb);
            db.run(createAccounts, cb);
            db.run(createCategories, cb);
        });
        db.run(createTransactions, err => {
            if (!err) resolve();
            else reject(err);
        });
    })
});

const addUser = (db, { name, displayName }) => insertBase(db, "main.Users", {name, displayName: (displayName || name)});
const addAccount = (db, { name, currencyCode }) => insertBase(db, "main.Accounts", {name, currencyCode});
const addCategory = (db, { name }) => insertBase(db, "main.Categories", { name, isActive: true });
const addTransaction = (db, { userId, accountId, categoryId, amount, comment, date }) =>
    insertBase(db, "main.transactions", { userId, accountId, categoryId, amount, comment, date });

const updateTransaction = (db, { transactionId, accountId, categoryId, amount, comment, date }) =>
    updateByIdBase(db, "main.Transaction", transactionId, {accountId, categoryId, amount, comment, date});
const updateUser = (db, { userId, name, displayName }) =>
    updateByIdBase(db, "main.Users", userId, { name, displayName });
const updateCategory = (db, { categoryId, name, isActive }) =>
    updateByIdBase(db, "main.Categories", categoryId, { name, isActive });
const updateAccount = (db, { accountId, name, currency }) =>
    updateByIdBase(db, "main.Accounts", accountId, { name, currency });

const getUsers = (db, { userId }) => 
    selectBase(db, "main.Users", ["id", "name", "displayName"], { id: userId });
const getAccounts = (db, { accountId, currencyCode } = {}) => 
    selectBase(db, "main.Accounts", ["id", "name", "currencyCode"],  { id: accountId, currencyCode });
const getCategories = (db, { categoryId, isActive } = {}) => {
    const isActiveValue = typeof isActive === "boolean" ? {isActive: (isActive ? 1 : 0)} : {};
    return selectBase(db, "main.Categories", ["id", "name", "isActive"], Object.assign({ id: categoryId }, isActiveValue));
};
// TODO: Filter by date
const getTransactions = (db, {transactionId, categoryId, accountId, userId} = {}) => 
    selectBase(db, "main.Transactions", ["id", "accountId", "categoryId", "userId", "amount", "comment", "date"], {
        id: transactionId, categoryId, accountId, userId,
    });

module.exports = {
    create,
    add: {
        user: addUser,
        account: addAccount,
        category: addCategory,
        transaction: addTransaction,
    },
    update: {
        user: updateUser,
        account: updateAccount,
        category: updateCategory,
        transaction: updateTransaction,
    },
    get: {
        users: getUsers,
        accounts: getAccounts,
        categories: getCategories,
        transactions: getTransactions,
    }
};
