(function () {
  const $ = id => document.getElementById(id);
  const baseRewardPerHour = 10;
  const baseCooldown = 60 * 60 * 1000;
  const maxUpgradeLevel = 10;
  const upgradeConfig = {
    shovel: { levelId: 'shovelLevel', costId: 'shovelCost', buttonId: 'upgradeShovel', baseCost: 15 },
    energy: { levelId: 'energyLevel', costId: 'energyCost', buttonId: 'upgradeEnergy', baseCost: 25 },
    pickaxe: { levelId: 'pickaxeLevel', costId: 'pickaxeCost', buttonId: 'upgradePickaxe', baseCost: 50 }
  };
  const storedUpgrades = DemoState.miningUpgrades || {};
  const upgrades = {
    shovel: Math.max(1, Number(storedUpgrades.shovel || DemoState.miningLevel || 1)),
    energy: Math.max(1, Number(storedUpgrades.energy || 1)),
    pickaxe: Math.max(1, Number(storedUpgrades.pickaxe || 1))
  };
  DemoState.miningUpgrades = upgrades;

  const cooldownForLevel = level => Math.ceil(baseCooldown * Math.pow(0.9, level - 1));
  const costFor = type => Math.ceil(upgradeConfig[type].baseCost * Math.pow(1.8, upgrades[type] - 1));
  const cycleDuration = () => cooldownForLevel(upgrades.energy);
  const cycleReward = () => baseRewardPerHour * upgrades.shovel * cycleDuration() / baseCooldown;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const toast = (message, kind = 'info') => {
    const container = $('miningToastContainer');
    if (!container) return demoNotice(message, kind);
    const item = document.createElement('div');
    item.className = `mining-toast ${kind}`;
    item.textContent = message;
    container.append(item);
    window.setTimeout(() => item.remove(), 2600);
  };

  function elapsedInCycle() {
    const startedAt = Number(DemoState.lastMineTime || 0);
    return startedAt > 0 ? Math.max(0, Date.now() - startedAt) : cycleDuration();
  }

  function isMining() {
    return Boolean(DemoState.lastMineTime) && elapsedInCycle() < cycleDuration();
  }

  function isRewardReady() {
    return !isMining();
  }

  function formatTime(ms) {
    const seconds = Math.max(0, Math.ceil(ms / 1000));
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function renderHistory() {
    const root = $('historyList');
    if (!root) return;
    const entries = Array.isArray(DemoState.miningHistory) ? DemoState.miningHistory.slice(0, 10) : [];
    root.innerHTML = entries.length ? entries.map(entry => `
      <div class="history-item"><div class="history-icon">⛏️</div><div class="history-details"><div class="history-description">Mined RAWR Tokens</div><div class="history-time">${escapeHtml(entry.date || '')}</div></div><div class="history-amount">+${Number(entry.amount || 0).toFixed(4)} RAWR</div></div>
    `).join('') : '<div class="history-item"><div class="history-icon">⛏️</div><div class="history-details"><div class="history-description">No mining activity yet.</div></div></div>';
  }

  function render() {
    const duration = cycleDuration();
    const running = isMining();
    const remaining = running ? Math.max(0, duration - elapsedInCycle()) : 0;
    const rate = baseRewardPerHour * upgrades.shovel;
    const reward = cycleReward();
    $('miningRate').textContent = `${rate.toFixed(2)} RAWR/hr`;
    $('currentRate').textContent = `${rate.toFixed(2)} RAWR/hr`;
    $('nextReward').textContent = `${reward.toFixed(2)} RAWR`;
    $('rewardAmount').textContent = reward.toFixed(2);
    $('totalMined').textContent = `${Number(DemoState.totalMined || 0).toFixed(4)} RAWR`;
    $('activeBoosts').textContent = `x${upgrades.shovel.toFixed(1)}`;
    $('timeLeft').textContent = running ? formatTime(remaining) : '00:00';
    $('miningProgress').style.width = `${running ? Math.min(100, elapsedInCycle() / duration * 100) : 0}%`;

    const startButton = $('mineButton');
    startButton.innerHTML = running ? '<i class="fas fa-sync-alt fa-spin" aria-hidden="true"></i> Mining...' : '<i class="fas fa-play" aria-hidden="true"></i> Start Mining';
    startButton.classList.toggle('pulse', running);
    const claimButton = $('claimReward');
    claimButton.classList.toggle('is-disabled', running);
    claimButton.setAttribute('aria-disabled', String(running));
    claimButton.title = running ? `Mining is active. Wait ${formatTime(remaining)}.` : 'Claim your completed mining reward.';

    Object.entries(upgradeConfig).forEach(([type, config]) => {
      $(config.levelId).textContent = String(upgrades[type]);
      $(config.costId).textContent = String(costFor(type));
      const button = $(config.buttonId);
      button.disabled = upgrades[type] >= maxUpgradeLevel;
      button.textContent = upgrades[type] >= maxUpgradeLevel ? 'Max Level' : 'Upgrade';
    });
    renderHistory();
    if (window.refreshDemoBalances) window.refreshDemoBalances();
  }

  $('mineButton')?.addEventListener('click', () => {
    if (isMining()) return toast('Mining is already in progress.', 'info');
    if (isRewardReady() && Number(DemoState.lastMineTime || 0) && elapsedInCycle() >= cycleDuration()) {
      return toast('Claim your completed reward before starting another cycle.', 'info');
    }
    DemoState.lastMineTime = Date.now();
    DemoState.miningUpgrades = upgrades;
    saveDemoState();
    render();
    toast('Mining started. Your lion is on the job!', 'success');
  });

  $('claimReward')?.addEventListener('click', () => {
    if (isMining()) return toast(`Mining is still active. Wait ${formatTime(cycleDuration() - elapsedInCycle())}.`, 'error');
    if (!Number(DemoState.lastMineTime || 0)) return toast('Start a mining cycle to earn a reward.', 'info');
    const reward = cycleReward();
    DemoState.rawrBalance = Number(DemoState.rawrBalance || 0) + reward;
    DemoState.totalMined = Number(DemoState.totalMined || 0) + reward;
    DemoState.miningHistory = Array.isArray(DemoState.miningHistory) ? DemoState.miningHistory : [];
    DemoState.miningHistory.unshift({ date: new Date().toLocaleString(), amount: reward });
    DemoState.lastMineTime = 0;
    DemoState.miningUpgrades = upgrades;
    saveDemoState();
    render();
    toast(`You mined ${reward.toFixed(2)} RAWR!`, 'success');
  });

  Object.entries(upgradeConfig).forEach(([type, config]) => {
    $(config.buttonId)?.addEventListener('click', () => {
      if (upgrades[type] >= maxUpgradeLevel) return;
      const cost = costFor(type);
      if (Number(DemoState.rawrBalance || 0) < cost) return toast(`Not enough RAWR. You need ${cost.toLocaleString()} RAWR.`, 'error');
      DemoState.rawrBalance = Number(DemoState.rawrBalance || 0) - cost;
      upgrades[type] += 1;
      DemoState.miningUpgrades = upgrades;
      if (type === 'shovel') DemoState.miningLevel = upgrades.shovel;
      saveDemoState();
      render();
      toast(`${type[0].toUpperCase()}${type.slice(1)} upgraded to Level ${upgrades[type]}!`, 'success');
    });
  });

  $('clearHistory')?.addEventListener('click', () => {
    DemoState.miningHistory = [];
    saveDemoState();
    renderHistory();
    toast('Mining history cleared.', 'info');
  });
  $('miningLion')?.addEventListener('click', () => toast('ROAR!', 'success'));

  render();
  const interval = window.setInterval(render, 1000);
  window.addEventListener('pagehide', () => window.clearInterval(interval), { once: true });
})();
