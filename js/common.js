// ========================================
// RAWR Casino - Frontend Demo Application
// ========================================

// Global State
const AppState = {
    currentUser: null,
    isLoggedIn: false,
    rawrBalance: 250.00,
    ticketBalance: 50,
    currentScreen: 'landing',
    currentDashboardTab: 'dashboard',
    loginStreak: 3,
    totalMined: 1234.56,
    miningLevel: 2,
    lastMineTime: Date.now() - (30 * 60 * 1000), // 30 minutes ago
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Load saved state from localStorage
    loadState();
    
    // Create floating paws
    createFloatingPaws();
    
    // Show welcome message
    setTimeout(() => {
        showNotification('Welcome to RAWR Casino! 🦁', 'info');
    }, 500);
    
    // Set up event listeners
    setupEventListeners();
    
    // Restore a GitHub Pages-safe hash route when the demo is opened directly.
    if (location.hash) {
        handleDemoRoute();
    } else if (AppState.isLoggedIn) {
        showScreen('dashboard-screen');
        updateBalances();
    }
    window.addEventListener('hashchange', handleDemoRoute);
});

function handleDemoRoute() {
    const route = location.hash.replace(/^#\/?/, '').toLowerCase();
    const routes = { home: ['landing-screen', ''], 'auth/login': ['login-screen', ''], login: ['login-screen', ''], 'auth/register': ['register-screen', ''], register: ['register-screen', ''], dashboard: ['dashboard-screen', 'dashboard'], mining: ['dashboard-screen', 'mining'], games: ['dashboard-screen', 'games'], wallet: ['dashboard-screen', 'wallet'], leaderboard: ['dashboard-screen', 'leaderboard'], rewards: ['dashboard-screen', 'daily'], daily: ['dashboard-screen', 'daily'], profile: ['dashboard-screen', 'profile'], admin: ['dashboard-screen', 'admin'] };
    let match = routes[route] || routes.home;
    if (route.startsWith('games/')) { AppState.activeGame = route.split('/')[1]; match = routes.games; }
    else if (route === 'games') AppState.activeGame = '';
    if (route.startsWith('admin/')) { const parts = route.split('/'); AppState.adminPage = parts[1] === 'edit-user' ? 'edit' : parts[1]; AppState.adminUserId = Number(parts[2]) || AppState.adminUserId; AppState.currentDashboardTab = 'admin'; match = routes.admin; }
    if (match[1]) { AppState.isLoggedIn = true; AppState.currentUser ||= 'DemoLion'; showScreen(match[0], false); showDashboardTab(match[1], false); updateBalances(); }
    else showScreen(match[0], false);
}

// Screen Management
function showScreen(screenId, updateRoute = true) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        AppState.currentScreen = screenId.replace('-screen', '');
        saveState();
        if (updateRoute) {
            const route = screenId === 'login-screen' ? 'auth/login' : screenId === 'register-screen' ? 'auth/register' : screenId === 'dashboard-screen' ? 'dashboard' : 'home';
            if (location.hash !== `#/${route}`) location.hash = `/${route}`;
        }
        
        // If showing dashboard, load default tab
        if (screenId === 'dashboard-screen') {
            showDashboardTab(AppState.currentDashboardTab || 'dashboard', updateRoute);
        }
    }
}

// Dashboard Tab Management
function showDashboardTab(tabName, updateRoute = true) {
    // Update sidebar active state
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeItem = Array.from(document.querySelectorAll('.sidebar-item'))
        .find(item => item.textContent.toLowerCase().includes(tabName.toLowerCase()));
    
    if (activeItem) {
        activeItem.classList.add('active');
    }
    
    // Load tab content
    AppState.currentDashboardTab = tabName;
    loadDashboardContent(tabName);
    saveState();
    if (updateRoute) {
        const route = tabName === 'daily' ? 'rewards' : tabName;
        if (location.hash !== `#/${route}`) location.hash = `/${route}`;
    }
}

// Load Dashboard Content
function loadDashboardContent(tabName) {
    const contentArea = document.getElementById('dashboard-content');
    
    const content = {
        dashboard: getDashboardHTML(),
        mining: getMiningHTML(),
        games: getGamesHTML(),
        wallet: getWalletHTML(),
        leaderboard: getLeaderboardHTML(),
        daily: getDailyHTML(),
        profile: getProfileHTML(),
        admin: getAdminHTML()
    };
    
    contentArea.innerHTML = content[tabName] || content.dashboard;
    
    // Initialize tab-specific functionality
    initializeTabFunctionality(tabName);
}

// Dashboard HTML Templates
function getDashboardHTML() {
    return `
        <section class="hero" style="min-height: auto; padding: 2rem 1rem;">
            <h1 style="font-size: 2.5rem;">Welcome to the Jungle, ${AppState.currentUser || 'Lion'}!</h1>
            <p>Your kingdom awaits. Mine RAWR tokens, play exciting casino games, and dominate the leaderboards!</p>
            
            <div class="coin-animation" style="margin: 2rem auto; perspective: 1000px; width: 150px; height: 150px;">
                <div class="coin" style="position: relative; width: 100%; height: 100%; transform-style: preserve-3d; animation: rotate-coin 6s infinite ease-in-out;">
                    <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; backface-visibility: hidden; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at 30% 30%, #FFD700, #D4AF37); transform: rotateY(0deg); font-size: 4rem; box-shadow: 0 0 25px rgba(255, 215, 0, 0.6);">🦁</div>
                    <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; backface-visibility: hidden; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at 30% 30%, #FF6B35, #C46210); transform: rotateY(180deg); font-size: 1.8rem; font-weight: bold; color: #1a1a1a; box-shadow: 0 0 25px rgba(255, 215, 0, 0.6);">RAWR</div>
                </div>
            </div>
            
            <style>
                @keyframes rotate-coin {
                    0% { transform: rotateY(0deg) rotateX(5deg); }
                    25% { transform: rotateY(90deg) rotateX(5deg); }
                    50% { transform: rotateY(180deg) rotateX(5deg); }
                    75% { transform: rotateY(270deg) rotateX(5deg); }
                    100% { transform: rotateY(360deg) rotateX(5deg); }
                }
            </style>
            
            <div class="hero-buttons" style="display: flex; gap: 1.5rem; flex-wrap: wrap; justify-content: center;">
                <button class="btn btn-primary pulse" onclick="showDashboardTab('mining')" style="animation: pulse 2s infinite;">
                    <i class="fas fa-digging"></i>
                    Start Mining
                </button>
                <button class="btn btn-secondary" onclick="showDashboardTab('games')">
                    <i class="fas fa-dice"></i>
                    Play Casino
                </button>
            </div>
            
            <style>
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
            </style>
        </section>
        
        <section class="features" style="padding: 2rem 1rem; max-width: 1200px; margin: 0 auto;">
            <h2 style="font-size: 2rem; text-align: center; margin-bottom: 2rem; color: var(--primary);">
                <i class="fas fa-crown"></i> King's Features
            </h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-gem"></i></div>
                    <h3 class="feature-title">Mine Precious RAWR</h3>
                    <p class="feature-desc">Unearth valuable RAWR tokens with your mining tools. Upgrade your equipment to increase your earnings.</p>
                    <button class="btn btn-secondary" onclick="showDashboardTab('mining')" style="margin-top: 1rem; font-size: 0.9rem; padding: 0.75rem 1.5rem;">Start Mining</button>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-dice"></i></div>
                    <h3 class="feature-title">Jungle Casino</h3>
                    <p class="feature-desc">Test your luck in our exciting casino games. Slots, roulette, and more - all with amazing rewards.</p>
                    <button class="btn btn-secondary" onclick="showDashboardTab('games')" style="margin-top: 1rem; font-size: 0.9rem; padding: 0.75rem 1.5rem;">Play Games</button>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-trophy"></i></div>
                    <h3 class="feature-title">Leaderboards</h3>
                    <p class="feature-desc">Compete with other players and climb the leaderboards. Top players earn special rewards each week.</p>
                    <button class="btn btn-secondary" onclick="showDashboardTab('leaderboard')" style="margin-top: 1rem; font-size: 0.9rem; padding: 0.75rem 1.5rem;">View Rankings</button>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-wallet"></i></div>
                    <h3 class="feature-title">Wallet Integration</h3>
                    <p class="feature-desc">Securely connect your crypto wallet to manage your RAWR tokens and game tickets in one place.</p>
                    <button class="btn btn-secondary" onclick="showDashboardTab('wallet')" style="margin-top: 1rem; font-size: 0.9rem; padding: 0.75rem 1.5rem;">Setup Wallet</button>
                </div>
            </div>
        </section>
    `;
}

