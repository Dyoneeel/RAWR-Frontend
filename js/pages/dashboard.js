document.getElementById('dashboard-username')?.replaceChildren(document.createTextNode(DemoState.currentUser || 'Lion'));
document.getElementById('dashboard-rawr')?.replaceChildren(document.createTextNode(formatDemoNumber(DemoState.rawrBalance)));
document.getElementById('dashboard-tickets')?.replaceChildren(document.createTextNode(formatDemoNumber(DemoState.ticketBalance)));
document.getElementById('dashboard-level')?.replaceChildren(document.createTextNode(String(DemoState.miningLevel || 1)));
document.getElementById('dashboard-streak')?.replaceChildren(document.createTextNode(`${DemoState.loginStreak || 0} days`));
