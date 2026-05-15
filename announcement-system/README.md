# Terra Ferro Tech Announcement System

This folder contains a ready-to-deploy reference implementation for an announcement module built with:

- Backend: FastAPI + PostgreSQL + SQLAlchemy 2.0
- Media storage: Cloudflare R2 via S3-compatible presigned URLs
- Frontend: Next.js + Tailwind CSS + Framer Motion + Lucide Icons

## Structure

- `backend/` FastAPI app with CRUD and upload endpoints
- `frontend/` Next.js components for admin CMS and public feed

## Database model

`announcements` table

- `id`: UUID primary key
- `title`: short string
- `content`: markdown text stored as `TEXT`
- `media_data`: JSONB array of media objects
- `created_at`: timestamp
- `is_active`: boolean

## Media strategy

Small files use a single presigned PUT URL.
Large videos use multipart upload sessions so the client can upload in parts directly to R2.

## Environment variables

Backend:

- `DATABASE_URL`
- `JWT_SECRET`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_BASE_URL`

Frontend:

- `NEXT_PUBLIC_API_BASE_URL`

## Run locally

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```
