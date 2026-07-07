# GrowEasy — AI-Powered CSV Importer

Upload **any** lead CSV — Facebook export, Google Ads, a real-estate CRM dump, a
marketing agency sheet, or a spreadsheet made by hand — and an LLM figures out
which column means what and maps everything into the **GrowEasy CRM schema**.

The hard part is not parsing CSV. The hard part is that every source uses
different column names, ordering and structure. This project solves that with a
carefully engineered extraction prompt plus a deterministic validation layer.

- **Frontend:** React (Vite)
- **Backend:** Node.js + Express
- **AI:** OpenAI (`gpt-4o-mini` by default — swappable via env)

---

## How it works

```
 Upload CSV        Preview            Confirm            AI Extraction         Result
 (drag/drop) ──▶  parse & show  ──▶  send file to  ──▶  batched OpenAI    ──▶  parsed + skipped
                  raw table          the backend        + validation          + totals
```

1. **Frontend** parses the CSV client-side (PapaParse) only to render a preview.
   No AI runs yet.
2. On **Confirm**, the original file is uploaded to the backend.
3. **Backend** does its own authoritative parse, splits rows into **batches**,
   and sends each batch to the model with a strict system prompt.
4. Model output passes through a **deterministic normalizer** that whitelists
   enums, keeps `created_at` JS-parseable, escapes newlines for CSV-safety, and
   applies the skip rule.
5. Records with **no email and no mobile** are skipped; everything else is
   returned with totals.

### Why a validation layer after the AI?

An LLM is great at *mapping* fuzzy columns but should never be the last word on
*hard rules*. So `crm_status` / `data_source` are whitelisted in code,
`created_at` is verified with `new Date()`, values are made CSV-safe, and the
"skip if no email and no mobile" rule is enforced deterministically. The model
proposes; the code disposes.

---

## CRM schema

`created_at, name, email, country_code, mobile_without_country_code, company,
city, state, country, lead_owner, crm_status, crm_note, data_source,
possession_time, description`

- **crm_status** ∈ `GOOD_LEAD_FOLLOW_UP · DID_NOT_CONNECT · BAD_LEAD · SALE_DONE` (else `""`)
- **data_source** ∈ `leads_on_demand · meridian_tower · eden_park · varah_swamy · sarjapur_plots` (else `""`)
- Extra emails / phone numbers are appended into **crm_note**.

---

## Project structure

```
groweasy-csv-importer/
├── backend/                 # Express API
│   ├── src/
│   │   ├── config/          # env + CRM schema (single source of truth)
│   │   ├── prompts/         # the AI extraction prompt
│   │   ├── services/        # csv parsing + OpenAI (batching, retry)
│   │   ├── controllers/     # /api/import orchestration
│   │   ├── middleware/      # multer upload + error handling
│   │   ├── utils/           # helpers + deterministic normalizer
│   │   └── index.js
│   ├── test/                # unit tests (node:test, no extra deps)
│   ├── .env.example
│   └── Dockerfile
├── frontend/                # React (Vite) app
│   ├── src/
│   │   ├── components/       # Uploader, PreviewTable, Processing, ResultView…
│   │   ├── hooks/            # theme
│   │   ├── api/              # backend client
│   │   └── styles/
│   ├── .env.example
│   └── vercel.json
└── sample-data/             # messy CSVs with different layouts to test mapping
```

---

## Run locally

**Prerequisites:** Node.js 18.17+ and an OpenAI API key.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env         # then paste your OPENAI_API_KEY into .env
npm run dev                  # http://localhost:5000  (health: /api/health)
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env         # leave VITE_API_URL as http://localhost:5000 for local
npm run dev                  # http://localhost:5173
```

Open the frontend, drop a file from `sample-data/`, confirm, and watch it map.

### Run the tests

```bash
cd backend
npm test
```

---

## API

### `POST /api/import`
Multipart form with a `file` field (the CSV). Returns:

```json
{
  "success": true,
  "data": {
    "imported": [ { "created_at": "…", "name": "…", "email": "…", "...": "…" } ],
    "skipped":  [ { "row": 3, "reason": "No email or mobile number found", "original": { } } ],
    "totalRows": 4,
    "totalImported": 3,
    "totalSkipped": 1,
    "detectedHeaders": ["…"],
    "model": "gpt-4o-mini"
  }
}
```

### `GET /api/health`
Simple status probe for uptime checks and deploy platforms.

---

## Environment variables

**Backend** (`backend/.env`)

| Key | Default | Notes |
|-----|---------|-------|
| `OPENAI_API_KEY` | — | **Required.** |
| `OPENAI_MODEL` | `gpt-4o-mini` | Any chat model that supports JSON mode. |
| `PORT` | `5000` | |
| `BATCH_SIZE` | `15` | Rows per model call. |
| `BATCH_CONCURRENCY` | `3` | Parallel batches. |
| `MAX_RETRIES` | `3` | Per-batch retry with backoff. |
| `CORS_ORIGIN` | `*` | Set to your frontend URL in production. |

**Frontend** (`frontend/.env`)

| Key | Default | Notes |
|-----|---------|-------|
| `VITE_API_URL` | `http://localhost:5000` | Set to your deployed backend URL. |

---

## Deploy for free

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for step-by-step instructions to host
the backend on **Render** and the frontend on **Vercel**, both on free tiers.

---

## Features & bonus checklist

- [x] Drag & drop **and** file-picker upload
- [x] CSV preview with sticky headers + horizontal/vertical scroll
- [x] Confirm-before-process flow
- [x] Result view: parsed records, skipped records, totals
- [x] Intelligent AI field mapping across arbitrary column names
- [x] Strict enum + date + CSV-safety validation
- [x] Batch processing with bounded concurrency
- [x] Retry mechanism for failed AI batches (exponential backoff)
- [x] Loading / progress states + robust error handling
- [x] Dark mode (default) + light mode
- [x] CSV / JSON export of the mapped records
- [x] Unit tests (no extra dependencies)
- [x] Dockerfile for the backend
- [x] Clean, layered architecture
```
