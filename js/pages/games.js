(() => {
  const game = document.body.dataset.game;
  const gameNames = {
    slots: 'Jungle Slots',
    roulette: 'Safari Roulette',
    'finding-simba': 'Finding Simba',
    dice: 'Dice of Beast',
    prowl: "Lion's Prowl"
  };
  const gameResult = document.getElementById('game-result');
  const betInput = document.getElementById('bet-amount');
  const number = value => formatDemoNumber(value);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));

  function renderHistory() {
    const history = document.getElementById('game-history');
    if (!history) return;
    const entries = (DemoState.gameHistory || []).filter(entry => entry.name === gameNames[game]).slice(0, 6);
    if (game === 'dice') {
      history.innerHTML = entries.map(entry => {
        const icon = entry.historyIcon || '🐺';
        const beastClass = icon === '🦁' ? 'history-lion' : icon === '🐅' ? 'history-tiger' : 'history-wolf';
        const resultClass = entry.won ? 'history-result-win' : 'history-result-loss';
        return `<div class="history-item ${beastClass} ${resultClass}" title="${escapeHtml(entry.outcome || (entry.won ? 'Win' : 'Loss'))}">${escapeHtml(icon)}</div>`;
      }).join('');
      return;
    }
    history.innerHTML = entries.map(entry => `
      <div class="history-item">
        <div class="history-icon ${entry.kind === 'spins' ? 'history-spins' : entry.won ? 'history-win' : 'history-loss'}"><i class="fas ${entry.kind === 'spins' ? 'fa-sync-alt' : entry.won ? 'fa-coins' : 'fa-times-circle'}" aria-hidden="true"></i></div>
        <div class="history-details">
          <div class="history-outcome">${escapeHtml(entry.outcome || (entry.kind === 'spins' ? 'Free Spins' : entry.won ? 'Win' : 'Loss'))}</div>
          <div class="history-value">${escapeHtml(entry.detail || entry.date || 'Recent play')}</div>
        </div>
        <div class="history-amount ${entry.kind === 'spins' ? 'spins' : entry.won ? 'win' : 'loss'}">${escapeHtml(entry.text)}</div>
      </div>`).join('');
  }

  function setResult(message) {
    if (gameResult) gameResult.textContent = message;
  }

  function setTicketBalance() {
    document.getElementById('game-ticket-balance')?.replaceChildren(document.createTextNode(number(DemoState.ticketBalance)));
    document.getElementById('game-lobby-tickets')?.replaceChildren(document.createTextNode(number(DemoState.ticketBalance)));
    if (betInput) betInput.max = String(Math.max(1, Math.min(1000, Math.floor(DemoState.ticketBalance))));
    window.refreshDemoBalances?.();
  }

  function gameBet() {
    const amount = Math.floor(Number(betInput?.value) || 0);
    if (amount < 1) {
      demoNotice('Enter a valid bet amount.', 'error');
      return 0;
    }
    if (amount > DemoState.ticketBalance) {
      demoNotice('Insufficient tickets!', 'error');
      return 0;
    }
    DemoState.ticketBalance -= amount;
    saveDemoState();
    setTicketBalance();
    return amount;
  }

  function settleGame(name, bet, payout, result, options = {}) {
    const {
      won = payout > 0,
      historyText = null,
      historyIcon = null,
      kind = 'tickets',
      outcome = null,
      detail = null
    } = options;
    if (payout > 0) DemoState.ticketBalance += payout;
    const displayText = historyText || (payout > 0 ? `+${number(payout)} tickets` : `-${number(bet)} tickets`);
    DemoState.gameHistory = DemoState.gameHistory || [];
    DemoState.gameHistory.unshift({
      name,
      won,
      text: displayText,
      date: new Date().toLocaleString(),
      historyIcon,
      kind,
      outcome,
      detail
    });
    DemoState.gameHistory = DemoState.gameHistory.slice(0, 12);
    saveDemoState();
    setTicketBalance();
    const lastWin = document.getElementById('last-win-display');
    if (lastWin) lastWin.textContent = number(payout);
    setResult(result);
    renderHistory();
    demoNotice(payout > 0 ? `You won ${number(payout)} tickets!` : result, payout > 0 ? 'success' : 'info');
  }

  function setBet(value, selectedButton = null) {
    if (!betInput) return;
    const amount = Math.max(1, Math.floor(Number(value) || 1));
    betInput.value = String(amount);
    const display = document.getElementById('bet-display');
    if (display) display.textContent = number(amount);
    document.querySelectorAll('[data-bet-value]').forEach(button => {
      button.classList.toggle('active', selectedButton ? button === selectedButton : Number(button.dataset.betValue) === amount);
    });
  }

  setTicketBalance();
  document.querySelectorAll('[data-bet-value]').forEach(button => button.addEventListener('click', () => {
    setBet(button.dataset.betValue, button);
  }));
  document.querySelector('[data-bet-max]')?.addEventListener('click', event => {
    setBet(Math.max(1, Math.floor(DemoState.ticketBalance)), event.currentTarget);
  });
  betInput?.addEventListener('input', () => {
    const display = document.getElementById('bet-display');
    if (display) display.textContent = number(betInput.value || 0);
    document.querySelectorAll('[data-bet-value]').forEach(button => button.classList.remove('active'));
  });
  renderHistory();

  // Jungle Slots: draw the PHP game's three-reel canvas locally in the browser.
  if (game === 'slots') {
    const canvas = document.getElementById('slotCanvas');
    const context = canvas?.getContext('2d');
    const symbols = [
      { symbol: '🦁', color: '#ffec4b', weight: 1 },
      { symbol: '💎', color: '#a5f3fc', weight: 15 },
      { symbol: '👑', color: '#fde68a', weight: 15 },
      { symbol: '🐵', color: '#fda4af', weight: 20 },
      { symbol: '🐗', color: '#d8b4fe', weight: 25 },
      { symbol: '🐯', color: '#bef264', weight: 24 }
    ];
    const pickSymbol = () => {
      let roll = Math.random() * symbols.reduce((sum, item) => sum + item.weight, 0);
      for (const symbol of symbols) {
        if (roll < symbol.weight) return symbol;
        roll -= symbol.weight;
      }
      return symbols[0];
    };
    let reels = Array.from({ length: 3 }, () => Array.from({ length: 4 }, pickSymbol));
    let slotBusy = false;
    let autoSpin = false;
    const spinButton = document.getElementById('spin-slots');
    const autoButton = document.getElementById('auto-spin-slots');

    function drawReels() {
      if (!context || !canvas) return;
      const reelWidth = canvas.width / 3;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = 'bold 70px Arial';
      reels.forEach((reel, reelIndex) => {
        context.fillStyle = 'rgba(0, 0, 0, 0.3)';
        context.fillRect(reelIndex * reelWidth, 0, reelWidth, canvas.height);
        context.strokeStyle = 'rgba(251, 191, 36, 0.5)';
        context.lineWidth = 4;
        context.strokeRect(reelIndex * reelWidth, 0, reelWidth, canvas.height);
        reel.forEach((symbol, row) => {
          context.fillStyle = symbol.color;
          context.fillText(symbol.symbol, reelIndex * reelWidth + reelWidth / 2, row * 100 + 50);
        });
      });
    }

    function runSpin() {
      if (slotBusy) return;
      const bet = gameBet();
      if (!bet) {
        autoSpin = false;
        autoButton?.classList.remove('active');
        if (autoButton) autoButton.querySelector('span').textContent = 'Auto Spin';
        return;
      }
      slotBusy = true;
      if (spinButton) spinButton.disabled = true;
      const started = Date.now();
      const timer = window.setInterval(() => {
        reels = Array.from({ length: 3 }, () => Array.from({ length: 4 }, pickSymbol));
        drawReels();
        if (Date.now() - started < 850) return;
        window.clearInterval(timer);
        const result = Array.from({ length: 3 }, pickSymbol);
        result.forEach((symbol, index) => { reels[index][1] = symbol; });
        drawReels();

        let payout = 0;
        if (result.every(symbol => symbol === symbols[0])) payout = 50000;
        else if (result.every(symbol => symbol === result[0])) {
          payout = bet * ([0, 1000, 500, 300, 200, 150][symbols.indexOf(result[0])] || 0);
        } else if (result[0] === symbols[0] && result[1] === symbols[0]) payout = bet * 50;
        else if (result.some(symbol => symbol === symbols[0])) payout = bet * 5;

        const outcome = payout > 0 ? `Reels: ${result.map(symbol => symbol.symbol).join(' ')}.` : `No winning combination: ${result.map(symbol => symbol.symbol).join(' ')}.`;
        settleGame(gameNames.slots, bet, payout, outcome, { detail: result.map(symbol => symbol.symbol).join(' ') });
        slotBusy = false;
        if (spinButton) spinButton.disabled = false;
        if (autoSpin && DemoState.ticketBalance > 0) window.setTimeout(runSpin, 600);
        else if (autoSpin) {
          autoSpin = false;
          autoButton?.classList.remove('active');
          if (autoButton) autoButton.querySelector('span').textContent = 'Auto Spin';
        }
      }, 100);
    }

    drawReels();
    document.getElementById('slotForm')?.addEventListener('submit', event => {
      event.preventDefault();
      runSpin();
    });
    autoButton?.addEventListener('click', () => {
      autoSpin = !autoSpin;
      autoButton.classList.toggle('active', autoSpin);
      autoButton.querySelector('span').textContent = autoSpin ? 'Stop Auto' : 'Auto Spin';
      if (autoSpin && !slotBusy) runSpin();
    });
  }

  // Safari Roulette: canvas slices, outcomes, multipliers, and free spins.
  if (game === 'roulette') {
    const canvas = document.getElementById('rouletteCanvas');
    const context = canvas?.getContext('2d');
    const sections = [
      { outcome: '20X', type: 'multiplier', value: 20, color: '#9C27B0' },
      { outcome: 'LOSE', type: 'loss', value: 0, color: '#f44336' },
      { outcome: '+1 SPIN', type: 'spins', value: 1, color: '#00BCD4' },
      { outcome: '2X', type: 'multiplier', value: 2, color: '#FFC107' },
      { outcome: 'LOSE', type: 'loss', value: 0, color: '#f44336' },
      { outcome: '5X', type: 'multiplier', value: 5, color: '#4CAF50' },
      { outcome: '+2 SPINS', type: 'spins', value: 2, color: '#2196F3' },
      { outcome: 'LOSE', type: 'loss', value: 0, color: '#f44336' },
      { outcome: '10X', type: 'multiplier', value: 10, color: '#E91E63' },
      { outcome: 'LOSE', type: 'loss', value: 0, color: '#f44336' },
      { outcome: '+3 SPINS', type: 'spins', value: 3, color: '#03A9F4' },
      { outcome: '3X', type: 'multiplier', value: 3, color: '#FF9800' },
      { outcome: 'LOSE', type: 'loss', value: 0, color: '#f44336' },
      { outcome: '2X', type: 'multiplier', value: 2, color: '#FFC107' },
      { outcome: '+1 SPIN', type: 'spins', value: 1, color: '#00BCD4' },
      { outcome: 'LOSE', type: 'loss', value: 0, color: '#f44336' }
    ];
    const angle = Math.PI * 2 / sections.length;
    let rotation = 0;
    let freeSpins = 0;
    let wheelBusy = false;
    let autoSpin = false;
    const spinButton = document.getElementById('spin-wheel');
    const autoButton = document.getElementById('auto-spin-wheel');
    const freeSpinsDisplay = document.getElementById('free-spins-display');
    const drawWheel = currentRotation => {
      if (!canvas || !context) return;
      const radius = canvas.width / 2;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.save();
      context.translate(radius, radius);
      sections.forEach((section, index) => {
        const start = index * angle + currentRotation;
        const end = start + angle;
        context.beginPath();
        context.moveTo(0, 0);
        context.arc(0, 0, radius - 2, start, end);
        context.closePath();
        context.fillStyle = section.color;
        context.fill();
        context.strokeStyle = '#1a1a1a';
        context.lineWidth = 2;
        context.stroke();
        context.save();
        context.rotate(start + angle / 2);
        context.fillStyle = '#fff';
        context.font = 'bold 18px Poppins, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(section.outcome, radius * .69, 0);
        context.restore();
      });
      context.restore();
    };
    const chooseOutcome = () => {
      const outcomes = [
        ['LOSE', .695], ['2X', .105], ['+1 SPIN', .105], ['3X', .025],
        ['+2 SPINS', .025], ['5X', .015], ['+3 SPINS', .015], ['10X', .01], ['20X', .005]
      ];
      let roll = Math.random();
      let cumulative = 0;
      for (const [label, probability] of outcomes) {
        cumulative += probability;
        if (roll <= cumulative) return label;
      }
      return 'LOSE';
    };
    const updateFreeSpins = () => {
      if (freeSpinsDisplay) freeSpinsDisplay.textContent = String(freeSpins);
    };
    function spinWheel() {
      if (wheelBusy) return;
      const usingFreeSpin = freeSpins > 0;
      const bet = Math.floor(Number(betInput?.value) || 0);
      if (bet < 1) return demoNotice('Enter a valid bet amount.', 'error');
      if (usingFreeSpin) {
        freeSpins -= 1;
        updateFreeSpins();
      } else if (!gameBet()) {
        autoSpin = false;
        autoButton?.classList.remove('active');
        if (autoButton) autoButton.textContent = 'Auto Spin';
        return;
      }

      const outcome = chooseOutcome();
      const matches = sections.map((section, index) => section.outcome === outcome ? index : -1).filter(index => index >= 0);
      const winningIndex = matches[Math.floor(Math.random() * matches.length)];
      const targetOffset = -winningIndex * angle - angle / 2;
      const targetTurn = ((targetOffset - rotation) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      const startRotation = rotation;
      const endRotation = rotation + Math.PI * 2 * (6 + Math.floor(Math.random() * 3)) + targetTurn;
      const startTime = performance.now();
      const duration = 2600;
      wheelBusy = true;
      if (spinButton) spinButton.disabled = true;
      const animate = now => {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - progress, 4);
        rotation = startRotation + (endRotation - startRotation) * eased;
        drawWheel(rotation);
        if (progress < 1) return requestAnimationFrame(animate);

        rotation = endRotation;
        drawWheel(rotation);
        wheelBusy = false;
        if (spinButton) spinButton.disabled = false;
        const section = sections[winningIndex];
        let payout = 0;
        let won = false;
        let historyText = null;
        let message;
        if (section.type === 'multiplier') {
          payout = bet * section.value;
          won = true;
          message = `The wheel landed on ${section.outcome}. You won ${number(payout)} tickets!`;
        } else if (section.type === 'spins') {
          freeSpins += section.value;
          updateFreeSpins();
          won = true;
          historyText = `+${section.value} free spin${section.value === 1 ? '' : 's'}`;
          message = `The wheel landed on ${section.outcome}. Free spins: ${freeSpins}.`;
        } else {
          message = `The wheel landed on LOSE. ${usingFreeSpin ? 'Your free spin is used.' : `You lost ${number(bet)} tickets.`}`;
        }
        settleGame(gameNames.roulette, bet, payout, message, {
          won,
          kind: historyText ? 'spins' : 'tickets',
          outcome: historyText ? 'Free Spins' : section.outcome,
          detail: new Date().toLocaleTimeString(),
          historyText: historyText || (usingFreeSpin && payout === 0 ? 'Free spin used' : null)
        });
        if (autoSpin && (freeSpins > 0 || DemoState.ticketBalance > 0)) window.setTimeout(spinWheel, 650);
        else if (autoSpin) {
          autoSpin = false;
          autoButton?.classList.remove('active');
          if (autoButton) autoButton.textContent = 'Auto Spin';
        }
      };
      requestAnimationFrame(animate);
    }

    drawWheel(rotation);
    spinButton?.addEventListener('click', spinWheel);
    autoButton?.addEventListener('click', () => {
      autoSpin = !autoSpin;
      autoButton.classList.toggle('active', autoSpin);
      autoButton.textContent = autoSpin ? 'Stop Auto' : 'Auto Spin';
      if (autoSpin && !wheelBusy) spinWheel();
    });
  }

  // Finding Simba: three themed cards, one hidden lion, and the PHP 3x reward.
  if (game === 'finding-simba') {
    let simbaIndex = Math.floor(Math.random() * 3);
    let roundActive = false;
    let roundBet = 0;
    const playButton = document.getElementById('play-finding');
    const cards = [...document.querySelectorAll('[data-card]')];
    const cardsContainer = document.getElementById('cardsContainer');
    playButton?.addEventListener('click', () => {
      if (roundActive) return;
      const bet = gameBet();
      if (!bet) return;
      roundBet = bet;
      simbaIndex = Math.floor(Math.random() * 3);
      roundActive = false;
      if (playButton) playButton.disabled = true;
      cardsContainer?.classList.add('shuffling-mode');
      cards.forEach(card => {
        card.classList.remove('simba', 'flipped');
        card.classList.add('shuffling');
        const content = card.querySelector('.card-content');
        if (content) content.textContent = '🚫';
      });
      cards.forEach((card, index) => {
        window.setTimeout(() => {
          card.style.animation = 'liftCard .5s ease-in-out';
          window.setTimeout(() => { card.style.animation = ''; }, 500);
        }, index * 100);
      });
      window.setTimeout(() => {
        cardsContainer?.classList.remove('shuffling-mode');
        cards.forEach(card => {
          card.classList.remove('shuffling');
        });
        roundActive = true;
        setResult('The cards are ready. Choose one to find Simba.');
      }, 1100);
    });
    document.querySelectorAll('[data-card]').forEach(card => card.addEventListener('click', () => {
      if (!roundActive) return;
      const choice = Number(card.dataset.card);
      cards.forEach((c, index) => {
        const cardIndex = index + 1; // data-card starts at 1
        const content = c.querySelector('.card-content');
        if (content) content.textContent = cardIndex === simbaIndex ? '🦁' : ['🐘', '🐆', '🐒'][index];
        c.classList.toggle('simba', cardIndex === simbaIndex);
        c.classList.add('flipped');
      });
      const won = choice === simbaIndex;
      settleGame(gameNames['finding-simba'], roundBet, won ? roundBet * 3 : 0, won ? 'You found Simba!' : 'No Simba on that card.', {
        outcome: won ? 'Win' : 'Loss',
        detail: won ? 'Simba found' : 'Simba was hiding'
      });
      roundActive = false;
      roundBet = 0;
      if (playButton) playButton.disabled = false;
    }));
  }

  // Dice of Beast: one lion face, two tiger faces, and three wolf faces.
  if (game === 'dice') {
    const die = document.getElementById('dice');
    const rollButton = document.getElementById('roll-beast');
    let selectedBeast = '';
    let totalRolls = 0;
    const payouts = { lion: 5, tiger: 3, wolf: 2 };
    const faceOutcomes = [
      { beast: 'lion', rotation: [0, 0] },
      { beast: 'tiger', rotation: [0, 180] },
      { beast: 'wolf', rotation: [0, -90] },
      { beast: 'wolf', rotation: [0, 90] },
      { beast: 'tiger', rotation: [-90, 0] },
      { beast: 'wolf', rotation: [90, 0] }
    ];
    document.querySelectorAll('[data-beast]').forEach(button => button.addEventListener('click', () => {
      selectedBeast = button.dataset.beast;
      document.querySelectorAll('[data-beast]').forEach(card => {
        const selected = card === button;
        card.classList.toggle('selected', selected);
        card.setAttribute('aria-pressed', String(selected));
      });
      if (rollButton) rollButton.disabled = false;
      setResult(`${button.querySelector('.animal-name')?.textContent || selectedBeast} selected. Place your bet and roll.`);
    }));
    rollButton?.addEventListener('click', () => {
      if (!selectedBeast || rollButton.disabled) return;
      const bet = gameBet();
      if (!bet) return;
      rollButton.disabled = true;
      document.querySelectorAll('[data-beast]').forEach(button => { button.disabled = true; });
      const face = faceOutcomes[Math.floor(Math.random() * faceOutcomes.length)];
      if (die) {
        const [x, y] = face.rotation;
        die.style.transform = `rotateX(${720 + x}deg) rotateY(${720 + y}deg)`;
      }
      window.setTimeout(() => {
        totalRolls += 1;
        const totalRollsDisplay = document.getElementById('total-rolls-display');
        if (totalRollsDisplay) totalRollsDisplay.textContent = number(totalRolls);
        const won = face.beast === selectedBeast;
        const payout = won ? bet * payouts[selectedBeast] : 0;
        const name = face.beast[0].toUpperCase() + face.beast.slice(1);
        const beastIcons = { lion: '🦁', tiger: '🐅', wolf: '🐺' };
        settleGame(gameNames.dice, bet, payout, `The die revealed a ${name}. ${won ? `You won ${number(payout)} tickets!` : `You lost ${number(bet)} tickets.`}`, {
          historyIcon: beastIcons[face.beast],
          outcome: won ? `Won on ${name}` : `${name} · loss`
        });
        document.querySelectorAll('[data-beast]').forEach(button => { button.disabled = false; });
        rollButton.disabled = false;
      }, 1800);
    });
  }

  // Lion's Prowl: source-themed 5×5 field with hidden dangers and local cash-out.
  if (game === 'prowl') {
    const board = document.getElementById('gameGrid');
    const cashOutButton = document.getElementById('cash-out');
    const newGameButton = document.getElementById('new-prowl');
    const currentPrize = document.getElementById('current-prize');
    const currentMultiplier = document.getElementById('current-multiplier');
    let dangerTiles = new Set();
    let prowlStarted = false;
    let prowlBet = 0;
    let safeTiles = 0;

    function buildBoard() {
      if (!board) return;
      board.replaceChildren();
      for (let index = 0; index < 25; index += 1) {
        const tile = document.createElement('button');
        tile.type = 'button';
        tile.className = 'grid-cell';
        tile.dataset.prowlTile = String(index);
        tile.setAttribute('aria-label', `Explore tile ${index + 1}`);
        board.appendChild(tile);
      }
    }

    function prepareProwl() {
      dangerTiles = new Set();
      while (dangerTiles.size < 6) dangerTiles.add(Math.floor(Math.random() * 25));
      prowlStarted = false;
      prowlBet = 0;
      safeTiles = 0;
      board?.querySelectorAll('.grid-cell').forEach(tile => {
        tile.disabled = false;
        tile.className = 'grid-cell';
        tile.textContent = '';
      });
      if (currentPrize) currentPrize.textContent = '0.00';
      if (currentMultiplier) currentMultiplier.textContent = '1x';
      if (cashOutButton) cashOutButton.disabled = true;
      if (newGameButton) newGameButton.disabled = false;
      setResult('Choose your bet, then explore the savanna.');
    }

    buildBoard();
    prepareProwl();
    board?.addEventListener('click', event => {
      const tile = event.target.closest('[data-prowl-tile]');
      if (!tile || tile.disabled) return;
      if (!prowlStarted) {
        prowlBet = gameBet();
        if (!prowlBet) return;
        prowlStarted = true;
        if (newGameButton) newGameButton.disabled = true;
      }
      tile.disabled = true;
      tile.classList.add('revealed');
      if (dangerTiles.has(Number(tile.dataset.prowlTile))) {
        tile.classList.add('lion');
        tile.textContent = '🦁';
        board.querySelectorAll('.grid-cell').forEach((cell, index) => {
          if (dangerTiles.has(index)) {
            cell.disabled = true;
            cell.classList.add('revealed', 'lion');
            cell.textContent = '🦁';
          }
        });
        settleGame(gameNames.prowl, prowlBet, 0, 'A lion appeared! This round is over.');
        prowlStarted = false;
        prowlBet = 0;
        if (cashOutButton) cashOutButton.disabled = true;
        if (newGameButton) newGameButton.disabled = false;
        return;
      }
      tile.classList.add(safeTiles % 2 === 0 ? 'cash' : 'multiplier');
      tile.textContent = safeTiles % 2 === 0 ? '💰' : '✨';
      safeTiles += 1;
      const multiplier = 1 + safeTiles * .5;
      const prize = Math.floor(prowlBet * multiplier);
      if (currentPrize) currentPrize.textContent = number(prize);
      if (currentMultiplier) currentMultiplier.textContent = `${multiplier.toFixed(1).replace(/\.0$/, '')}x`;
      if (cashOutButton) cashOutButton.disabled = false;
      setResult(`Safe tile! Current prize: ${number(prize)} tickets.`);
    });
    cashOutButton?.addEventListener('click', () => {
      if (!prowlStarted || safeTiles === 0) return;
      const multiplier = 1 + safeTiles * .5;
      const payout = Math.floor(prowlBet * multiplier);
      settleGame(gameNames.prowl, prowlBet, payout, `You collected ${number(payout)} tickets at ${multiplier}x.`);
      prowlStarted = false;
      prowlBet = 0;
      cashOutButton.disabled = true;
      if (newGameButton) newGameButton.disabled = false;
      board?.querySelectorAll('.grid-cell').forEach(tile => { tile.disabled = true; });
    });
    newGameButton?.addEventListener('click', () => {
      if (prowlStarted) return;
      prepareProwl();
    });
  }
})();
