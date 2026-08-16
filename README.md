# DreamEvents

A trust-first marketplace connecting people planning weddings and events in Sukkur with verified venues, caterers, photographers, and decorators.

## Stack

| App | Folder | Stack | Deploy |
|---|---|---|---|
| Frontend | `frontend/` | Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui | Vercel |
| Backend | `backend/` | Express 5, TypeScript, MongoDB + Mongoose 8, Socket.IO | Northflank |

Full specification lives in `prompt_files/` (PRD, TRD, App Flow, UI/UX Brief, Backend Schema, Implementation Plan).

## Prerequisites

- Node.js 20+
- pnpm 9+

## Getting started

```bash
pnpm install
cp backend/.env.example backend/.env  # fill in real values
cp frontend/.env.example frontend/.env.local
pnpm dev  # frontend :3000, backend :4000
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Run both apps in watch mode (Turborepo) |
| `pnpm build` | Build both apps |
| `pnpm type-check` | Type-check both apps |
| `pnpm lint` | Lint both apps |
| `pnpm seed` | Run backend seed scripts |

## Project structure

```
dreamevents/
├── frontend/  Next.js app (public + customer + seller + admin route groups)
├── backend/  Express API (models, controllers, routes, middleware, sockets)
└── prompt_files/  Product specification documents (source of truth)
```