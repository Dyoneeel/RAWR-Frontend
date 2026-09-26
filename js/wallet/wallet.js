(function () {
    const base = window.getWalletHTML;
    const rows = () => {
        const items = AppState.transactions || RAWR_DEMO_DATA.transactions;
        return items.map(x => `<tr><td>${x.type}</td><td>${x.amount}</td><td><span class="wallet-status">${x.status}</span></td><td>${x.date}</td></tr>`).join('');
    };
    const originalConvert = window.convertTokens;
    window.convertTokens = function () {
        const beforeRawr = AppState.rawrBalance, beforeTickets = AppState.ticketBalance;
        originalConvert();
        if (beforeRawr !== AppState.rawrBalance || beforeTickets !== AppState.ticketBalance) addTransaction('Token conversion', `${(beforeRawr-AppState.rawrBalance).toFixed(2)} RAWR / ${AppState.ticketBalance-beforeTickets} Tickets`);
    };
    window.connectWallet = function () {
        AppState.walletConnected = !AppState.walletConnected;
        saveState(); showNotification(AppState.walletConnected ? 'Wallet connected! (Demo)' : 'Wallet disconnected (Demo).', 'success');
    };
    window.walletAction = function (event, type) {
        event.preventDefault(); const form = new FormData(event.currentTarget); const amount = Number(form.get('amount'));
        if (!Number.isFinite(amount) || amount <= 0) return showNotification('Enter a valid amount.', 'error');
        if (type === 'withdraw' && amount > AppState.rawrBalance) return showNotification('Insufficient RAWR balance.', 'error');
        if (type === 'deposit') AppState.rawrBalance += amount; else AppState.rawrBalance -= amount;
        addBalance(0,0); addTransaction(type === 'deposit' ? 'Deposit request' : 'Withdrawal request', `${type === 'deposit' ? '+' : '-'}${amount.toFixed(2)} RAWR`, 'Pending');
        showNotification(`${type === 'deposit' ? 'Deposit' : 'Withdrawal'} request recorded in demo mode.`, 'success');
        loadDashboardContent('wallet');
    };
    function addTransaction(type, amount, status='Complete') { AppState.transactions = AppState.transactions || [...RAWR_DEMO_DATA.transactions]; AppState.transactions.unshift({type, amount, status, date:'Just now'}); AppState.transactions = AppState.transactions.slice(0,8); saveState(); }
    window.getWalletHTML = function () {
        const html=base(); const actions=`<section class="wallet-actions"><article><h2>Deposit RAWR</h2><p>Request a demo deposit to your connected wallet.</p><form onsubmit="walletAction(event,'deposit')"><label>Amount (RAWR)<input name="amount" type="number" min="0.01" step="0.01" required></label><label>Wallet Address<input name="address" placeholder="0x…" required></label><button class="btn btn-primary">Request Deposit</button></form></article><article><h2>Withdraw RAWR</h2><p>Submit a simulated withdrawal request.</p><form onsubmit="walletAction(event,'withdraw')"><label>Amount (RAWR)<input name="amount" type="number" min="0.01" step="0.01" required></label><label>Wallet Address<input name="address" placeholder="0x…" required></label><button class="btn btn-secondary">Request Withdrawal</button></form></article></section>`;
        return html.replace('<!-- Transaction History -->', actions+'<!-- Transaction History -->').replace(/<tbody>[\s\S]*?<\/tbody>/, `<tbody>${rows()}</tbody>`).replace('Connect MetaMask', AppState.walletConnected?'Disconnect Wallet':'Connect MetaMask');
    };
})();