function getMiningHTML() {
    const timeSinceLastMine = Date.now() - AppState.lastMineTime;
    const miningCooldown = 30 * 60 * 1000; // 30 minutes
    const canMine = timeSinceLastMine >= miningCooldown;
    const remainingTime = canMine ? 0 : Math.ceil((miningCooldown - timeSinceLastMine) / 1000);
    
    return `
        <div class="mining-bg" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 0; pointer-events: none; background: url('data:image/svg+xml,<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 1200 800\\"><defs><radialGradient id=\\"stars\\"><stop offset=\\"0%\\" stop-color=\\"%23FFD700\\" stop-opacity=\\"1\\"/><stop offset=\\"100%\\" stop-color=\\"%23FFD700\\" stop-opacity=\\"0\\"/></radialGradient></defs><circle cx=\\"100\\" cy=\\"100\\" r=\\"2\\" fill=\\"url(%23stars)\\"/><circle cx=\\"300\\" cy=\\"200\\" r=\\"1.5\\" fill=\\"url(%23stars)\\"/><circle cx=\\"500\\" cy=\\"150\\" r=\\"1\\" fill=\\"url(%23stars)\\"/><circle cx=\\"700\\" cy=\\"300\\" r=\\"2\\" fill=\\"url(%23stars)\\"/><circle cx=\\"900\\" cy=\\"250\\" r=\\"1.5\\" fill=\\"url(%23stars)\\"/><circle cx=\\"1100\\" cy=\\"400\\" r=\\"1\\" fill=\\"url(%23stars)\\"/></svg>') repeat; opacity: 0.6; animation: twinkle 3s ease-in-out infinite alternate;"></div>

        <div class="mining-hero" style="min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 120px 1rem 2rem; position: relative; overflow: hidden; background: radial-gradient(ellipse at center, rgba(255,215,0,0.08) 0%, transparent 70%); z-index: 1;">
            <div class="hero-content" style="max-width: 1200px; width: 100%; display: flex; flex-direction: column; align-items: center; z-index: 2;">
                <h1 style="font-size: 3.5rem; margin-bottom: 1.5rem; background: linear-gradient(to right, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 20px rgba(255, 215, 0, 0.2); line-height: 1.1;">⛏️ RAWR Mining</h1>
                <p style="font-size: 1.25rem; max-width: 700px; margin: 0 auto 2.5rem; color: var(--text-muted); padding: 0 1rem; line-height: 1.7;">Dig deep into the jungle and unearth precious RAWR tokens! Upgrade your equipment for better rewards.</p>
                
                <div class="mining-character" style="position: relative; width: 280px; height: 280px; margin: 1rem auto 1.2rem; perspective: 1000px;">
                    <div style="font-size: 14rem; animation: idle-bounce 3s infinite ease-in-out;">⛏️</div>
                </div>
                <style>
                    @keyframes idle-bounce {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-20px); }
                    }
                </style>
                
                <div class="mining-progress-container" style="max-width: 600px; width: 100%; margin: 1.5rem auto 0; padding: 1.8rem; background: var(--card-bg); border-radius: var(--border-radius); border: 1px solid var(--glass-border); box-shadow: 0 10px 35px rgba(0, 0, 0, 0.25); backdrop-filter: blur(5px);">
                    <div class="progress-header" style="display: flex; justify-content: space-between; margin-bottom: 1.2rem; align-items: center; flex-wrap: wrap; gap: 1rem;">
                        <div class="progress-title" style="font-size: 1.3rem; font-weight: 600; color: var(--primary);">
                            <i class="fas fa-pickaxe"></i> Mining Status
                        </div>
                        <div class="mining-level" style="background: rgba(255, 215, 0, 0.1); padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600;">
                            Level ${AppState.miningLevel}
                        </div>
                    </div>
                    
                    <div class="mining-stats" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="background: rgba(0, 0, 0, 0.3); padding: 1rem; border-radius: 8px; text-align: center;">
                            <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.25rem;">Mining Rate</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">${(0.5 * AppState.miningLevel).toFixed(2)} RAWR/min</div>
                        </div>
                        <div style="background: rgba(0, 0, 0, 0.3); padding: 1rem; border-radius: 8px; text-align: center;">
                            <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.25rem;">Total Mined</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">${AppState.totalMined.toFixed(2)} RAWR</div>
                        </div>
                    </div>
                    
                    <div id="mining-timer" style="text-align: center; font-size: 1.2rem; margin-bottom: 1rem; color: var(--primary); font-weight: 600;">
                        ${canMine ? 'Ready to Mine!' : formatTime(remainingTime)}
                    </div>
                    
                    <button 
                        id="mine-btn"
                        class="btn btn-primary" 
                        onclick="handleMining()" 
                        ${!canMine ? 'disabled' : ''}
                        style="width: 100%; font-size: 1.1rem; padding: 1rem; ${!canMine ? 'opacity: 0.5; cursor: not-allowed;' : ''}"
                    >
                        <i class="fas fa-pickaxe"></i> ${canMine ? 'Claim Rewards' : 'Mining...'}
                    </button>
                    
                    <div style="text-align: center; margin-top: 1rem; color: var(--text-muted); font-size: 0.9rem;">
                        Next reward: ~${(15 * AppState.miningLevel).toFixed(2)} RAWR
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getGamesHTML() {
    return `
        <section style="padding: 20px 2rem 60px; background: rgba(0, 0, 0, 0.3); position: relative;">
            <h1 style="font-size: 2.5rem; text-align: center; margin-bottom: 0.5rem; background: linear-gradient(to right, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 20px rgba(255, 215, 0, 0.2);">RAWR Casino Games</h1>
            <p style="font-size: 1rem; max-width: 600px; margin: 0 auto 2rem; color: var(--text-muted); text-align: center;">Step into the jungle casino and try your luck at our exotic games</p>
        </section>
        
        <section style="padding: 2rem 1rem; max-width: 1200px; margin: 0 auto;">
            <h2 style="font-size: 1.5rem; text-align: center; margin-bottom: 1.5rem; color: var(--primary); display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                <i class="fas fa-star"></i> Featured Casino Games
            </h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
                <!-- Jungle Slots -->
                <div style="background: var(--card-bg); border-radius: var(--border-radius); padding: 1.5rem; border: 1px solid var(--glass-border); position: relative; overflow: hidden; transition: var(--transition); display: flex; flex-direction: column; height: 100%;">
                    <div style="height: 160px; background: rgba(0, 0, 0, 0.4) url('assets/slot-image.png'); background-size: cover; background-position: center; border-radius: var(--border-radius); margin-bottom: 1.5rem; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; color: white; font-size: 0.9rem; text-align: center; padding: 1rem; opacity: 0; transition: opacity 0.3s; backdrop-filter: blur(2px);" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'">Spin the reels and match symbols for massive ticket payouts!</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.2rem;">
                        <div style="width: 60px; height: 60px; background: rgba(255, 215, 0, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: var(--primary); flex-shrink: 0;"><i class="fas fa-dice"></i></div>
                        <div style="flex: 1;">
                            <h3 style="font-weight: 600; font-size: 1.2rem; color: var(--text-light); margin-bottom: 0.2rem;">Jungle Slots</h3>
                            <span style="display: inline-block; padding: 0.25rem 0.6rem; background: rgba(255, 107, 53, 0.2); color: var(--accent); border-radius: 30px; font-size: 0.7rem; font-weight: 500;">Popular</span>
                        </div>
                    </div>
                    <div style="font-size: 0.9rem; margin-bottom: 1.5rem; color: var(--text-muted); line-height: 1.6; flex: 1;">
                        Spin the reels filled with jungle animals. Match 3 lions for the jackpot, or other combos for big ticket wins!
                    </div>
                    <button class="btn btn-primary" onclick="playGame('slots')" style="width: 100%; margin-top: auto;"><i class="fas fa-play"></i> Play Now</button>
                </div>
                
                <!-- Safari Roulette -->
                <div style="background: var(--card-bg); border-radius: var(--border-radius); padding: 1.5rem; border: 1px solid var(--glass-border); position: relative; overflow: hidden; transition: var(--transition); display: flex; flex-direction: column; height: 100%;">
                    <div style="height: 160px; background: rgba(0, 0, 0, 0.4) url('assets/roulette-image.png'); background-size: cover; background-position: center; border-radius: var(--border-radius); margin-bottom: 1.5rem; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; color: white; font-size: 0.9rem; text-align: center; padding: 1rem; opacity: 0; transition: opacity 0.3s; backdrop-filter: blur(2px);" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'">Spin the wheel for multipliers or free spins. Bet tickets, win tickets!</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.2rem;">
                        <div style="width: 60px; height: 60px; background: rgba(255, 215, 0, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: var(--primary); flex-shrink: 0;"><i class="fas fa-circle"></i></div>
                        <div style="flex: 1;">
                            <h3 style="font-weight: 600; font-size: 1.2rem; color: var(--text-light); margin-bottom: 0.2rem;">Safari Roulette</h3>
                            <span style="display: inline-block; padding: 0.25rem 0.6rem; background: rgba(255, 107, 53, 0.2); color: var(--accent); border-radius: 30px; font-size: 0.7rem; font-weight: 500;">Classic</span>
                        </div>
                    </div>
                    <div style="font-size: 0.9rem; margin-bottom: 1.5rem; color: var(--text-muted); line-height: 1.6; flex: 1;">
                        Spin the Safari wheel for a chance at multipliers up to 20x or free spins. Lose your bet or win big—every spin is a thrill!
                    </div>
                    <button class="btn btn-primary" onclick="playGame('roulette')" style="width: 100%; margin-top: auto;"><i class="fas fa-play"></i> Play Now</button>
                </div>
                
                <!-- Finding Simba -->
                <div style="background: var(--card-bg); border-radius: var(--border-radius); padding: 1.5rem; border: 1px solid var(--glass-border); position: relative; overflow: hidden; transition: var(--transition); display: flex; flex-direction: column; height: 100%;">
                    <div style="height: 160px; background: rgba(0, 0, 0, 0.4) url('assets/finding-simba.png'); background-size: cover; background-position: center; border-radius: var(--border-radius); margin-bottom: 1.5rem; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; color: white; font-size: 0.9rem; text-align: center; padding: 1rem; opacity: 0; transition: opacity 0.3s; backdrop-filter: blur(2px);" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'">Flip cards to find Simba and win big rewards!</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.2rem;">
                        <div style="width: 60px; height: 60px; background: rgba(255, 215, 0, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: var(--primary); flex-shrink: 0;">🦁</div>
                        <div style="flex: 1;">
                            <h3 style="font-weight: 600; font-size: 1.2rem; color: var(--text-light); margin-bottom: 0.2rem;">Finding Simba</h3>
                            <span style="display: inline-block; padding: 0.25rem 0.6rem; background: rgba(255, 107, 53, 0.2); color: var(--accent); border-radius: 30px; font-size: 0.7rem; font-weight: 500;">New</span>
                        </div>
                    </div>
                    <div style="font-size: 0.9rem; margin-bottom: 1.5rem; color: var(--text-muted); line-height: 1.6; flex: 1;">
                        Flip cards to find the hidden Simba! Match pairs for multipliers, find Simba for the jackpot. Simple yet thrilling!
                    </div>
                    <button class="btn btn-primary" onclick="playGame('finding-simba')" style="width: 100%; margin-top: auto;"><i class="fas fa-play"></i> Play Now</button>
                </div>
                
                <!-- Dice of Beast -->
                <div style="background: var(--card-bg); border-radius: var(--border-radius); padding: 1.5rem; border: 1px solid var(--glass-border); position: relative; overflow: hidden; transition: var(--transition); display: flex; flex-direction: column; height: 100%;">
                    <div style="height: 160px; background: rgba(0, 0, 0, 0.4) url('assets/dob-image.png'); background-size: cover; background-position: center; border-radius: var(--border-radius); margin-bottom: 1.5rem; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; color: white; font-size: 0.9rem; text-align: center; padding: 1rem; opacity: 0; transition: opacity 0.3s; backdrop-filter: blur(2px);" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'">Roll the dice and predict the outcome for big multipliers!</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.2rem;">
                        <div style="width: 60px; height: 60px; background: rgba(255, 215, 0, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: var(--primary); flex-shrink: 0;"><i class="fas fa-dice-six"></i></div>
                        <div style="flex: 1;">
                            <h3 style="font-weight: 600; font-size: 1.2rem; color: var(--text-light); margin-bottom: 0.2rem;">Dice of Beast</h3>
                            <span style="display: inline-block; padding: 0.25rem 0.6rem; background: rgba(255, 107, 53, 0.2); color: var(--accent); border-radius: 30px; font-size: 0.7rem; font-weight: 500;">Hot</span>
                        </div>
                    </div>
                    <div style="font-size: 0.9rem; margin-bottom: 1.5rem; color: var(--text-muted); line-height: 1.6; flex: 1;">
                        Roll the dice and choose your beast! Match the numbers for multipliers up to 50x your bet. Simple, fast, and exciting!
                    </div>
                    <button class="btn btn-primary" onclick="playGame('dice-of-beast')" style="width: 100%; margin-top: auto;"><i class="fas fa-play"></i> Play Now</button>
                </div>
                
                <!-- Lion's Prowl -->
                <div style="background: var(--card-bg); border-radius: var(--border-radius); padding: 1.5rem; border: 1px solid var(--glass-border); position: relative; overflow: hidden; transition: var(--transition); display: flex; flex-direction: column; height: 100%;">
                    <div style="height: 160px; background: rgba(0, 0, 0, 0.4) url('assets/panthers-image.png'); background-size: cover; background-position: center; border-radius: var(--border-radius); margin-bottom: 1.5rem; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; color: white; font-size: 0.9rem; text-align: center; padding: 1rem; opacity: 0; transition: opacity 0.3s; backdrop-filter: blur(2px);" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'">Explore the savanna and collect coins while avoiding dangers!</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.2rem;">
                        <div style="width: 60px; height: 60px; background: rgba(255, 215, 0, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: var(--primary); flex-shrink: 0;">🐆</div>
                        <div style="flex: 1;">
                            <h3 style="font-weight: 600; font-size: 1.2rem; color: var(--text-light); margin-bottom: 0.2rem;">Lion's Prowl</h3>
                            <span style="display: inline-block; padding: 0.25rem 0.6rem; background: rgba(255, 107, 53, 0.2); color: var(--accent); border-radius: 30px; font-size: 0.7rem; font-weight: 500;">Strategy</span>
                        </div>
                    </div>
                    <div style="font-size: 0.9rem; margin-bottom: 1.5rem; color: var(--text-muted); line-height: 1.6; flex: 1;">
                        Reveal tiles to collect coins or hit a danger zone! Cash out anytime or keep going for bigger rewards. Risk vs reward!
                    </div>
                    <button class="btn btn-primary" onclick="playGame('lions-prowl')" style="width: 100%; margin-top: auto;"><i class="fas fa-play"></i> Play Now</button>
                </div>
            </div>
        </section>
    `;
}

function getWalletHTML() {
    return `
        <div style="max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem;">
            <div style="margin-bottom: 2.5rem;">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">💰</div>
                    <h1 style="font-size: 2.5rem; background: linear-gradient(to right, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">RAWR Wallet</h1>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                <!-- MetaMask Connection -->
                <div style="background: var(--glass-bg); backdrop-filter: blur(10px); border: 1px solid var(--glass-border); border-radius: var(--border-radius); padding: 1.5rem; transition: var(--transition); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); margin-bottom: 1.5rem;">
                    <h2 style="font-size: 1.3rem; color: var(--primary-light); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                        <i class="fab fa-ethereum"></i> Connect Wallet
                    </h2>
                    <button class="btn btn-primary" onclick="connectWallet()" style="width: 100%;">
                        <i class="fab fa-ethereum"></i> Connect MetaMask
                    </button>
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 1rem; text-align: center;">
                        Connect your wallet to deposit and withdraw RAWR tokens
                    </p>
                </div>
                
                <!-- Convert Tokens -->
                <div style="background: var(--glass-bg); backdrop-filter: blur(10px); border: 1px solid var(--glass-border); border-radius: var(--border-radius); padding: 1.5rem; transition: var(--transition); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);">
                    <h2 style="font-size: 1.3rem; color: var(--primary-light); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                        <i class="fas fa-exchange-alt"></i> Convert Tokens
                    </h2>
                    <div style="background: rgba(255, 215, 0, 0.1); border-radius: 8px; padding: 0.5rem 1rem; margin-bottom: 1.5rem; font-size: 0.9rem; text-align: center;">
                        1 Ticket = 20 RAWR
                    </div>
                    <div style="margin-bottom: 1.2rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.9rem;">Amount to Convert</label>
                        <input type="number" id="convert-amount" placeholder="Enter amount" style="width: 100%; padding: 0.8rem 1rem; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 8px; color: var(--text-light); font-family: 'Poppins', sans-serif; font-size: 1rem;">
                    </div>
                    <div style="margin-bottom: 1.2rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.9rem;">Direction</label>
                        <select id="convert-direction" style="width: 100%; padding: 0.8rem 1rem; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 8px; color: var(--text-light); font-family: 'Poppins', sans-serif; font-size: 1rem;">
                            <option value="rawr-to-tickets">RAWR → Tickets</option>
                            <option value="tickets-to-rawr">Tickets → RAWR</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" onclick="convertTokens()" style="width: 100%;">
                        <i class="fas fa-exchange-alt"></i> Convert
                    </button>
                </div>
            </div>
            
            <!-- Transaction History -->
            <div style="background: var(--glass-bg); backdrop-filter: blur(10px); border: 1px solid var(--glass-border); border-radius: var(--border-radius); padding: 2rem; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);">
                <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--primary); display: flex; align-items: center; gap: 0.75rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255, 215, 0, 0.1); margin-bottom: 1.5rem;">
                    <i class="fas fa-history"></i> Transaction History
                </h2>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="text-align: left; padding: 1rem; background: rgba(0, 0, 0, 0.3); color: var(--primary); font-weight: 500; border-bottom: 1px solid rgba(255, 215, 0, 0.1);">
                                <th style="padding: 1rem;">Type</th>
                                <th style="padding: 1rem;">Amount</th>
                                <th style="padding: 1rem;">Status</th>
                                <th style="padding: 1rem;">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="padding: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                                <td style="padding: 1rem;"><span style="display: inline-block; padding: 0.25rem 0.75rem; background: rgba(40, 167, 69, 0.2); color: #28a745; border-radius: 5px; font-size: 0.9rem; font-weight: 500;">Conversion</span></td>
                                <td style="padding: 1rem;">+50 Tickets</td>
                                <td style="padding: 1rem;"><span style="color: #28a745;">Completed</span></td>
                                <td style="padding: 1rem; color: var(--text-muted);">2 hours ago</td>
                            </tr>
                            <tr style="padding: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                                <td style="padding: 1rem;"><span style="display: inline-block; padding: 0.25rem 0.75rem; background: rgba(255, 215, 0, 0.2); color: var(--primary); border-radius: 5px; font-size: 0.9rem; font-weight: 500;">Mining</span></td>
                                <td style="padding: 1rem;">+15.50 RAWR</td>
                                <td style="padding: 1rem;"><span style="color: #28a745;">Completed</span></td>
                                <td style="padding: 1rem; color: var(--text-muted);">1 day ago</td>
                            </tr>
                            <tr style="padding: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                                <td style="padding: 1rem;"><span style="display: inline-block; padding: 0.25rem 0.75rem; background: rgba(59, 130, 246, 0.2); color: #3b82f6; border-radius: 5px; font-size: 0.9rem; font-weight: 500;">Game Win</span></td>
                                <td style="padding: 1rem;">+100 Tickets</td>
                                <td style="padding: 1rem;"><span style="color: #28a745;">Completed</span></td>
                                <td style="padding: 1rem; color: var(--text-muted);">2 days ago</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function getLeaderboardHTML() {
    const players = [
        { rank: 1, username: 'LionKing', rawr: 5234.56, tickets: 1523 },
        { rank: 2, username: 'SavannaQueen', rawr: 4892.33, tickets: 1402 },
        { rank: 3, username: 'JungleAlpha', rawr: 4521.87, tickets: 1301 },
        { rank: 4, username: 'BeastMaster', rawr: 3987.42, tickets: 1125 },
        { rank: 5, username: 'WildRoar', rawr: 3654.11, tickets: 1089 },
        { rank: 6, username: AppState.currentUser || 'You', rawr: AppState.rawrBalance, tickets: AppState.ticketBalance, isCurrentUser: true },
    ];
    
    const leaderboardHTML = players.map(player => {
        const medalHTML = player.rank <= 3 ? 
            `<div style="position: relative;">
                <span style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); font-size: 1.5rem;">${player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}</span>
                <span style="margin-left: 25px;">${player.rank}</span>
            </div>` : 
            player.rank;
            
        return `
            <div style="display: grid; grid-template-columns: 50px 1fr 150px 150px; padding: 1rem; border-bottom: 1px solid rgba(255, 215, 0, 0.05); transition: var(--transition); ${player.isCurrentUser ? 'background: rgba(255, 215, 0, 0.1); border-left: 3px solid var(--primary);' : ''}">
                <div style="display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem;">${medalHTML}</div>
                <div style="display: flex; align-items: center; gap: 0.8rem;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--accent)); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; overflow: hidden;">🦁</div>
                    <div style="font-weight: 500;">${player.username}${player.isCurrentUser ? '<span style="background: var(--primary); color: #1a1a1a; font-size: 0.7rem; font-weight: bold; padding: 0.15rem 0.5rem; border-radius: 4px; margin-left: 0.5rem;">YOU</span>' : ''}</div>
                </div>
                <div style="display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-weight: 600; color: var(--primary);">${player.rawr.toFixed(2)}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">RAWR</div>
                </div>
                <div style="display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-weight: 600; color: var(--primary);">${player.tickets}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">Tickets</div>
                </div>
            </div>
        `;
    }).join('');
    return `
        <section style="padding: 20px 2rem 40px; background: rgba(0, 0, 0, 0.3); position: relative;">
            <h1 style="font-size: 2.5rem; text-align: center; margin-bottom: 0.5rem; background: linear-gradient(to right, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 20px rgba(255, 215, 0, 0.2);">RAWR Casino - Leaderboard</h1>
            <p style="font-size: 1rem; max-width: 600px; margin: 0 auto; color: var(--text-muted); text-align: center;">Compete with the pride and claim your spot at the top!</p>
        </section>
        
        <section style="padding: 2rem 1rem; max-width: 800px; margin: 0 auto;">
            <div style="display: flex; justify-content: center; gap: 1rem; margin-bottom: 1.5rem;">
                <button class="btn btn-primary" id="rawr-tab" onclick="switchLeaderboardTab('rawr')" style="padding: 0.7rem 1.5rem; font-size: 0.95rem;">
                    <i class="fas fa-coins"></i> RAWR
                </button>
                <button class="btn btn-secondary" id="tickets-tab" onclick="switchLeaderboardTab('tickets')" style="padding: 0.7rem 1.5rem; font-size: 0.95rem;">
                    <i class="fas fa-ticket-alt"></i> Tickets
                </button>
            </div>
            
            <div style="background: var(--card-bg); border-radius: var(--border-radius); border: 1px solid var(--glass-border); position: relative; overflow: hidden; transition: var(--transition); margin-bottom: 2rem;">
                <div style="display: grid; grid-template-columns: 50px 1fr 150px 150px; padding: 1rem; background: rgba(0, 0, 0, 0.3); font-weight: 600; color: var(--primary); border-bottom: 1px solid rgba(255, 215, 0, 0.1);">
                    <div>Rank</div>
                    <div>Player</div>
                    <div>RAWR</div>
                    <div>Tickets</div>
                </div>
                <div style="max-height: 600px; overflow-y: auto;">
                    ${leaderboardHTML}
                </div>
            </div>
        </section>
    `;
}

