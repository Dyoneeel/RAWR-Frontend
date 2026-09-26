(function () {
  const accountStorageKey = 'rawr_demo_accounts_v1';
  const sessionStorageKey = 'rawr_demo_session';
  const accountStateKey = accountId => `rawr_demo_account_state:${accountId}`;
  const hardcodedSuperadmin = Object.freeze({
    id: 'rawr-demo-superadmin-v1',
    username: 'superadmin',
    email: 'superadmin@rawr-demo.test',
    password: 'RawrAdmin2026!',
    referralCode: 'RAWR-SUPERADMIN',
    role: 'superadmin',
    createdAt: '2026-01-01T00:00:00.000Z'
  });
  const defaults = () => ({
    accountId: null,
    currentUser: null,
    role: 'player',
    isLoggedIn: false,
    rememberMe: false,
    rawrBalance: 250,
    ticketBalance: 50,
    miningLevel: 2,
    totalMined: 1234.56,
    loginStreak: 3,
    lastMineTime: Date.now() - 1800000,
    gameHistory: [],
    miningHistory: [],
    transactions: [],
    claimedRewardDays: [1, 2, 3],
    challengeClaims: {},
    profile: null
  });
  const readJson = (storage, key, fallback) => {
    try {
      const value = storage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (_) {
      return fallback;
    }
  };
  const accounts = readJson(localStorage, accountStorageKey, []);
  const registeredAccounts = Array.isArray(accounts) ? accounts : [];
  const findAccount = accountId => accountId === hardcodedSuperadmin.id
    ? hardcodedSuperadmin
    : registeredAccounts.find(account => account.id === accountId);
  const savedGlobal = readJson(localStorage, 'rawr_state', {}) || {};
  const savedAccount = savedGlobal.accountId
    ? readJson(localStorage, accountStateKey(savedGlobal.accountId), null)
    : null;
  const saved = Object.assign({}, savedAccount || {}, savedGlobal);
  const savedAccountRecord = findAccount(saved.accountId);
  const accountExists = Boolean(savedAccountRecord);
  const savedSession = readJson(sessionStorage, sessionStorageKey, null);
  const hasPersistentSession = Boolean(saved.rememberMe && savedGlobal.isLoggedIn);
  const hasTabSession = Boolean(!saved.rememberMe && savedGlobal.isLoggedIn && savedSession?.accountId === saved.accountId);

  window.DemoState = Object.assign(defaults(), saved, {
    isLoggedIn: Boolean(accountExists && (hasPersistentSession || hasTabSession)),
    role: accountExists ? (savedAccountRecord.role || 'player') : 'player'
  });
  if (!window.DemoState.isLoggedIn) {
    window.DemoState.currentUser = null;
    window.DemoState.role = 'player';
  }

  window.RAWR_DEMO_SUPERADMIN = hardcodedSuperadmin;
  window.RAWR_DEMO_ACCOUNTS_KEY = accountStorageKey;
  window.RAWR_DEMO_SESSION_KEY = sessionStorageKey;
  window.demoAccountStateKey = accountStateKey;
  window.createDemoStateDefaults = defaults;
  window.getDemoAccounts = () => {
    const result = readJson(localStorage, accountStorageKey, []);
    const users = Array.isArray(result) ? result : [];
    return [hardcodedSuperadmin, ...users.filter(account => account.id !== hardcodedSuperadmin.id)];
  };
  window.isDemoSuperadmin = () => Boolean(
    window.hasDemoAccountSession() && findAccount(DemoState.accountId)?.role === 'superadmin'
  );
  window.hasDemoAccountSession = () => Boolean(
    DemoState.isLoggedIn && DemoState.accountId &&
    window.getDemoAccounts().some(account => account.id === DemoState.accountId)
  );
  window.saveDemoState = () => {
    try {
      if (DemoState.isLoggedIn && DemoState.accountId && !DemoState.rememberMe) {
        sessionStorage.setItem(sessionStorageKey, JSON.stringify({ accountId: DemoState.accountId }));
      } else if (DemoState.rememberMe || !DemoState.isLoggedIn) {
        sessionStorage.removeItem(sessionStorageKey);
      }

      if (DemoState.accountId) {
        const accountState = Object.assign({}, DemoState, {
          currentUser: null,
          isLoggedIn: false,
          rememberMe: false
        });
        localStorage.setItem(accountStateKey(DemoState.accountId), JSON.stringify(accountState));
      }
      localStorage.setItem('rawr_state', JSON.stringify(DemoState));
      return true;
    } catch (_) {
      return false;
    }
  };
  window.demoNotice = function (message, kind = 'info') {
    let notice = document.getElementById('demo-notice');
    if (!notice) {
      notice = document.createElement('div');
      notice.id = 'demo-notice';
      notice.className = 'demo-notice';
      notice.setAttribute('role', 'status');
      document.body.appendChild(notice);
    }
    notice.dataset.kind = kind;
    notice.classList.remove('success', 'error', 'info');
    notice.classList.add(kind);
    notice.textContent = message;
    notice.classList.add('visible');
    clearTimeout(window.demoNoticeTimer);
    window.demoNoticeTimer = setTimeout(() => notice.classList.remove('visible'), 4200);
  };
  window.formatDemoNumber = value => Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
})();
