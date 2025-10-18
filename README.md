# Lingua Backend (Node.js + Express + MongoDB)

Production-ready backend for a Language Diagnostic Test platform with roles: **Admin**, **Teacher**, **Student** and exam modules: **Listening, Speaking, Reading, Writing**.

## Quick Start
```bash
cp .env.example .env
npm install
npm run dev
```
API: `http://localhost:${process.env.PORT or 8080}`

## Docker
```bash
docker compose up --build
```

## Auth
- Register: `POST /api/auth/register { name, email, password, role? }`
- Login: `POST /api/auth/login { email, password }`
- Google (stub): `POST /api/auth/google { email, name }`
Attach `Authorization: Bearer <token>` for protected routes.

## Roles
- Admin: `/api/admin/*`
- Teacher: `/api/teacher/*`
- Student: submissions via `/api/submissions`

## Submissions
- `POST /api/submissions` (multipart form, field `files` for speaking/writing)
- `GET /api/submissions/me`

## Exams & Tasks (Teacher)
- `POST /api/teacher/tasks`
- `GET /api/teacher/tasks?module=listening`
- `POST /api/teacher/exams`
- `GET /api/teacher/exams`

## Health
- `GET /health`
