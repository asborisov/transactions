const path = require("path");
const fs = require("fs");
const db = require("./db");

const methods = {
    GET: "get",
    POST: "post",
};

const sendResult = (response) => (data) => {
    response.send({
        success: true,
        data, 
    });
};
const sendError = (response) => error => {
    response.send({
        success: false,
        error,
    });
}

const createUser = (dbInstance, request, response) => {
    const { name, displayName = name } = request.params;
    db.add
        .user(dbInstance, { name, displayName })
        .then(sendResult(response))
        .catch(sendError(response));
};
const createAccount = (dbInstance, request, response) => {
    const { name, currencyCode } = request.params;
    db.add
        .account(dbInstance, { name, currencyCode })
        .then(sendResult(response))
        .catch(sendError(response));
};
const createCategory = (dbInstance, request, response) => {
    const { name } = request.params;
    db.add
        .category(dbInstance, { name })
        .then(sendResult(response))
        .catch(sendError(response));
};
const createTransaction = (dbInstance, request, response) => {
    // `ts` is unix timestamp
    const { userId, accountId, categoryId, amount, comment, ts } = request.params;
    const amountNumber = parseFloat(amount);
    const date = new Date(ts*1000);
    db.add
        .transaction(dbInstance, { userId, accountId, categoryId, amount: amountNumber, comment, date })
        .then(sendResult(response))
        .catch(sendError(response));
};

const getUsers = (dbInstance, request, response) => {
    const { userId, name, displayName } = request.query;
    db.get
        .users(dbInstance, { userId, name, displayName })
        .then(sendResult(response))
        .catch(sendError(response));
};
const getAccounts = (dbInstance, request, response) => {
    const { accountId, currencyCode } = request.query;
    db.get
        .accounts(dbInstance, { accountId, currencyCode })
        .then(sendResult(response))
        .catch(sendError(response));
};
const getCategories = (dbInstance, request, response) => {
    const { categoryId, isActive } = request.query;
    db.get
        .categories(dbInstance, { categoryId, isActive })
        .then(sendResult(response))
        .catch(sendError(response));
};
const getTransactions = (dbInstance, request, response) => {
    const { transactionId, categoryId, accountId, userId } = request.query;
    db.get
        .transactions(dbInstance, { transactionId, categoryId, accountId, userId })
        .then(sendResult(response))
        .catch(sendError(response));

const map = new Map([
    [{path: "/users", method: methods.POST}, createUser],
    [{path: "/accounts", method: methods.POST}, createAccount],
    [{path: "/categories", method: methods.POST}, createCategory],
    [{path: "/transactions", method: methods.POST}, createTransaction],

    [{path: "/users", method: methods.GET}, getUsers],
    [{path: "/accounts", method: methods.GET}, getAccounts],
    [{path: "/categories", method: methods.GET}, getCategories],
    [{path: "/transactions", method: methods.GET}, getTransactions],

    [{path: "/admin/:file", method: methods.GET}, (db, request, response) => {
        const publicFile = path.join(__dirname, "..", "admin", "public", request.params.file);
        const distFile = path.join(__dirname, "..", "admin", "dist", request.params.file);
        response.sendFile(fs.existsSync(publicFile) ? publicFile : distFile);
    }]
]);

module.exports = {
    bindRoutes: (app, dbInstance) => {
        map.forEach((value, key) => app[key.method](key.path, value.bind(this, dbInstance)));
        return app;
    },
    methods,
};
