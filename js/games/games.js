/* Local-only versions of the five public RAWR game screens. */
(function () {
    const gameInfo = {
        slots: { title: '🦁 Jungle Slots 🎰', art: 'slot-image.png', intro: 'Spin the reels filled with jungle animals. Match three lions for the jackpot, or other combinations for ticket wins.' },
        roulette: { title: 'Safari Roulette', art: 'roulette-image.png', intro: 'Pick a safari symbol and spin the wheel for multipliers up to 20× or free spins.' },
        'finding-simba': { title: 'Finding Simba', art: 'finding-simba.png', intro: 'Choose a covered card and find Simba to win a ticket prize.' },
        'dice-of-beast': { title: 'Dice of Beast', art: 'dob-image.png', intro: 'Choose your beast, roll the dice, and match the symbol for a ticket payout.' },
        'lions-prowl': { title: "Lion's Prowl", art: 'panthers-image.png', intro: 'Explore the savanna, reveal safe tiles, and cash out before you meet danger.' }
    };
    const symbols = ['🦁', '🐘', '🦒', '🐆', '🦓', '🐊'];

    window.playGame = function (gameName) {
        const key = gameName === 'lions-prowl' ? gameName : gameName;
        const game = gameInfo[key];
        if (!game) return;
        AppState.activeGame = key;
        AppState.gameBet = 10;
        AppState.gameHistory = AppState.gameHistory || [];
        if (key === 'finding-simba') AppState.simbaTarget = Math.floor(Math.random() * 6);
        if (location.hash !== `#/games/${key}`) location.hash = `/games/${key}`;
        loadDashboardContent('games');
        document.getElementById('game-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    window.renderGameDetail = function () {
        const key = AppState.activeGame;
        const game = gameInfo[key];
        if (!game) return '';
        const isBeast = key === 'dice-of-beast';
        const isProwl = key === 'lions-prowl';
        const isFind = key === 'finding-simba';
        let board = '';
        if (key === 'slots') board = `<div class="slot-reels" id="game-board"><span>🦒</span><span>🦁</span><span>🐘</span></div><div class="game-result" id="game-result" aria-live="polite">Set your bet and spin the reels.</div>`;
        if (key === 'roulette') board = `<div class="roulette-wheel" id="game-board"><span id="roulette-result">🦁</span></div><div class="symbol-picks">${symbols.slice(0, 4).map(s => `<button class="symbol-pick ${AppState.gamePick === s ? 'selected' : ''}" onclick="setGamePick('${s}')" aria-pressed="${AppState.gamePick === s}">${s}</button>`).join('')}</div><div class="game-result" id="game-result" aria-live="polite">Choose a symbol, then spin the wheel.</div>`;
        if (isFind) board = `<div class="simba-cards" id="game-board">${Array.from({length: 6}, (_, i) => `<button class="simba-card" onclick="revealSimbaCard(${i})" aria-label="Reveal card ${i + 1}">?</button>`).join('')}</div><div class="game-result" id="game-result" aria-live="polite">Pick one card to search for Simba.</div>`;
        if (isBeast) board = `<div class="beast-picks">${symbols.slice(0, 4).map(s => `<button class="beast-pick ${AppState.gamePick === s ? 'selected' : ''}" onclick="setGamePick('${s}')" aria-pressed="${AppState.gamePick === s}">${s}<small>${({ '🦁':'Lion', '🐘':'Elephant', '🦒':'Giraffe', '🐆':'Leopard' })[s]}</small></button>`).join('')}</div><div class="dice-stage" id="game-board"><span>🎲</span><span>🎲</span></div><div class="game-result" id="game-result" aria-live="polite">Choose your beast and roll.</div>`;
        if (isProwl) board = `<div class="prowl-board" id="game-board">${Array.from({length: 9}, (_, i) => `<button class="prowl-tile" id="prowl-${i}" onclick="revealProwlTile(${i})" aria-label="Explore tile ${i + 1}">🌿</button>`).join('')}</div><div class="game-result" id="game-result" aria-live="polite">Reveal safe tiles and collect a growing prize, or cash out.</div>`;
        const history = (AppState.gameHistory || []).slice(0, 5).map(item => `<li><span>${item.name}</span><strong class="${item.won ? 'win' : 'loss'}">${item.text}</strong></li>`).join('') || '<li class="empty-history">Your recent plays will appear here.</li>';
        return `<section class="game-detail-wrap" id="game-detail"><button class="game-back" onclick="closeGameDetail()">← All Games</button><div class="game-detail-head"><img src="assets/${game.art}" alt=""><div><h2>${game.title}</h2><p>${game.intro}</p></div><span class="demo-badge">DEMO</span></div><div class="game-layout"><div class="game-play-panel"><div class="game-wallet"><span>Available tickets</span><strong>${Number(AppState.ticketBalance).toFixed(0)} 🎟️</strong></div>${board}<div class="bet-row"><label for="game-bet">Bet Amount (Tickets)</label><input id="game-bet" type="number" min="1" max="${Math.max(1, AppState.ticketBalance)}" value="${AppState.gameBet || 10}" onchange="setGameBet(this.value)"><div class="quick-bets">${[1,10,25,50,100].map(n=>`<button onclick="setGameBet(${n})">${n}</button>`).join('')}<button onclick="setGameBet(AppState.ticketBalance)">MAX</button></div></div><div class="game-actions">${isProwl ? `<button class="btn btn-primary" id="prowl-cashout" onclick="cashOutProwl()" disabled>Cash Out</button><button class="btn btn-secondary" onclick="resetProwl()">New Game</button>` : `<button class="btn btn-primary" onclick="runDemoGame()">${key==='slots'?'🎰 SPIN REELS':key==='roulette'?'SPIN WHEEL':isFind?'🔍 FIND SIMBA!': 'ROLL DICE'}</button>`}</div><p class="demo-disclaimer">Demo play only. No real tokens or transactions.</p></div><aside class="game-paytable"><h3>${key==='slots'?'Paytable':isProwl?'How to Play':'Game History'}</h3>${isProwl?'<p>Reveal a safe tile to increase your prize. Cash out at any time. A danger tile ends the round.</p>':key==='slots'?'<ul><li>🦁 🦁 🦁 — Jackpot</li><li>🐘 🐘 🐘 — 10× bet</li><li>Any pair — 2× bet</li><li>Other results — no prize</li></ul>':`<ul class="game-history">${history}</ul>`}</aside></div></section>`;
    };

    const oldGetGamesHTML = window.getGamesHTML;
    window.getGamesHTML = function () {
        const cards = oldGetGamesHTML();
        const detail = window.renderGameDetail();
        return cards + (detail || '');
    };

    window.closeGameDetail = function () { AppState.activeGame = ''; if (location.hash !== '#/games') location.hash = '/games'; loadDashboardContent('games'); };
    window.setGameBet = function (value) { AppState.gameBet = Math.max(1, Math.min(Number(value) || 1, Math.max(1, AppState.ticketBalance))); const input = document.getElementById('game-bet'); if (input) input.value = AppState.gameBet; };
    window.setGamePick = function (symbol) { AppState.gamePick = symbol; loadDashboardContent('games'); document.getElementById('game-detail')?.scrollIntoView({ behavior: 'smooth' }); };
    function wager() { const bet = Number(AppState.gameBet) || 1; if (bet > AppState.ticketBalance) { showNotification('Insufficient tickets!', 'error'); return 0; } AppState.ticketBalance -= bet; return bet; }
    function settle(name, bet, won, multiplier, resultText) { const payout = won ? Math.floor(bet * multiplier) : 0; AppState.ticketBalance += payout; AppState.gameHistory.unshift({ name, won, text: won ? `+${payout} tickets` : `-${bet} tickets` }); AppState.gameHistory = AppState.gameHistory.slice(0, 12); saveState(); updateBalances(); loadDashboardContent('games'); document.getElementById('game-result')?.replaceChildren(document.createTextNode(`${resultText} ${won ? `You won ${payout} tickets!` : `You lost ${bet} tickets.`}`)); document.getElementById('game-detail')?.scrollIntoView({ behavior: 'smooth' }); }

    window.runDemoGame = function () {
        const key = AppState.activeGame; const bet = wager(); if (!bet) return;
        if (key === 'slots') { const reels = Array.from({length:3},()=>symbols[Math.floor(Math.random()*symbols.length)]); const board=document.getElementById('game-board'); if(board) board.innerHTML=reels.map(s=>`<span>${s}</span>`).join(''); const match = reels.every(s=>s===reels[0]); const pair = new Set(reels).size < 3; settle('Jungle Slots', bet, match || pair, match ? (reels[0]==='🦁'?12:6) : 2, `Reels: ${reels.join(' ')}`); return; }
        if (key === 'roulette') { const result=symbols[Math.floor(Math.random()*symbols.length)]; const won=result===AppState.gamePick; const el=document.getElementById('roulette-result'); if(el) el.textContent=result; settle('Safari Roulette',bet,won,won?4:0,`The wheel landed on ${result}.`); return; }
        if (key === 'finding-simba') { const index=Math.floor(Math.random()*6); const cards=document.querySelectorAll('.simba-card'); cards.forEach((c,i)=>{c.textContent=i===index?'🦁':symbols[(i%5)+1];c.disabled=true;}); settle('Finding Simba',bet,index===Math.floor(Math.random()*6),5,'The cards are revealed.'); return; }
        if (key === 'dice-of-beast') { if (!AppState.gamePick) { AppState.ticketBalance+=bet; updateBalances(); showNotification('Choose a beast first.', 'info'); return; } const result=symbols[Math.floor(Math.random()*4)]; const dice=document.getElementById('game-board'); if(dice) dice.innerHTML=`<span>${result}</span><span>${symbols[Math.floor(Math.random()*4)]}</span>`; settle('Dice of Beast',bet,result===AppState.gamePick,4,`The dice reveal ${result}.`); return; }
    };

    window.revealSimbaCard = function (index) { const bet=wager(); if(!bet) return; const simba=Number.isInteger(AppState.simbaTarget)?AppState.simbaTarget:Math.floor(Math.random()*6); const win=index===simba; const cards=document.querySelectorAll('.simba-card'); cards.forEach((c,i)=>{c.textContent=i===simba?'🦁':symbols[(i%5)+1];c.disabled=true;}); settle('Finding Simba',bet,win,5,win?`You found Simba on card ${index+1}!`:`No Simba on card ${index+1}.`); AppState.simbaTarget=null; };
    window.revealProwlTile = function (index) { if(AppState.prowlBet==null){const bet=wager();if(!bet)return;AppState.prowlBet=bet;AppState.prowlSafe=0;AppState.prowlDanger=Math.floor(Math.random()*9);const c=document.getElementById('prowl-cashout');if(c)c.disabled=false;} const tile=document.getElementById(`prowl-${index}`);if(!tile||tile.disabled)return;tile.disabled=true;if(index===AppState.prowlDanger){tile.textContent='🐾';AppState.gameHistory.unshift({name:"Lion's Prowl",won:false,text:`-${AppState.prowlBet} tickets`});AppState.prowlBet=null;saveState();updateBalances();loadDashboardContent('games');showNotification('A danger zone! Round over.', 'error');return;} tile.textContent='💰';AppState.prowlSafe++;document.getElementById('game-result').textContent=`Safe tile! Current prize: ${Math.floor(AppState.prowlBet*(1+AppState.prowlSafe*.5))} tickets.`; };
    window.cashOutProwl = function () { if(AppState.prowlBet==null)return;const payout=Math.floor(AppState.prowlBet*(1+AppState.prowlSafe*.5));AppState.ticketBalance+=payout;AppState.gameHistory.unshift({name:"Lion's Prowl",won:true,text:`+${payout} tickets`});AppState.prowlBet=null;saveState();updateBalances();loadDashboardContent('games');showNotification(`Cashed out ${payout} tickets!`,'success'); };
    window.resetProwl = function () { AppState.prowlBet=null;AppState.prowlSafe=0;loadDashboardContent('games');document.getElementById('game-detail')?.scrollIntoView({behavior:'smooth'}); };
})();
