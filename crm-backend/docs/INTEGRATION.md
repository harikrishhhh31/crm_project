# CRM Backend — Implementation & Integration Report

_Last updated: 2026-10-04_

## 1. Stack

| Layer | Tech |
|---|---|
| API | NestJS 12 (TypeScript, ESM) |
| DB | PostgreSQL 18 (local, `localhost:5432`) |
| ORM | Prisma 6.19.3 |
| Auth | JWT access (15m) + refresh (7d), bcrypt |
| Docs | Swagger at `/api/docs` |
| AI bridge | FastAPI `crm-ai-service` on `localhost:8000` |

## 2. What is done

### Scaffold
- `nest new crm-backend` → running on `PORT=3000`
- `src/main.ts`: CORS enabled, global `ValidationPipe({ whitelist, transform })`, Swagger at `/api/docs`
- `src/app.module.ts`: global `ConfigModule`, `PrismaModule`, `AuthModule`, `KycModule`
- `.env`: `PORT`, `DATABASE_URL`, JWT secrets/expiry, `AI_SERVICE_URL`, `AI_SERVICE_API_KEY`

### Database
- Tables created: `User`, `RefreshToken`, `KycDocument`, `_prisma_migrations`
- Migrations: `20261004114300_init`, `20261004152502_add_kyc_document`
- Connection: `postgresql://postgres:root@localhost:5432/CRM_DB`

### Auth (`src/auth/`)
| Endpoint | Description |
|---|---|
| `POST /auth/register` | Create user, bcrypt-hash password, return user + access/refresh tokens |
| `POST /auth/login` | Verify credentials, return user + tokens |
| `POST /auth/refresh` | Verify refresh JWT, check DB hash/revocation/expiry, rotate token |
| `POST /auth/logout` | JWT-protected, revokes all refresh tokens for the user |

Supporting pieces:
- `strategies/jwt.strategy.ts` — validates Bearer access tokens on protected routes
- `guards/jwt-auth.guard.ts` — route guard
- `guards/roles.guard.ts` + `decorators/roles.decorator.ts` — `@Roles('ADMIN','MANAGER')`
- `decorators/current-user.decorator.ts` — `@CurrentUser()`
- DTOs validated via class-validator (`email`, `password >= 8`, role in `ADMIN|MANAGER|ADVISOR`)

### KYC integration (`src/kyc/`)
| Endpoint | Auth | Description |
|---|---|---|
| `POST /kyc/upload?customerId=` | any logged-in user | Multer memory upload (≤10MB, jpg/png/pdf) → forwards to FastAPI → persists `KycDocument` |
| `GET /kyc?customerId=` | logged-in | List KYC records |
| `GET /kyc/:id` | owner or ADMIN/MANAGER | Single record |
| `PATCH /kyc/:id/status` | MANAGER/ADMIN | Update `verificationStatus` |
| `DELETE /kyc/:id` | ADMIN | Delete record |

`KycDocument` columns: `fileId` (unique), `filename`, `storedAs`, `documentType`, `extractedText`, `fields` (JSON), `validationValid`, `validationErrors` (JSON), `confidence`, `verificationStatus`, `customerId` (optional), `uploadedById`, timestamps.

### FastAPI AI service (`crm-ai-service/`, branch `ai-integration`)
- `POST /api/v1/kyc/upload` — OCR (Tesseract) → detect PAN/Aadhaar/Passport/DL → extract fields → validate → confidence → `verified`/`pending`
- `app/core/security.py` — requires `X-API-Key` header (`AI_SERVICE_API_KEY`, default `dev-crm-ai-key-2026`) applied to the OCR router; `/` and `/health` open
- Tesseract installed at `C:\Program Files\Tesseract-OCR\tesseract.exe`

### Frontend (`frontend-work` branch, `frontend/`)
- Login now calls real `POST /auth/login`, stores access/refresh tokens in `sessionStorage`
- New page `src/pages/kyc/KycUploadPage.tsx` routed at `/kyc/upload`, nav item "KYC Upload"
- `VITE_API_URL=http://localhost:3000` in `.env.local`
- `tsc -b` clean

## 3. How to run locally

```powershell
# Terminal 1 — AI service
cd crm_project_ai\crm-ai-service
uvicorn app.main:app --reload --port 8000

# Terminal 2 — backend
cd crm_project\crm-backend
npm run start:dev

# Terminal 3 — frontend
cd crm_project_frontend\frontend
npm run dev
```

Then: `http://localhost:5173/login` → sign in → **KYC Upload** → choose a PAN/Aadhaar/passport JPG/PNG/PDF → result appears and a row is written to `KycDocument`.

## 4. Branches

| Branch | Contains |
|---|---|
| `backend` | NestJS scaffold + Prisma + auth + KYC proxy |
| `ai-integration` | FastAPI security hardening |
| `frontend-work` | Login wired to backend + KYC upload page |
| `frontend` (remote) | Original frontend, untouched |
| `meghna-kyc-ocr` (remote) | Original AI service, untouched |
| `main` | Untouched |

## 5. Gaps / next steps

- Seed an admin user for out-of-the-box admin access
- FastAPI placeholder modules (`claims.py`, `document_service.py`, `notification_service.py`, `config.py`, `file_validation.py`, `logging.py`) still empty — implement or remove
- Tesseract path hardcoded in `ocr_service.py` — move to env var
- Frontend: no KYC list/detail view wired to `GET /kyc`; `useCrmData` still reads mocks for customers/renewals/contests
- Role guard on frontend (lowercase) vs backend (uppercase) — mapped in `AuthProvider`, keep in sync
- Postgres `pg_hba.conf` is currently `trust` from debugging — restore `scram-sha-256` before sharing the machine
