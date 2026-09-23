# RAWR Casino — Static Frontend Demo

A GitHub Pages-ready, multi-page frontend mirror of the RAWR Casino PHP/MySQL webapp. Each screen is a real standalone `.html` file under `pages/`; shared CSS and JavaScript provide styling and local-only interactions. The PHP project remains the source of truth and is not copied into this folder.

## Run locally

Open `index.html` in a browser, or serve this folder with a static web server:

```bash
cd frontend-demo
python -m http.server 8000
```

Then visit `http://localhost:8000`. No PHP, database, package installation, or build step is needed. The pages use relative paths and work when hosted under a GitHub Pages repository subpath.

## Pages

- `pages/auth/` — login and registration
- `pages/dashboard/` — account dashboard
- `pages/mining/` — mining status, reward claim, upgrades, and history
- `pages/games/` — games lobby plus Jungle Slots, Safari Roulette, Finding Simba, Dice of Beast, and Lion's Prowl
- `pages/wallet/` — balances, conversion, simulated deposit/withdrawal, and history
- `pages/leaderboard/` — fictional RAWR and ticket rankings
- `pages/rewards/` — weekly check-in, missions, and achievements
- `pages/profile/` — account settings and simulated KYC
- `pages/admin/` — fictional admin dashboard, users, and KYC review

```text
frontend-demo/
├── index.html                 # HTML-only landing page
├── assets/                    # Logo and game artwork
├── css/                       # Shared theme and page styles
├── js/pages/                  # Shared shell and page interactions
├── demo-data/data.js          # Fictional demo fixtures
└── pages/
    ├── auth/                  # login.html, register.html
    ├── dashboard/index.html
    ├── mining/index.html
    ├── games/                 # lobby and five game pages
    ├── wallet/index.html
    ├── leaderboard/index.html
    ├── rewards/index.html
    ├── profile/index.html
    └── admin/                 # dashboard, users, KYC review
```

## Demo behavior

Register an account on the demo registration page, then sign in with the same username or email and password. Registration returns to the login page. Account details and each account's demo balances/profile are saved in that browser's `localStorage`; the password is stored as a salted PBKDF2 hash, not as plain text. Mining, games, conversion, deposit/withdrawal, profile edits, rewards, and admin actions remain fictional browser-only simulations.

### Superadmin preview account

Use this hard-coded account to preview the admin pages:

- Username: `superadmin`
- Password: `RawrAdmin2026!`

Signing in with this account opens the admin dashboard. Admin pages also require this demo role; regular player accounts are redirected to the login page. This account and its role are implemented entirely in public frontend code, so they are for portfolio previews only and provide no real security.

GitHub Pages can run this client-side demo flow, but the accounts exist only in that browser and on that site origin. They are not available to other visitors, browsers, or devices, and this is not production authentication. Use sample details and never reuse a real password. No real wallet is connected, no payment or token transaction is made, and KYC document uploads are disabled.

To reset demo data in the browser console:

```js
localStorage.removeItem('rawr_state');
localStorage.removeItem('rawr_demo_accounts_v1');
Object.keys(localStorage)
  .filter(key => key.startsWith('rawr_demo_account_state:'))
  .forEach(key => localStorage.removeItem(key));
localStorage.removeItem('rawr_demo_admin_data');
sessionStorage.removeItem('rawr_demo_session');
sessionStorage.removeItem('rawr_demo_registered_identifier');
location.reload();
```

## Publish with GitHub Pages

For this project repository, choose **Settings → Pages → Deploy from a branch**, then select the branch and `/frontend-demo` folder. If this folder is its own repository, select `/ (root)`. `.nojekyll` is included.

See [PAGE-MAP.md](PAGE-MAP.md) for the mapping from each of the 38 PHP files to a static page or intentional omission.