function getDailyHTML() {
    const dailyRewards = [
        { day: 1, rawr: 5, tickets: 1, claimed: true },
        { day: 2, rawr: 10, tickets: 2, claimed: true },
        { day: 3, rawr: 15, tickets: 3, claimed: true },
        { day: 4, rawr: 20, tickets: 4, claimed: false, available: true },
        { day: 5, rawr: 30, tickets: 5, claimed: false },
        { day: 6, rawr: 50, tickets: 6, claimed: false },
        { day: 7, rawr: 100, tickets: 10, claimed: false },
    ];
    AppState.claimedRewardDays = AppState.claimedRewardDays || [1, 2, 3];
    dailyRewards.forEach(reward => { reward.claimed = AppState.claimedRewardDays.includes(reward.day); reward.available = reward.day === Math.min(7, AppState.loginStreak + 1) && !reward.claimed; });
    
    const rewardCards = dailyRewards.map(reward => {
        const statusClass = reward.claimed ? 'claimed' : reward.available ? 'available' : 'locked';
        const statusText = reward.claimed ? 'Claimed' : reward.available ? 'Claim Reward' : 'Locked';
        const disabled = reward.claimed || !reward.available ? 'disabled' : '';
        
        return `
            <div style="background: rgba(30, 30, 30, 0.7); border-radius: var(--border-radius); padding: 1.5rem; border: 1px solid ${reward.claimed ? 'rgba(40, 167, 69, 0.3)' : reward.available ? 'rgba(255, 215, 0, 0.4)' : 'rgba(255, 215, 0, 0.15)'}; text-align: center;">
                <div style="font-size: 1.2rem; font-weight: 600; margin-bottom: 1rem; color: var(--primary);">Day ${reward.day}</div>
                <div style="margin-bottom: 1.5rem;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">${reward.rawr} RAWR</div>
                    <div style="color: var(--text-muted);">+ ${reward.tickets} Tickets</div>
                </div>
                <button 
                    class="btn ${reward.available && !reward.claimed ? 'btn-primary' : 'btn-secondary'}" 
                    onclick="${reward.available && !reward.claimed ? 'claimDaily(' + reward.day + ')' : 'void(0)'}" 
                    ${disabled}
                    style="width: 100%; font-size: 0.9rem; padding: 0.75rem; ${disabled ? 'opacity: 0.5; cursor: not-allowed;' : ''}"
                >
                    ${statusText}
                </button>
        </div>
        `;
    }).join('');
    const missionData = [
        ['Daily Login', 'Log in 3 days in a row', 3, 3, 'tickets', 100, 'dashboard'],
        ['Daily Mining', 'Mine at least 10 RAWR tokens today', 4, 10, 'rawr', 25, 'mining'],
        ['Casino Enthusiast', 'Play 3 casino games today', 1, 3, 'tickets', 15, 'games'],
        ['Referral Master', 'Refer 10 new players', 1, 10, 'rawr', 50, 'dashboard'],
        ['Big Spender', 'Spend 1,000 tickets in the casino', 250, 1000, 'tickets', 100, 'games'],
        ['Mining Master', 'Mine 500 RAWR tokens', 126, 500, 'tickets', 500, 'mining'],
        ['Game Enthusiast', 'Play 10 games', 4, 10, 'tickets', 150, 'games'],
        ['RAWR Millionaire', 'Accumulate 1,000,000 RAWR tokens', 250, 1000000, 'rawr', 1000, 'wallet'],
        ['Casino Royal', 'Win 100 casino games', 2, 100, 'tickets', 500, 'games'],
        ['Jungle King', 'Become the #1 player on the leaderboard', 0, 1, 'rawr', 200, 'leaderboard'],
        ['Loyal Lion', 'Maintain a 30-day login streak', AppState.loginStreak, 30, 'tickets', 100, 'dashboard']
    ];
    AppState.challengeClaims = AppState.challengeClaims || {};
    const challengeCard = ([name, desc, current, target, type, reward, tab]) => {
        const claimed = !!AppState.challengeClaims[name], ready = current >= target && !claimed;
        const percent = Math.min(100, Math.round(current / target * 100));
        return `<article class="challenge-card demo-challenge"><div class="challenge-heading"><span>🏆</span><h3>${name}</h3>${ready ? '<b>Reward Ready!</b>' : claimed ? '<b>Completed</b>' : ''}</div><p>${desc}</p><div class="challenge-meter"><span style="width:${percent}%"></span></div><div class="challenge-progress"><span>${current}/${target}</span><span>Reward: ${reward} ${type === 'rawr' ? 'RAWR' : 'Tickets'}</span></div>${ready ? `<button class="btn btn-primary" onclick="claimChallenge('${name}')">🎁 Claim Reward</button>` : claimed ? '<button class="btn btn-secondary" disabled>✓ Claimed</button>' : `<button class="btn btn-secondary" onclick="showDashboardTab('${tab}')">Continue</button>`}</article>`;
    };
    const dailyMissionsHTML = missionData.slice(0, 5).map(challengeCard).join('');
    const achievementsHTML = missionData.slice(5).map(challengeCard).join('');
    
    return `
        <div style="padding: 120px 2rem 60px; text-align: center; background: linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(45, 24, 16, 0.9) 100%); position: relative; overflow: hidden; border-bottom: 1px solid rgba(255, 215, 0, 0.1); margin-bottom: 2rem;">
            <h1 style="font-size: 3.5rem; margin-bottom: 1rem; background: linear-gradient(to right, var(--primary), var(--secondary)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 20px rgba(255, 215, 0, 0.2);">Daily Rewards</h1>
            <p style="font-size: 1.2rem; max-width: 700px; margin: 0 auto 2rem; color: var(--text-muted);">Claim your daily rewards and build your login streak!</p>
            
            <div style="display: flex; justify-content: center; gap: 2rem; margin: 1.5rem 0; flex-wrap: wrap;">
                <div style="text-align: center; padding: 1.5rem 2rem; background: rgba(0, 0, 0, 0.3); border-radius: var(--border-radius); border: 1px solid rgba(255, 215, 0, 0.2); min-width: 150px;">
                    <div style="font-size: 2.5rem; font-weight: 700; color: var(--primary); margin-bottom: 0.25rem;">${AppState.loginStreak}</div>
                    <div style="font-size: 0.9rem; color: var(--text-muted);">Current Streak</div>
                </div>
                <div style="text-align: center; padding: 1.5rem 2rem; background: rgba(0, 0, 0, 0.3); border-radius: var(--border-radius); border: 1px solid rgba(255, 215, 0, 0.2); min-width: 150px;">
                    <div style="font-size: 2.5rem; font-weight: 700; color: var(--primary); margin-bottom: 0.25rem;">7</div>
                    <div style="font-size: 0.9rem; color: var(--text-muted);">Best Streak</div>
                </div>
            </div>
        </div>
        
        <section style="padding: 0 2rem 3rem; max-width: 1400px; margin: 0 auto;">
            <h2 style="font-size: 1.5rem; text-align: center; margin-bottom: 2rem; color: var(--primary);">
                <i class="fas fa-calendar-check"></i> Weekly Check-in
            </h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.5rem; margin: 0 1rem;">
                ${rewardCards}
            </div>
            
            <div style="text-align: center; margin-top: 2rem;">
                <p style="color: var(--text-muted); font-size: 0.9rem;">Streak resets if you miss a day!</p>
            </div>
        </section>
        <section class="challenge-section"><h2><i class="fas fa-tasks"></i> Daily Missions</h2><div class="challenge-grid">${dailyMissionsHTML}</div></section>
        <section class="challenge-section"><h2><i class="fas fa-medal"></i> Achievements</h2><div class="challenge-grid">${achievementsHTML}</div></section>
    `;
}

