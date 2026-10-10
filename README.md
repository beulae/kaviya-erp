# Kaviya Roadways ERP — Frontend

A production-ready frontend for **Kaviya Roadways and Logistics Services**, covering
authentication, dashboard, Bilty, Quotation and fleet/master data workflows for a
transport ERP. Built as an original implementation inspired by common transporter-ERP
workflows — no copyrighted code, assets or branding from any third-party product.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · TanStack Query · TanStack Table ·
React Router v7 · React Hook Form · Zod · Axios · Lucide Icons · Docker + Nginx

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build       # type-check + production build to dist/
npm run preview      # preview the production build locally
npm run lint         # ESLint
npm run format       # Prettier (writes changes)
```

## Running with Docker

```bash
docker compose up -d           # dev server with hot reload → http://localhost:5173
docker compose --profile prod up -d nginx   # production build served by Nginx → http://localhost:8080
```

## Project structure

```
src/
  app/            App shell: providers, router, theme, query client
  components/     Reusable UI (ui/), layout (layout/), tables (tables/), shared (common/)
  features/       Feature modules — auth, dashboard, bilty, quotation, customers,
                   drivers, vehicles, settings, profile — each with its own
                   pages/, components/, schemas/ and api/ (service + query hooks)
  layouts/        Route-level layouts (app shell vs. auth screens)
  routes/         Route guards (protected/guest) and error pages
  types/          Shared domain types
  api/            Axios instance (auth headers, refresh-token interceptor)
  services/       Mock data used until a real backend is connected
  hooks/          Cross-feature hooks
  utils/          Formatting, class-name helpers
  constants/      Navigation config, etc.
```

## Connecting a real backend 

The service layer (`src/features/*/api/*-service.ts`) currently simulates network
latency against in-memory mock data so every screen works standalone. Each function's
signature already matches a REST call — swap the body for an `apiClient` request (see
`src/api/axios-instance.ts`, which already handles auth headers and refresh-token
retry) and nothing else in the UI needs to change. Set `VITE_API_BASE_URL` in `.env`
(see `.env.example`) once the Node.js API is available.

## What's implemented vs. scaffolded

**Fully implemented:** Login/Register/Forgot/Reset Password, app shell (sidebar,
topbar, breadcrumb, theme switch, notifications), Dashboard (stat cards, charts,
recent activity), Bilty (list, multi-step create, view, edit), Quotation (list,
create with live total), Customers/Drivers/Vehicles master tables, Profile, Settings.

**Scaffolded, ready to extend** (same patterns as above — copy a feature folder and
its service/hook pair): Loading Advice, Dispatch, Branches, Routes, Invoice,
Payments, Ledger, Reports, and the remaining Settings sub-sections. These render a
placeholder screen via `components/common/coming-soon.tsx` so navigation and routing
stay complete while the backend for each is built out.

## Design tokens

Brand colors are defined as CSS variables in `src/styles/globals.css` (`--color-*`),
derived from the Kaviya Roadways logo (navy `#1f3690` / gold `#e6a015`), with a
parallel dark-mode palette. Update tokens there to re-theme the whole app.

https://gitlab.com/beula.epsiba/kaviya-erp
git remote add origin git@github.com:beula.epsiba/kaviya-erp.git

Important Docker Commands:
-------------------------
docker compose exec php php artisan make:controller UserController
docker compose exec mysql mysql -uroot -proot tracefly


Brings the docker up
--------------------
docker compose up -d --build
docker compose up -d

Brings the Frontend docker up
--------------------
docker compose exec node npm run dev
docker compose exec npx shadcn@latest add card

docker compose logs -f

Shut down
---------
Removes db:
docker compose down -v 
docker volume rm mysql_data
docker system prune --volumes

Safe:

docker compose down 
docker compose stop (wont remove db)