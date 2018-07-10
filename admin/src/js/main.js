import AppComponent from "./App";

const checkResult = result => {
    if (result.success) return result.data;
    throw result.error;
}

const mapArrayToObject = (fieldNames, array) => array
    .reduce((acc, v, i) => Object.assign(acc, {[fieldNames[i]]: v}), {});

const log = data => {
    if (Array.isArray(data)) {
        return data.map(v => {
            console.log(v);
            return v;
        });
    }
    console.log(data);
    return data;
}

const prepareData = ({ users, accounts, categories, transactions }) => {
    const ac = accounts.reduce((acc, a) => Object.assign(acc, {[a.id]: 0}), {});
    const t = transactions.reduce((acc, tr) => {
        acc[tr.accountId] = acc[tr.accountId] - tr.amount;
        return acc;
    }, ac);

    return {
        users,
        accounts: accounts.map(a => Object.assign({}, a, { balance: t[a.id] })),
        categories,
        transactions,
    };
};

const initApp = (appComponent, data) => {
    appComponent.set(data);
}

const init = () => Promise
    // Get all the data from API
    .all([
        fetch('http://localhost:3000/users'),
        fetch('http://localhost:3000/accounts'),
        fetch('http://localhost:3000/categories'),
        fetch('http://localhost:3000/transactions'),
    ])
    // Extract JSON data from response body
    .then(results => Promise.all(results.map(v => v.json())))
    // Check if all of responses are succesful
    .then(results => results.map(checkResult))
    // Map array to object
    .then(mapArrayToObject.bind(this, ["users", "accounts", "categories", "transactions"]))
    // Prepare data
    .then(prepareData)
    // Log result
    .then(log)
    // Update component data
    .then(initApp.bind(this, AppComponent))
    // If error throw to console
    .catch(console.error);

export default init;