function getProfileHTML() {
    return `
        <div style="padding: 120px 1rem 60px; position: relative; text-align: center; background: linear-gradient(135deg, rgba(26, 26, 26, 0.8), rgba(45, 24, 16, 0.8)); border-bottom: 1px solid var(--glass-border); margin-bottom: 2rem;">
            <div style="position: relative; display: inline-block; margin: 0 auto 20px;">
                <div style="width: 160px; height: 160px; border-radius: 50%; border: 3px solid var(--primary); display: flex; align-items: center; justify-content: center; font-size: 3rem; color: white; overflow: hidden; background: linear-gradient(135deg, var(--primary), var(--accent));">🦁</div>
                <div style="position: absolute; bottom: 10px; right: 10px; width: 35px; height: 35px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);" onclick="showNotification('Avatar updated!', 'success')"><i class="fas fa-camera"></i></div>
            </div>
            
            <div style="margin-top: 1rem;">
                <h1 style="font-size: 2.2rem; font-weight: 700; color: var(--primary);">${AppState.currentUser || 'Lion King'}</h1>
                <p style="color: var(--text-muted); font-size: 0.9rem;">demo@rawr.casino</p>
                <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(0, 128, 0, 0.2); color: #0f0; padding: 0.5rem 1rem; border-radius: 20px; margin-top: 1rem; font-size: 0.9rem;">
                    <i class="fas fa-shield-alt"></i> Verified Account
                </div>
            </div>
        </div>
        
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 2rem 2rem;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
                <!-- Account Settings -->
                <div style="background: var(--glass-bg); backdrop-filter: blur(10px); border: 1px solid var(--glass-border); border-radius: var(--border-radius); padding: 2rem; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);">
                    <h2 style="font-size: 1.5rem; color: var(--primary); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                        <i class="fas fa-user-cog"></i> Account Settings
                    </h2>
                    <div style="margin-bottom: 1.2rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.9rem;">Username</label>
                        <input type="text" value="${AppState.currentUser || 'Lion King'}" style="width: 100%; padding: 0.8rem 1rem; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 8px; color: var(--text-light); font-family: 'Poppins', sans-serif;">
                    </div>
                    <div style="margin-bottom: 1.2rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.9rem;">Bio</label>
                        <textarea style="width: 100%; padding: 0.8rem 1rem; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 8px; color: var(--text-light); font-family: 'Poppins', sans-serif; min-height: 80px;">King of the jungle!</textarea>
                    </div>
                    <button class="btn btn-primary" onclick="showNotification('Profile updated successfully!', 'success')" style="width: 100%;">Save Changes</button>
                </div>
                
                <!-- Stats -->
                <div style="background: var(--glass-bg); backdrop-filter: blur(10px); border: 1px solid var(--glass-border); border-radius: var(--border-radius); padding: 2rem; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);">
                    <h2 style="font-size: 1.5rem; color: var(--primary); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                        <i class="fas fa-chart-line"></i> Your Stats
                    </h2>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; padding: 1rem; background: rgba(0, 0, 0, 0.3); border-radius: 8px;">
                            <span style="color: var(--text-muted);">Total RAWR Mined</span>
                            <span style="color: var(--primary); font-weight: 600;">${AppState.totalMined.toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 1rem; background: rgba(0, 0, 0, 0.3); border-radius: 8px;">
                            <span style="color: var(--text-muted);">Games Played</span>
                            <span style="color: var(--primary); font-weight: 600;">127</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 1rem; background: rgba(0, 0, 0, 0.3); border-radius: 8px;">
                            <span style="color: var(--text-muted);">Win Rate</span>
                            <span style="color: var(--primary); font-weight: 600;">68%</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 1rem; background: rgba(0, 0, 0, 0.3); border-radius: 8px;">
                            <span style="color: var(--text-muted);">Referrals</span>
                            <span style="color: var(--primary); font-weight: 600;">5</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getAdminHTML() {
    return `
        <div style="padding: 120px 2rem 60px; text-align: center; background: linear-gradient(135deg, rgba(26, 26, 26, 0.8), rgba(45, 24, 16, 0.8)); border-bottom: 1px solid var(--glass-border); margin-bottom: 2rem;">
            <h1 style="font-size: 3rem; margin-bottom: 0.5rem; background: linear-gradient(to right, var(--primary), var(--secondary)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 20px rgba(255, 215, 0, 0.2);">Admin Dashboard</h1>
            <p style="font-size: 1rem; color: var(--text-muted);">Manage users, KYC requests, and system settings</p>
        </div>
        
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 2rem 2rem;">
            <!-- Stats Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                <div style="background: var(--glass-bg); padding: 2rem; border-radius: var(--border-radius); border: 1px solid var(--glass-border);">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <div style="width: 50px; height: 50px; background: rgba(255, 215, 0, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;"><i class="fas fa-users"></i></div>
                        <div>
                            <div style="font-size: 2rem; font-weight: 700; color: var(--primary);">1,247</div>
                            <div style="color: var(--text-muted); font-size: 0.9rem;">Total Users</div>
                        </div>
                    </div>
                </div>
                
                <div style="background: var(--glass-bg); padding: 2rem; border-radius: var(--border-radius); border: 1px solid var(--glass-border);">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <div style="width: 50px; height: 50px; background: rgba(40, 167, 69, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;"><i class="fas fa-user-check"></i></div>
                        <div>
                            <div style="font-size: 2rem; font-weight: 700; color: var(--success);">1,195</div>
                            <div style="color: var(--text-muted); font-size: 0.9rem;">Active Users</div>
                        </div>
                    </div>
                </div>
                
                <div style="background: var(--glass-bg); padding: 2rem; border-radius: var(--border-radius); border: 1px solid var(--glass-border);">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <div style="width: 50px; height: 50px; background: rgba(255, 165, 0, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;"><i class="fas fa-id-card"></i></div>
                        <div>
                            <div style="font-size: 2rem; font-weight: 700; color: var(--primary-dark);">23</div>
                            <div style="color: var(--text-muted); font-size: 0.9rem;">Pending KYC</div>
                        </div>
                    </div>
                </div>
                
                <div style="background: var(--glass-bg); padding: 2rem; border-radius: var(--border-radius); border: 1px solid var(--glass-border);">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <div style="width: 50px; height: 50px; background: rgba(59, 130, 246, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;"><i class="fas fa-dice"></i></div>
                        <div>
                            <div style="font-size: 2rem; font-weight: 700; color: var(--info);">8,934</div>
                            <div style="color: var(--text-muted); font-size: 0.9rem;">Games Played</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Recent Users Table -->
            <div style="background: var(--glass-bg); backdrop-filter: blur(10px); border: 1px solid var(--glass-border); border-radius: var(--border-radius); padding: 2rem; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);">
                <h2 style="font-size: 1.5rem; color: var(--primary); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                    <i class="fas fa-users"></i> Recent Users
                </h2>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="text-align: left; padding: 1rem; background: rgba(0, 0, 0, 0.3); color: var(--primary); font-weight: 500; border-bottom: 1px solid rgba(255, 215, 0, 0.1);">
                                <th style="padding: 1rem;">User</th>
                                <th style="padding: 1rem;">Email</th>
                                <th style="padding: 1rem;">RAWR Balance</th>
                                <th style="padding: 1rem;">Status</th>
                                <th style="padding: 1rem;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${generateAdminUserRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function generateAdminUserRows() {
    const users = [
        { username: 'LionKing', email: 'lion@rawr.casino', balance: 5234.56, status: 'active' },
        { username: 'SavannaQueen', email: 'queen@rawr.casino', balance: 4892.33, status: 'active' },
        { username: 'JungleAlpha', email: 'alpha@rawr.casino', balance: 4521.87, status: 'kyc_pending' },
        { username: 'BeastMaster', email: 'beast@rawr.casino', balance: 3987.42, status: 'active' },
        { username: 'WildRoar', email: 'wild@rawr.casino', balance: 3654.11, status: 'active' },
    ];
    
    return users.map(user => `
        <tr style="padding: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
            <td style="padding: 1rem; font-weight: 500;">${user.username}</td>
            <td style="padding: 1rem; color: var(--text-muted);">${user.email}</td>
            <td style="padding: 1rem; color: var(--primary); font-weight: 600;">${user.balance.toFixed(2)}</td>
            <td style="padding: 1rem;">
                <span style="display: inline-block; padding: 0.25rem 0.75rem; background: ${user.status === 'active' ? 'rgba(40, 167, 69, 0.2)' : 'rgba(255, 165, 0, 0.2)'}; color: ${user.status === 'active' ? '#28a745' : '#FFA500'}; border-radius: 5px; font-size: 0.85rem; font-weight: 500;">
                    ${user.status === 'active' ? 'Active' : 'KYC Pending'}
                </span>
            </td>
            <td style="padding: 1rem;">
                <button class="btn btn-secondary" onclick="showNotification('User management (Demo)', 'info')" style="padding: 0.5rem 1rem; font-size: 0.85rem;">
                    <i class="fas fa-edit"></i> Manage
                </button>
            </td>
        </tr>
    `).join('');
}

