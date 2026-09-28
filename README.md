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

## Connecting a real backend and PostgreSQL

The frontend already uses a centralized Axios client in `src/api/axios-instance.ts`.
Set the API base URL before the app talks to your backend service:

```env
# .env
VITE_API_BASE_URL=http://localhost:3000/api
```

If the backend runs in Docker, use the container host instead of `localhost`:

```env
VITE_API_BASE_URL=http://host.docker.internal:3000/api
```

When the frontend is served behind Nginx, keep it as:

```env
VITE_API_BASE_URL=/api/v1
```

### PostgreSQL connection details

The Node.js/Express backend should connect to PostgreSQL using environment variables
similar to these:

```env
# backend .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kaviya_erp
DB_USER=postgres
DB_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kaviya_erp
PORT=3000
```

If the backend is inside Docker and PostgreSQL is another container on the same
network, use the service name instead of `localhost`:

```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=kaviya_erp
DB_USER=postgres
DB_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/kaviya_erp
```

### PostgreSQL in Docker

Example `docker-compose.yml` service for the database:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: kaviya-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: kaviya_erp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Then configure the backend to use:

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/kaviya_erp
```

### Connection steps

1. Start PostgreSQL.
2. Create the database if it does not exist:

```bash
createdb kaviya_erp
```

or from psql:

```bash
psql -U postgres -h localhost -p 5432
CREATE DATABASE kaviya_erp;
```

3. Add the backend database variables to the backend `.env` file.
4. Run the backend server.
5. Confirm the app can reach the API at:

```bash
curl http://localhost:3000/api/health
```

or if the backend is being proxied through nginx:

```bash
curl http://localhost:8080/api/health
```

6. Start the frontend:

```bash
npm install
npm run dev
```

The frontend uses the backend API; the backend is the component that connects to PostgreSQL and handles database reads/writes.

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


Brings the docker up
--------------------
docker compose up -d --build
docker compose up -d
docker compose build --no-cache

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
docker system prune -a
docker rmi -f $(docker images -aq)

Safe:

docker compose down 
docker compose stop (wont remove db)