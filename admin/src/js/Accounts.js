import Accounts from '../components/Accounts.html';

const AccountsComponent = new Accounts({
    target: document.getElementById('root'),
    data: {
        accounts: [
            {id: 1, currencyCode: "EUR", name: "Bank", balance: 100500.09},
            {id: 2, currencyCode: "EUR", name: "Wallet", balance: 1050.11}
        ],
    },
});

export default AccountsComponent;