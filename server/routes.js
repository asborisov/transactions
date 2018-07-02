const db = require("./db");

const methods = {
    GET: "get",
    POST: "post",
};

const createUser = (dbInstance, request, response) => {
    const { name, displayName = name } = request.query;
    db.add
        .user(dbInstance, { name, displayName })
        .then(userId => {
            response.send(`Added new user ${userId}`);
        })
        .catch(err => {
            response.send(`Error: ${err}`);
        });
};
const createAccount = (dbInstance, request, response) => {
    const { name, currencyCode } = request.query;
    db.add
        .account(dbInstance, { name, currencyCode })
        .then(accountId => {
            response.send(`New account added ${accountId}`);
        })
        .catch(err => {
            response.send(`Error: ${err}`);
        });
};
const createCategory = (dbInstance, request, response) => {
    const { name } = request.query;
    db.add
        .category(dbInstance, { name })
        .then(categoryId => {
            response.send(`Category added: ${categoryId}`);
        })
        .catch(err => {
            response.send(`Error: ${err}`);
        });
};
const createTransaction = (dbInstance, request, response) => {
    // `ts` is unix timestamp
    const { userId, accountId, categoryId, amount, comment, ts } = request.query;
    const amountNumber = parseFloat(amount);
    const date = new Date(ts*1000);
    db.add
        .transaction(dbInstance, { userId, accountId, categoryId, amount: amountNumber, comment, date })
        .then(categoryId => {
            response.send(`Transaction added: ${categoryId}`);
        })
        .catch(err => {
            response.send(`Error: ${err}`);
        });
};

const map = new Map([
    [{path: "/createUser", method: methods.GET}, createUser],
    [{path: "/createAccount", method: methods.GET}, createAccount],
    [{path: "/createCategory", method: methods.GET}, createCategory],
    [{path: "/createTransaction", method: methods.GET}, createTransaction],
    [{path: "/", method: methods.GET}, (db, request, response) => {
        response.send('Hello');
    }]
]);

module.exports = {
    bindRoutes: (app, dbInstance) => {
        map.forEach((value, key) =>
            app[key.method](key.path, value.bind(this, dbInstance))
        );
        return app;
    },
    methods,
};
