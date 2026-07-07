# Frontend — GrowEasy CSV Importer

React (Vite) app implementing the Upload → Preview → Extract → Result flow with
drag & drop upload, a scrollable sticky-header preview table, live processing
state, a results view (parsed + skipped + totals), CSV/JSON export, and
dark/light themes.

## Run
```bash
npm install
cp .env.example .env    # VITE_API_URL defaults to http://localhost:5000
npm run dev             # http://localhost:5173
npm run build           # production build -> dist/
```

Set `VITE_API_URL` to your deployed backend URL when hosting. See the root
`DEPLOYMENT.md`.
