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
    const { name, currencyCode } = request.params;
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
    const { name } = request.params;
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
    const { userId, accountId, categoryId, amount, comment, ts } = request.params;
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

const getUsers = (dbInstance, request, response) => {
    const { userId } = request.query;
    db.get
        .users(dbInstance, {userId})
        .then(results => {
            response.send(results.map(user => JSON.stringify(user, "", 2)));
        })
        .catch(err => {
            response.send(`Error: ${err}`);
        });
};
const getAccounts = (dbInstance, request, response) => {
    const { accountId, currencyCode } = request.query;
    db.get
        .accounts(dbInstance, { accountId, currencyCode })
        .then(results => {
            response.send(results.map(user => JSON.stringify(user, "", 2)));
        })
        .catch(err => {
            response.send(`Error: ${err}`);
        });
};
const getCategories = (dbInstance, request, response) => {
    const { categoryId, isActive } = request.query;
    db.get
        .categories(dbInstance, { categoryId, isActive })
        .then(results => {
            response.send(results.map(user => JSON.stringify(user, "", 2)));
        })
        .catch(err => {
            response.send(`Error: ${err}`);
        });
};
const getTransactions = (dbInstance, request, response) => {
    const { transactionId, categoryId, accountId, userId } = request.query;
    db.get
        .transactions(dbInstance, { transactionId, categoryId, accountId, userId })
        .then(results => {
            response.send(results.map(user => JSON.stringify(user, "", 2)));
        })
        .catch(err => {
            response.send(`Error: ${err}`);
        });
}

const map = new Map([
    [{path: "/users", method: methods.POST}, createUser],
    [{path: "/accounts", method: methods.POST}, createAccount],
    [{path: "/categories", method: methods.POST}, createCategory],
    [{path: "/transactions", method: methods.POST}, createTransaction],

    [{path: "/users", method: methods.GET}, getUsers],
    [{path: "/accounts", method: methods.GET}, getAccounts],
    [{path: "/categories", method: methods.GET}, getCategories],
    [{path: "/transactions", method: methods.GET}, getTransactions],

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
