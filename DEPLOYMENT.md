# RAWR Casino Frontend Demo — Deployment

The demo is static HTML, CSS, JavaScript, and local image assets. It has no build step or server dependency.

## GitHub Pages in this project repository

1. Push the repository to GitHub.
2. Open **Settings → Pages**.
3. Choose **Deploy from a branch**, select the branch, and set the folder to `/frontend-demo`.
4. Save and wait for the Pages build to finish.

Each route is an HTML file, so the landing page lives at `index.html` and feature pages are directly addressable under `pages/`, for example `pages/dashboard/index.html` and `pages/games/jungle-slots/index.html`.

## Publish as its own repository

Place the contents of `frontend-demo/` at the repository root and choose `/ (root)` in the Pages settings. `.nojekyll` is included. Relative paths and per-page `<base>` elements support GitHub Pages repository subpaths.

## Local preview

You can open `index.html` directly. To preview with a local static server:

```bash
python -m http.server 8000
```

Run the command from `frontend-demo/`, then visit `http://localhost:8000`.

## Demo limitations

Registration and login use client-side demo accounts stored in the visitor's browser. Passwords are stored as salted PBKDF2 hashes; account details, balances, and profile data stay in that browser's `localStorage` and are not shared between visitors, browsers, or devices. This is not production authentication. Use sample details and never reuse a real password. Payments, blockchain transactions, and KYC uploads are not connected.
