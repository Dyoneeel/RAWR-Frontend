/* Fictional portfolio-demo data. Never use real account or KYC information here. */
window.RAWR_DEMO_DATA = {
    users: [
        { id: 1048, username: 'LionKing', email: 'lionking@example.test', balance: 5234.56, tickets: 182, status: 'Active', kyc: 'Approved', joined: '2025-01-12' },
        { id: 1047, username: 'SavannaQueen', email: 'savanna@example.test', balance: 4892.33, tickets: 92, status: 'Active', kyc: 'Pending', joined: '2025-01-11' },
        { id: 1046, username: 'JungleAlpha', email: 'alpha@example.test', balance: 4521.87, tickets: 74, status: 'Active', kyc: 'Pending', joined: '2025-01-10' },
        { id: 1045, username: 'BeastMaster', email: 'beast@example.test', balance: 3987.42, tickets: 63, status: 'Suspended', kyc: 'Rejected', joined: '2025-01-09' },
        { id: 1044, username: 'WildRoar', email: 'wildroar@example.test', balance: 3654.11, tickets: 55, status: 'Active', kyc: 'Not submitted', joined: '2025-01-08' }
    ],
    kycRequests: [
        { id: 'KYC-2408', username: 'SavannaQueen', type: 'Passport', submitted: '2025-01-11', status: 'Pending' },
        { id: 'KYC-2407', username: 'JungleAlpha', type: 'National ID', submitted: '2025-01-10', status: 'Pending' },
        { id: 'KYC-2392', username: 'BeastMaster', type: 'Driver License', submitted: '2025-01-04', status: 'Rejected' }
    ],
    transactions: [
        { date: 'Today, 10:42 AM', type: 'Daily reward', amount: '+15 RAWR', status: 'Complete' },
        { date: 'Yesterday, 8:16 PM', type: 'Token conversion', amount: '-100 RAWR', status: 'Complete' },
        { date: 'Yesterday, 8:16 PM', type: 'Ticket conversion', amount: '+5 Tickets', status: 'Complete' }
    ],
    leaderboard: [
        { name: 'LionKing', score: 5234.56 }, { name: 'SavannaQueen', score: 4892.33 },
        { name: 'JungleAlpha', score: 4521.87 }, { name: 'BeastMaster', score: 3987.42 },
        { name: 'WildRoar', score: 3654.11 }
    ],
    stats: { totalUsers: 1247, activeUsers: 1195, pendingKyc: 23, gamesPlayed: 8934 }
};