// Tab-specific functionality initialization
function initializeTabFunctionality(tabName) {
    switch(tabName) {
        case 'mining':
            startMiningTimer();
            break;
        case 'games':
            // Games initialization
            break;
    }
}

// Helper Functions
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const toggle = field.nextElementSibling;
    if (field.type === 'password') {
        field.type = 'text';
        toggle.textContent = '🙈';
    } else {
        field.type = 'password';
        toggle.textContent = '👁️';
    }
}

function roarSound() {
    const lion = document.querySelector('.lion-emoji');
    if (lion) {
        lion.style.animation = 'none';
        setTimeout(() => {
            lion.style.animation = 'bounce 2s ease-in-out infinite';
        }, 100);
    }
    
    showFloatingText('RAWR! 🦁');
}

function roarEffect() {
    const lion = document.querySelector('.logo-header .lion-emoji');
    const header = document.querySelector('.logo-header h1');
    if (lion) {
        const originalTransform = lion.style.transform;
        lion.style.transform = 'scale(1.3) rotate(10deg)';
        lion.style.filter = 'brightness(1.5)';
        
        if (header) {
            header.style.transform = 'scale(1.08) rotate(-2deg)';
            header.style.filter = 'brightness(1.2)';
        }
        
        showFloatingText('RAWR!');
        
        setTimeout(() => {
            lion.style.transform = originalTransform;
            lion.style.filter = '';
            if (header) {
                header.style.transform = '';
                header.style.filter = '';
            }
        }, 300);
    }
}

