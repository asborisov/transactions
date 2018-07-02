const sqlite3 = require("sqlite3").verbose();
const app = require('express')();
const db = require("./db");
const { getValueOrDefault, parseArgs } = require("./argsUtil");
const { bindRoutes } = require("./routes");

const initDb = runArgs => {
    const dbInstance = new sqlite3.Database(getValueOrDefault(runArgs, 'dbPath'));
    if (getValueOrDefault(runArgs, 'createDb'))
        return db.create(dbInstance).then(() => {
            return {runArgs, dbInstance}
        });
    return Promise.resolve({runArgs, dbInstance});
};

return Promise.resolve()
    .then(parseArgs.bind(this, process.argv))
    .then(initDb)
    .then(({runArgs, dbInstance}) => {
        bindRoutes(app, dbInstance)
            .listen(getValueOrDefault(runArgs, 'port'), (err) => {
                if (err) {
                    return console.log('Something bad happened', err)
                }
                console.log(`Server is listening on ${getValueOrDefault(runArgs, 'port')}`)
            });

        process.on('exit', () => {
            dbInstance.close();
            app.close();
        });
    })
    .catch(err => {
        console.error(err);
    });
