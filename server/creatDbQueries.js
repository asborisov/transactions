const createUsers = `
    CREATE TABLE IF NOT EXISTS main.Users (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE,
        displayName TEXT
    ) WITHOUT ROWID
`;
const createAccounts = `
    CREATE TABLE IF NOT EXISTS main.Accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        currencyCode TEXT NOT NULL
    ) WITHOUT ROWID
`;
const createCategories = `
    CREATE TABLE IF NOT EXISTS main.Categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        isActive INTEGER NOT NULL
    ) WITHOUT ROWID
`;
const createTransactions = `
    CREATE TABLE IF NOT EXISTS main.Transactions (
        id TEXT PRIMARY KEY,
        date INTEGER NOT NULL,
        amount REAL NOT NULL,
        comment TEXT,
        categoryId TEXT NOT NULL,
        userId TEXT NOT NULL,
        accountId TEXT NOT NULL,
        FOREIGN KEY (categoryId) REFERENCES Categories(id),
        FOREIGN KEY (userId) REFERENCES Users(id),
        FOREIGN KEY (accountId) REFERENCES Accounts(id)
    ) WITHOUT ROWID
`;

module.exports = {
    createUsers,
    createAccounts,
    createCategories,
    createTransactions,
};
