const uuid = require("uuid/v4");
const { reduceObject, hasNonEmptyInObject } = require("./utils");
const { createUsers, createAccounts, createCategories, createTransactions } = require("./creatDbQueries");

const castObjectToQueryArgs = input =>
    reduceObject(input, (acc, value, key) => Object.assign(acc, { [`$${key}`]: value }), {});

const joinFields = (mapFn, input) => Object.keys(input).map(mapFn).join(", ");
const joinUpdateFields = joinFields.bind(this, key => `${key} = $${key}`);
const joinInsertFields = joinFields.bind(this, key => `$${key}`);

const removeEmptyParams = input =>
    reduceObject(input, (acc, value, key) => value === undefined ? acc : Object.assign(acc, {[key]: value}), {});

const updateBase = (db, tableName, id, fields) => new Promise((resolve, reject) => {
    if (!id) return reject("No Id");
    if (!hasNonEmptyInObject(fields)) return reject("Nothing to update");

    const updateArgs = removeEmptyParams(fields);
    const updateQuery = `UPDATE ${tableName} SET ${joinUpdateFields(updateArgs)} WHERE id = $id`;

    db.run(updateQuery, Object.assign({ $id: id }, castObjectToQueryArgs(updateArgs)), (err) => {
        if (!err) resolve(id);
        else reject(err);
    });
});
const insertBase = (db, tableName, fields) => new Promise((resolve, reject) => {
    const id = uuid();
    const query = `INSERT INTO ${tableName} (id, ${Object.keys(fields).join(", ")}) VALUES ($id, ${joinInsertFields(fields)})`;

    db.run(query, castObjectToQueryArgs(Object.assign({id}, fields)), (err) => {
        if (!err) resolve(id);
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
const addAccount = (db, { name, currency }) => insertBase(db, "main.Accounts", {name, currency});
const addCategory = (db, { name }) => insertBase(db, "main.Categories", { name });
const addTransaction = (db, { userId, accountId, categoryId, amount, comment, date }) =>
    insertBase(db, "main.transactions", { userId, accountId, categoryId, amount, comment, date });

const updateTransaction = (db, { transactionId, accountId, categoryId, amount, comment, date }) =>
    updateBase(db, "main.Transaction", transactionId, {accountId, categoryId, amount, comment, date});
const updateUser = (db, { userId, name, displayName }) =>
    updateBase(db, "main.Users", userId, { name, displayName });
const updateCategory = (db, { categoryId, name, isActive }) =>
    updateBase(db, "main.Categories", categoryId, { name, isActive });
const updateAccount = (db, { accountId, name, currency }) =>
    updateBase(db, "main.Accounts", accountId, { name, currency });

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
};
