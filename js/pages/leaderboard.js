(() => {
  const list = document.getElementById('leaderboardList');
  const loadMore = document.getElementById('loadMoreBtn');
  const tabs = [...document.querySelectorAll('[data-tab]')];
  if (!list || !loadMore) return;

  const animals = ['🦁', '🐯', '🐅', '🐆', '🐘', '🦏', '🦒', '🦓', '🐃', '🐎'];
  const players = (window.RAWR_DEMO_DATA?.leaderboard || []).map((player, index) => ({
    username: player.name,
    tokens: Number(player.score) || 0,
    tickets: Math.max(0, Math.round((Number(player.score) || 0) / 3)),
    avatar: animals[index % animals.length],
    isCurrent: false
  }));
  const sampleNames = [
    'GoldenPaw', 'SavannaScout', 'MightyMane', 'WildWhisker', 'AmberRoar', 'JungleRunner',
    'PrideKeeper', 'SunsetLion', 'CleverCheetah', 'RiverRover', 'AcaciaAce', 'MarbleMane',
    'DawnPatrol', 'DustyPaws', 'RoaringStar', 'BaobabKing', 'QuickClaw', 'MoonlitPride',
    'SafariSpark', 'CanyonCat', 'BraveCub', 'GoldenStripe', 'SavannaSpirit', 'Lionhearted'
  ];
  sampleNames.forEach((name, index) => players.push({
    username: name,
    tokens: Math.max(125, 3400 - index * 128),
    tickets: 25 + ((index * 29) % 210),
    avatar: animals[(index + 5) % animals.length],
    isCurrent: false
  }));
  const currentName = DemoState.currentUser || 'DemoLion';
  const currentPlayer = {
    username: currentName,
    tokens: Number(DemoState.rawrBalance) || 0,
    tickets: Number(DemoState.ticketBalance) || 0,
    avatar: '🦁',
    isCurrent: true
  };
  const existingPlayer = players.find(player => player.username.toLowerCase() === currentName.toLowerCase());
  if (existingPlayer) Object.assign(existingPlayer, currentPlayer);
  else players.push(currentPlayer);

  let currentTab = 'tokens';
  let visibleCount = 15;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));

  function render() {
    const sorted = [...players].sort((a, b) => b[currentTab] - a[currentTab]);
    list.innerHTML = sorted.slice(0, visibleCount).map((player, index) => {
      const rank = index + 1;
      const rankClass = rank <= 3 ? ` rank-${rank}` : '';
      const tokenValue = Number(player.tokens).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const ticketValue = Number(player.tickets).toLocaleString('en-US');
      return `<div class="leaderboard-item fade-in${player.isCurrent ? ' current-user' : ''}" style="animation-delay:${index * 0.04}s">
        <div class="leaderboard-rank${rankClass}"><span class="rank-number">${rank}</span></div>
        <div class="leaderboard-user"><div class="user-avatar" aria-hidden="true">${player.avatar}</div><div class="user-name">${escapeHtml(player.username)}${player.isCurrent ? ' <span class="you-badge">YOU</span>' : ''}</div></div>
        <div class="user-stats"><div class="stat-value">${tokenValue}</div><div class="stat-label">RAWR</div></div>
        <div class="user-stats"><div class="stat-value">${ticketValue}</div><div class="stat-label">Tickets</div></div>
      </div>`;
    }).join('');
    loadMore.hidden = sorted.length <= visibleCount;
    loadMore.disabled = sorted.length <= visibleCount;
    loadMore.innerHTML = sorted.length <= visibleCount
      ? '<i class="fas fa-check" aria-hidden="true"></i> All Players Loaded'
      : '<i class="fas fa-chevron-down" aria-hidden="true"></i> Show More Players';
  }

  tabs.forEach(tab => tab.addEventListener('click', () => {
    currentTab = tab.dataset.tab === 'tickets' ? 'tickets' : 'tokens';
    visibleCount = 15;
    tabs.forEach(item => {
      const active = item === tab;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
    });
    render();
  }));
  loadMore.addEventListener('click', () => { visibleCount += 15; render(); });
  render();
})();
