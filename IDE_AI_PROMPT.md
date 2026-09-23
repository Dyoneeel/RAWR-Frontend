# Frontend Demo Maintenance Notes

This folder is a static mirror of the RAWR PHP/MySQL application. The PHP project outside this folder is the source of truth and must remain untouched when changing the portfolio demo.

## Runtime and pages

- `index.html` is a static landing page. Feature screens are standalone HTML documents under `pages/` and load their shared local styles and page behavior.
- Navigation uses relative document links so GitHub Pages can serve every page from a repository subpath.
- State belongs in `localStorage` and all external actions must remain visibly simulated.
- Do not add PHP, SQL, backend endpoints, real credentials, real user records, or identity documents.

## Source files

- `css/` contains the original theme styles, responsive layouts, and game/admin/account extensions.
- `js/pages/` contains the shared page shell, demo state, and individual page interaction modules.
- `demo-data/data.js` provides fictional public and admin fixtures.
- Legacy SPA modules may remain in the tree, but standalone pages should load `js/pages/` modules only.
- `PAGE-MAP.md` inventories every PHP file and explains its static equivalent or exclusion.

Keep all file references relative. Avoid external font, icon, script, API, or backend dependencies. The icon names from the source pages are rendered with local CSS glyphs in `css/icons.css`.