function showFloatingText(text) {
    const floatingText = document.createElement('div');
    floatingText.textContent = text;
    floatingText.style.cssText = `
        position: fixed;
        top: 30%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 2rem;
        font-weight: bold;
        color: var(--primary);
        pointer-events: none;
        z-index: 1000;
        animation: fadeUpOut 2s ease-out forwards;
        text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    `;
    document.body.appendChild(floatingText);
    setTimeout(() => {
        floatingText.remove();
    }, 2000);
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const textElement = notification.querySelector('.notification-text');
    notification.classList.remove('success', 'error', 'info', 'show');
    textElement.textContent = message;
    notification.classList.add(type);
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

function createFloatingPaws() {
    const pawContainers = document.querySelectorAll('#lionPaws, .floating-paws');
    pawContainers.forEach(container => {
        const pawCount = 20;
        for (let i = 0; i < pawCount; i++) {
            const paw = document.createElement('div');
            paw.className = 'paw';
            paw.textContent = '🐾';
            paw.style.left = Math.random() * 100 + 'vw';
            paw.style.top = Math.random() * 100 + 'vh';
            paw.style.animationDelay = Math.random() * 15 + 's';
            paw.style.animationDuration = 10 + Math.random() * 20 + 's';
            container.appendChild(paw);
        }
    });
}

// Authentication Functions
function handleLogin(e) {
    e.preventDefault();
    const username = e.target.username.value.trim();
    const password = e.target.password.value;
    
    if (!username || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Demo login - always succeeds
    AppState.currentUser = username;
    AppState.isLoggedIn = true;
    saveState();
    
    showNotification('Welcome to the jungle!', 'success');
    setTimeout(() => {
        showScreen('dashboard-screen');
        updateBalances();
    }, 1000);
}

function handleRegister(e) {
    e.preventDefault();
    const username = e.target.reg_username.value.trim();
    const email = e.target.reg_email.value.trim();
    const password = e.target.reg_password.value;
    const confirmPassword = e.target.reg_confirm.value;
    const terms = e.target.terms.checked;
    
    if (!username || !email || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (!terms) {
        showNotification('Please accept the terms', 'error');
        return;
    }
    
    // Demo registration - always succeeds
    AppState.currentUser = username;
    AppState.isLoggedIn = true;
    saveState();
    
    showNotification('Account created successfully!', 'success');
    setTimeout(() => {
        showScreen('dashboard-screen');
        updateBalances();
    }, 1000);
}

function handleLogout() {
    AppState.isLoggedIn = false;
    AppState.currentUser = null;
    saveState();
    showNotification('Logged out successfully', 'info');
    showScreen('landing-screen');
}

// Sidebar Management
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    sidebar.classList.toggle('active');
    menuToggle.classList.toggle('active');
}

function setupEventListeners() {
    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.getElementById('menuToggle');
        
        if (sidebar && sidebar.classList.contains('active') &&
            !sidebar.contains(e.target) &&
            !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    });
}

// Balance Management
function updateBalances() {
    const rawrElement = document.getElementById('rawr-balance');
    const ticketElement = document.getElementById('ticket-balance');
    
    if (rawrElement) {
        rawrElement.textContent = AppState.rawrBalance.toFixed(2);
    }
    if (ticketElement) {
        ticketElement.textContent = AppState.ticketBalance;
    }
}

function addBalance(rawr = 0, tickets = 0) {
    AppState.rawrBalance += rawr;
    AppState.ticketBalance += tickets;
    updateBalances();
    saveState();
}

// Mining Functions
function handleMining() {
    const timeSinceLastMine = Date.now() - AppState.lastMineTime;
    const miningCooldown = 30 * 60 * 1000;
    
    if (timeSinceLastMine < miningCooldown) {
        showNotification('Mining is on cooldown!', 'error');
        return;
    }
    
    const reward = 15 * AppState.miningLevel;
    AppState.lastMineTime = Date.now();
    AppState.totalMined += reward;
    addBalance(reward, 0);
    
    showNotification(`Mined ${reward.toFixed(2)} RAWR!`, 'success');
    saveState();
    
    // Reload mining tab
    loadDashboardContent('mining');
}

let miningTimerInterval = null;

function startMiningTimer() {
    if (miningTimerInterval) {
        clearInterval(miningTimerInterval);
    }
    
    miningTimerInterval = setInterval(() => {
        const timerElement = document.getElementById('mining-timer');
        const mineBtn = document.getElementById('mine-btn');
        
        if (!timerElement || !mineBtn) {
            clearInterval(miningTimerInterval);
            return;
        }
        
        const timeSinceLastMine = Date.now() - AppState.lastMineTime;
        const miningCooldown = 30 * 60 * 1000;
        const canMine = timeSinceLastMine >= miningCooldown;
        
        if (canMine) {
            timerElement.textContent = 'Ready to Mine!';
            mineBtn.disabled = false;
            mineBtn.style.opacity = '1';
            mineBtn.style.cursor = 'pointer';
            mineBtn.innerHTML = '<i class="fas fa-pickaxe"></i> Claim Rewards';
        } else {
            const remainingTime = Math.ceil((miningCooldown - timeSinceLastMine) / 1000);
            timerElement.textContent = formatTime(remainingTime);
            mineBtn.disabled = true;
            mineBtn.style.opacity = '0.5';
            mineBtn.style.cursor = 'not-allowed';
            mineBtn.innerHTML = '<i class="fas fa-pickaxe"></i> Mining...';
        }
    }, 1000);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Game Functions
function playGame(gameName) {
    const gameNames = {
        'slots': 'Jungle Slots',
        'roulette': 'Safari Roulette',
        'finding-simba': 'Finding Simba',
        'dice-of-beast': 'Dice of Beast',
        'lions-prowl': "Lion's Prowl"
    };
    
    showNotification(`Loading ${gameNames[gameName]}...`, 'info');
    
    setTimeout(() => {
        // Simulate game play
        const won = Math.random() > 0.5;
        const amount = Math.floor(Math.random() * 50) + 10;
        
        if (won) {
            addBalance(0, amount);
            showNotification(`You won ${amount} tickets!`, 'success');
        } else {
            if (AppState.ticketBalance >= 10) {
                addBalance(0, -10);
                showNotification('Better luck next time!', 'info');
            } else {
                showNotification('Insufficient tickets!', 'error');
            }
        }
    }, 1500);
}

// Wallet Functions
function connectWallet() {
    showNotification('Connecting to MetaMask...', 'info');
    
    setTimeout(() => {
        showNotification('Wallet connected! (Demo)', 'success');
    }, 1500);
}

function convertTokens() {
    const amount = parseFloat(document.getElementById('convert-amount').value);
    const direction = document.getElementById('convert-direction').value;
    
    if (!amount || amount <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }
    
    if (direction === 'rawr-to-tickets') {
        if (AppState.rawrBalance < amount) {
            showNotification('Insufficient RAWR balance', 'error');
            return;
        }
        const tickets = Math.floor(amount / 20);
        addBalance(-amount, tickets);
        showNotification(`Converted ${amount.toFixed(2)} RAWR to ${tickets} Tickets`, 'success');
    } else {
        if (AppState.ticketBalance < amount) {
            showNotification('Insufficient ticket balance', 'error');
            return;
        }
        const rawr = amount * 20;
        addBalance(rawr, -amount);
        showNotification(`Converted ${amount} Tickets to ${rawr.toFixed(2)} RAWR`, 'success');
    }
    
    document.getElementById('convert-amount').value = '';
}

// Daily Rewards
function claimDaily(day) {
    const rewards = {
        1: { rawr: 5, tickets: 1 },
        2: { rawr: 10, tickets: 2 },
        3: { rawr: 15, tickets: 3 },
        4: { rawr: 20, tickets: 4 },
        5: { rawr: 30, tickets: 5 },
        6: { rawr: 50, tickets: 6 },
        7: { rawr: 100, tickets: 10 },
    };
    
    const reward = rewards[day];
    AppState.claimedRewardDays = AppState.claimedRewardDays || [1, 2, 3];
    if (reward && !AppState.claimedRewardDays.includes(Number(day)) && Number(day) === Math.min(7, AppState.loginStreak + 1)) {
        addBalance(reward.rawr, reward.tickets);
        AppState.claimedRewardDays.push(Number(day));
        AppState.loginStreak = day;
        showNotification(`Claimed ${reward.rawr} RAWR + ${reward.tickets} Tickets!`, 'success');
        saveState();
        
        // Reload daily tab
        setTimeout(() => {
            loadDashboardContent('daily');
        }, 1500);
    }
}

function claimChallenge(name) {
    const rewards = { 'Daily Login': [0, 100], 'Daily Mining': [25, 0], 'Casino Enthusiast': [0, 15], 'Referral Master': [50, 0], 'Big Spender': [0, 100], 'Mining Master': [0, 500], 'Game Enthusiast': [0, 150], 'RAWR Millionaire': [1000, 0], 'Casino Royal': [0, 500], 'Jungle King': [200, 0], 'Loyal Lion': [0, 100] };
    if (AppState.challengeClaims?.[name] || !rewards[name]) return;
    const [rawr, tickets] = rewards[name]; addBalance(rawr, tickets);
    AppState.challengeClaims = AppState.challengeClaims || {}; AppState.challengeClaims[name] = true; saveState();
    showNotification(`Claimed ${rawr ? `${rawr} RAWR` : `${tickets} Tickets`} for ${name}!`, 'success');
    setTimeout(() => loadDashboardContent('daily'), 300);
}

// Leaderboard
function switchLeaderboardTab(tab) {
    const rawrBtn = document.getElementById('rawr-tab');
    const ticketsBtn = document.getElementById('tickets-tab');
    
    if (tab === 'rawr') {
        rawrBtn.classList.remove('btn-secondary');
        rawrBtn.classList.add('btn-primary');
        ticketsBtn.classList.remove('btn-primary');
        ticketsBtn.classList.add('btn-secondary');
    } else {
        ticketsBtn.classList.remove('btn-secondary');
        ticketsBtn.classList.add('btn-primary');
        rawrBtn.classList.remove('btn-primary');
        rawrBtn.classList.add('btn-secondary');
    }
}

// State Management
function saveState() {
    localStorage.setItem('rawr_state', JSON.stringify(AppState));
}

function loadState() {
    const savedState = localStorage.getItem('rawr_state');
    if (savedState) {
        try {
            const loaded = JSON.parse(savedState);
            Object.assign(AppState, loaded);
        } catch (e) {
            console.error('Failed to load state:', e);
        }
    }
}
