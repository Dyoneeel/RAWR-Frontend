# RAWR Static Demo — Quick Start

## Run it locally

Open `index.html` in a modern browser, or start a static server from this folder:

```bash
python -m http.server 8000
```

Visit `http://localhost:8000`. No PHP, database, API, build tool, or dependency install is required.

## Try the demo

- Register a demo account, then log in from the login page using its username or email and password. The account is saved only in this browser.
- Each feature is a standalone HTML page under `pages/`; use the shared sidebar to move between the dashboard, mining, five games, wallet, leaderboard, rewards, profile/KYC, and admin.
- All balances, game outcomes, profiles, transactions, and admin changes are fictional and local to your browser.
- KYC document inputs are disabled. No real wallet, payment, or token transfer is connected.

## Deploy to GitHub Pages

Push this repository, then open **Settings → Pages** and select the branch and `/frontend-demo` folder. For a repository containing only this demo, publish from `/ (root)`. The pages use relative paths and work at a project URL such as `https://USERNAME.github.io/REPOSITORY/`.

## Reset local demo data

In the browser console run:

```js
localStorage.removeItem('rawr_state');
localStorage.removeItem('rawr_demo_accounts_v1');
Object.keys(localStorage).filter(key => key.startsWith('rawr_demo_account_state:')).forEach(key => localStorage.removeItem(key));
localStorage.removeItem('rawr_demo_admin_data');
sessionStorage.removeItem('rawr_demo_session');
sessionStorage.removeItem('rawr_demo_registered_identifier');
location.reload();
```

See [README.md](README.md) for scope and [PAGE-MAP.md](PAGE-MAP.md) for the full PHP inventory.
