# Backend — GrowEasy CSV Importer API

Express API that parses an uploaded CSV, maps rows to the GrowEasy CRM schema
using OpenAI (batched + retried), validates the output deterministically, and
returns structured JSON.

## Run
```bash
npm install
cp .env.example .env    # add your OPENAI_API_KEY
npm run dev             # http://localhost:5000
npm test                # unit tests
```

## Endpoints
- `POST /api/import` — multipart `file` field (CSV). Returns imported/skipped/totals.
- `GET  /api/health` — status probe.

## Layout
- `config/`      env + CRM schema (single source of truth)
- `prompts/`     the extraction system prompt
- `services/`    csv parsing + OpenAI (batching, concurrency, retry)
- `controllers/` request orchestration + skip logic
- `middleware/`  multer upload + centralized errors
- `utils/`       helpers + deterministic normalizer/validator

See the root `README.md` and `DEPLOYMENT.md` for full docs and hosting steps.
