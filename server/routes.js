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
    const { name, currency } = request.query;
    db.add
        .account(dbInstance, { name, currency })
        .then(accountId => {
            response.send(`New account added ${accountId}`);
        })
        .catch(err => {
            response.send(`Error: ${err}`);
        });
};

const map = new Map([
    [{path: "/createUser", method: methods.GET}, createUser],
    [{path: "/createAccount", method: methods.GET}, createAccount],
    [{path: "/", method: methods.GET}, (request, response) => {
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
