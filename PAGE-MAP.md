# RAWR PHP to Static Demo Page Map

The source project contains **38 PHP files**. Page templates are represented by standalone HTML pages under `pages/`. The demo does not execute PHP, contact a backend, or depend on hash routing.

## User-facing pages

| Original PHP page | Static HTML page | Static demo behavior |
| --- | --- | --- |
| `index.php` | `index.html` | Landing page and links into the demo. |
| `public/login.php` | `pages/auth/login.html` | Local sign-in verifies registered demo accounts; the hard-coded superadmin demo account opens the admin console. |
| `public/register.php` | `pages/auth/register.html` | Creates a local fictional profile after form validation. |
| `public/dashboard.php` | `pages/dashboard/index.html` | Account summary and navigation to features. |
| `public/mining.php` | `pages/mining/index.html` | Mining cooldown, simulated claims, upgrades, and history. |
| `public/games.php` | `pages/games/index.html` | Lobby linking to five individual games. |
| `public/games/jungleSlots.php` | `pages/games/jungle-slots/index.html` | Slot reels, bet controls, result, and play history. |
| `public/games/safariRoulette.php` | `pages/games/safari-roulette/index.html` | Symbol selection, wheel result, and play history. |
| `public/games/findingsimba.php` | `pages/games/finding-simba/index.html` | Card selection and simulated reveal. |
| `public/games/diceofBeast.php` | `pages/games/dice-of-beast/index.html` | Beast selection and simulated dice result. |
| `public/games/lionsPrawl.php` | `pages/games/lions-prowl/index.html` | Tile exploration and simulated cash-out. |
| `public/wallet.php` | `pages/wallet/index.html` | Local balances, conversion, request forms, and transaction history. |
| `public/leaderboard.php` | `pages/leaderboard/index.html` | Fictional player rankings for RAWR and tickets. |
| `public/daily.php` | `pages/rewards/index.html` | Check-ins, daily missions, and achievements. |
| `public/profile.php` | `pages/profile/index.html` | Profile settings, password form, and simulated KYC status. |
| `public/logout.php` | Shared logout control in the page sidebar | Clears local sign-in state and returns to `index.html`. |
| `admin/admin_dashboard.php` | `pages/admin/dashboard.html` | Admin overview populated from fictional records. |
| `admin/manage_users.php` | `pages/admin/manage-users.html` | Searchable fictional account list. |
| `admin/edit_user.php` | `pages/admin/edit-user.html` | Local edits to a fictional account selected by query string. |
| `admin/kyc_requests.php` | `pages/admin/kyc-requests.html` | Sample KYC statuses and simulated review decisions. |

## PHP files intentionally not exposed as pages

| Original PHP file(s) | Classification and static treatment |
| --- | --- |
| `admin/get_kyc_request.php` | Admin JSON/AJAX endpoint; fictional KYC rows are rendered locally. |
| `admin/login_process.php` | Admin login processor; represented by the superadmin demo account on the shared login page. |
| `admin/process_kyc.php` | KYC processor; review actions update only local fictional data. |
| `backend/auth/login_process.php` | Login processor; represented by the local sign-in form. |
| `backend/auth/register_process.php` | Registration processor; represented by the local registration form. |
| `backend/cron/update_leaderboard_challenges.php` | Scheduled updater; the demo uses fixture rankings and progress. |
| `backend/games/diceofBeast_process.php` | Game processor; dice results are simulated in the page. |
| `backend/games/lionsPrawl_process.php` | Game processor; tile and cash-out outcomes are simulated. |
| `backend/games/safariRoulette.php` | Roulette JSON/AJAX processor; the game page simulates the wheel. |
| `backend/games/spin_jungleslots.php` | Slot processor; reels and payouts are simulated in the page. |
| `backend/games/update_tickets.php` | Ticket endpoint; balance changes use local browser state. |
| `backend/inc/auth.php` | Shared authentication/session helper; no static page equivalent. |
| `backend/inc/config.php` | Server configuration; intentionally excluded. |
| `backend/inc/db.php` | MySQL access layer; intentionally excluded. |
| `backend/inc/functions.php` | Backend utilities; visible UI behavior is recreated with local state. |
| `backend/inc/init.php` | Server bootstrap; intentionally excluded. |
| `backend/inc/security.php` | CSRF/security helpers; no static page equivalent. |
| `public/games/findingsimba_play.php` | Finding Simba action endpoint; card outcomes are simulated locally. |

## Assets and scope

The demo uses the six logo/game PNG assets copied to `assets/`. It does not include PHP, SQL dumps, environment files, secrets, uploaded identity documents, or user records. Source file coverage and page behavior were inventoried from the project PHP files; see this map for exclusions and simulated flows.

The source has no standalone forgot-password, reset-password, contact, referral, transaction, or admin-login page template. Those screens are not claimed as separate pages. All names, account records, rankings, balances, and KYC statuses shown in the demo are fictional.
