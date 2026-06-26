# XICO AI — xicoai.com

The official website of **长沙智希可科技有限公司 (Changsha Xico Technology Co., Ltd.)** — an
AI‑native product studio. A trilingual (中 / 日 / 英), dark‑tech marketing site plus a
careers system, an investor/partner `/join` flow, and a lightweight admin console.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, TypeScript, Turbopack) |
| Styling | Tailwind CSS v4 + custom design system (`src/app/globals.css`) |
| i18n | next-intl (zh default, `/ja`, `/en`) |
| Motion | Framer Motion |
| Database | PostgreSQL + Drizzle ORM |
| Forms | React Server Actions (`src/app/actions`) |
| Email | Nodemailer via Aliyun enterprise SMTP |
| Auth (admin) | Signed JWT cookie (`jose`) |

## Features

- Marketing: home, about (+ founder story), capabilities, work, contact
- **Careers**: job postings managed in `/admin`, public list + detail, online
  application with résumé upload
- **/join**: investor / project‑partner / collaborator submissions
- **/admin**: dashboard, job CRUD, applications pipeline, join & contact inboxes
- SEO: trilingual `sitemap.xml`, `robots.txt`, per‑locale metadata

## Local development

```bash
pnpm install
cp .env.example .env.local   # fill DATABASE_URL etc.
pnpm db:push                 # create tables in your Postgres
pnpm dev
```

Open http://localhost:3000.

## Environment

See [`.env.example`](.env.example). Key vars: `DATABASE_URL`, `ADMIN_USERNAME`,
`ADMIN_PASSWORD`, `AUTH_SECRET`, `SMTP_*`, `UPLOAD_DIR`.

## Production (Docker)

```bash
cp .env.example .env         # set POSTGRES_PASSWORD, ADMIN_*, AUTH_SECRET, SMTP_*
docker compose up -d --build
# apply schema + seed:
docker compose exec -T db psql -U xico -d xico < drizzle/0000_*.sql
docker compose exec -T db psql -U xico -d xico < drizzle/seed.sql
```

The app listens on container port `3000`; put it behind a reverse proxy
(this deployment uses Nginx Proxy Manager) for TLS.
