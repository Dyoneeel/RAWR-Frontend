(() => {
  const missionsRoot = document.getElementById('daily-missions');
  const achievementsRoot = document.getElementById('achievements');
  if (!missionsRoot || !achievementsRoot) return;

  const challenges = [
    { name: 'Daily Login', desc: 'Log in 3 days in a row', current: 3, target: 3, reward: 100, type: 'Tickets', group: 'mission', icon: 'fa-calendar-check', route: 'pages/dashboard/index.html' },
    { name: 'Daily Mining', desc: 'Mine at least 10 RAWR tokens today', current: 4, target: 10, reward: 25, type: 'RAWR', group: 'mission', icon: 'fa-coins', route: 'pages/mining/index.html' },
    { name: 'Casino Enthusiast', desc: 'Play 3 casino games today', current: 1, target: 3, reward: 15, type: 'Tickets', group: 'mission', icon: 'fa-dice', route: 'pages/games/index.html' },
    { name: 'Referral Master', desc: 'Refer 10 new players', current: 1, target: 10, reward: 50, type: 'RAWR', group: 'mission', icon: 'fa-users', route: 'pages/dashboard/index.html' },
    { name: 'Big Spender', desc: 'Spend 1,000 tickets in the casino', current: 250, target: 1000, reward: 100, type: 'Tickets', group: 'mission', icon: 'fa-ticket-alt', route: 'pages/games/index.html' },
    { name: 'Mining Master', desc: 'Mine 500 RAWR tokens', current: 126, target: 500, reward: 500, type: 'Tickets', group: 'achievement', icon: 'fa-mountain' },
    { name: 'Game Enthusiast', desc: 'Play 10 games', current: 4, target: 10, reward: 150, type: 'Tickets', group: 'achievement', icon: 'fa-gamepad' },
    { name: 'RAWR Millionaire', desc: 'Accumulate 1,000,000 RAWR tokens', current: 250, target: 1000000, reward: 1000, type: 'RAWR', group: 'achievement', icon: 'fa-gem' },
    { name: 'Casino Royal', desc: 'Win 100 casino games', current: 2, target: 100, reward: 500, type: 'Tickets', group: 'achievement', icon: 'fa-crown' },
    { name: 'Jungle King', desc: 'Become the #1 player on the leaderboard', current: 0, target: 1, reward: 200, type: 'RAWR', group: 'achievement', icon: 'fa-trophy' },
    { name: 'Loyal Lion', desc: 'Maintain a 30-day login streak', current: Number(DemoState.loginStreak) || 3, target: 30, reward: 100, type: 'Tickets', group: 'achievement', icon: 'fa-fire' }
  ];
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));

  function renderChallenge(challenge) {
    const claimed = Boolean(DemoState.challengeClaims?.[challenge.name]);
    const completed = challenge.current >= challenge.target;
    const ready = completed && !claimed;
    const card = document.createElement('article');
    card.className = 'challenge-card';
    if (ready) card.insertAdjacentHTML('beforeend', '<span class="achievement-badge">Reward Ready!</span>');
    else if (claimed) card.insertAdjacentHTML('beforeend', '<span class="achievement-badge">Completed</span>');
    const progress = Math.max(0, Math.min(100, challenge.current / challenge.target * 100));
    const action = ready
      ? `<button type="button" class="challenge-btn claim-btn" data-claim="${escapeHtml(challenge.name)}"><i class="fas fa-gift" aria-hidden="true"></i> Claim Reward</button>`
      : claimed
        ? '<button type="button" class="challenge-btn" disabled><i class="fas fa-check-circle" aria-hidden="true"></i> Claimed</button>'
        : `<a class="challenge-btn" href="${challenge.route || 'pages/games/index.html'}">Continue</a>`;
    card.insertAdjacentHTML('beforeend', `
      <div class="challenge-header">
        <div class="challenge-icon"><i class="fas ${challenge.icon}" aria-hidden="true"></i></div>
        <h3 class="challenge-title">${escapeHtml(challenge.name)}</h3>
      </div>
      <p class="challenge-desc">${escapeHtml(challenge.desc)}</p>
      <div class="progress-container" role="progressbar" aria-valuemin="0" aria-valuemax="${challenge.target}" aria-valuenow="${Math.min(challenge.current, challenge.target)}">
        <div class="progress-bar" style="width:${progress}%"></div>
        <span class="progress-text">${challenge.current.toLocaleString()}/${challenge.target.toLocaleString()}</span>
      </div>
      <div class="challenge-reward"><i class="fas ${challenge.type === 'RAWR' ? 'fa-coins' : 'fa-ticket-alt'}" aria-hidden="true"></i> Reward: ${challenge.reward.toLocaleString()} ${challenge.type}</div>
      ${action}`);
    card.querySelector('[data-claim]')?.addEventListener('click', () => {
      DemoState.challengeClaims = DemoState.challengeClaims || {};
      DemoState.challengeClaims[challenge.name] = true;
      if (challenge.type === 'RAWR') DemoState.rawrBalance += challenge.reward;
      else DemoState.ticketBalance += challenge.reward;
      saveDemoState();
      refreshDemoBalances();
      demoNotice(`Reward claimed for ${challenge.name}.`, 'success');
      renderAll();
    });
    return card;
  }

  function renderAll() {
    missionsRoot.replaceChildren(...challenges.filter(challenge => challenge.group === 'mission').map(renderChallenge));
    achievementsRoot.replaceChildren(...challenges.filter(challenge => challenge.group === 'achievement').map(renderChallenge));
  }

  renderAll();
})();
