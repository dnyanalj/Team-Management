# Task & Team Management Platform

A full-stack task and team management platform: authentication (JWT + bcrypt), a dashboard with live task metrics and charts, full task CRUD with search/filter/sort/pagination, a drag & drop Kanban board, toast notifications, and role-aware permissions (creator/assignee/admin).

## Features

- **Auth**: register/login with JWT, bcrypt-hashed passwords, "remember me" (30-day token vs 2-hour session).
- **Dashboard**: total / pending / in-progress / completed / overdue counts, bar charts by status and priority, recent tasks.
- **Tasks**: create, view, edit, delete; search by title, filter by status/priority, sort by due date/created date/priority/title, paginated 10 per page.
- **Board**: Kanban columns per status — drag a card to change its status (optimistic update, rolled back if the server refuses). Cards you're not allowed to edit can't be dragged.
- **Toasts**: success/error notifications for task changes, login/register, and session expiry.
- **Permissions**: anyone signed in can view tasks; update = creator, assignee or admin; delete = creator or admin.

## Tech Stack

**Frontend**: React 19, Vite, React Router, Axios, Redux Toolkit, Tailwind CSS v4, Recharts, dnd-kit, react-hot-toast
**Backend**: Node.js, Express 5, Mongoose
**Database**: MongoDB Atlas
**Auth**: JSON Web Tokens (JWT), bcrypt password hashing (bcryptjs)
**Testing**: Vitest, Supertest, mongodb-memory-server, React Testing Library
**Deployment target**: Vercel (frontend), Render (backend), MongoDB Atlas (database); Docker Compose for a local all-in-one stack

## Folder Structure

```
client/src/
  components/   # common, layout, auth, dashboard, tasks, board UI components
  pages/        # routed page components (lazy-loaded)
  hooks/        # useAuth, useTasks, useDebouncedSearch, useTaskStats, useLocalStorage
  services/     # axios client + API service modules
  utils/        # constants, validators, date formatting, error helpers, token storage
  store/        # Redux Toolkit store + slices (auth, tasks, users) + toast listener middleware
  context/      # UIContext (sidebar/theme — UI-only state, not server state)
  routes/       # AppRoutes (React Router + lazy/Suspense)

server/
  controllers/  # request handlers (auth, users, tasks)
  models/       # Mongoose schemas (User, Task)
  routes/       # Express routers
  middleware/   # JWT auth guard, error handler, async wrapper, validators
  config/       # MongoDB connection
  utils/        # AppError, JWT helpers, query filter/sort helpers
  scripts/      # database seed script
  tests/        # API integration + unit tests (in-memory MongoDB)

docs/
  API.md                                  # full endpoint reference
  DEPLOYMENT.md                           # Atlas + Render + Vercel + Docker guide
  TeamMgmtPlatform.postman_collection.json
```

## Local Setup

### Prerequisites
- Node.js 20+
- A MongoDB connection string (MongoDB Atlas free tier, or a local `mongod` instance)

### 1. Backend

```bash
cd server
npm install
cp .env.example .env   # then fill in MONGODB_URI and JWT_SECRET
npm run seed            # creates the two test accounts + sample tasks
npm run dev             # starts the API on http://localhost:5000
```

`server/.env` variables:

| Variable | Description |
|---|---|
| `PORT` | API port (default `5000`) |
| `MONGODB_URI` | MongoDB Atlas (or local) connection string |
| `JWT_SECRET` | Long random string used to sign JWTs |
| `CLIENT_ORIGIN` | Comma-separated allowed CORS origin(s), e.g. `http://localhost:5173` |

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env   # defaults to http://localhost:5000/api, adjust if needed
npm run dev             # starts the app on http://localhost:5173
```

### Test Accounts

Seeded via `npm run seed` in `server/`:

| Role | Email | Password |
|---|---|---|
| Standard user | `testuser@example.com` | `Test@1234` |
| Admin | `admin@example.com` | `Admin@1234` |

The admin role currently gates one thing: deleting a task requires being its creator **or** an admin. All authenticated users can view every task and update tasks they created, are assigned to, or (as admin) any task.

## Running Tests

No database setup needed — server tests spin up an in-memory MongoDB (the first run downloads a MongoDB binary, ~100 MB).

```bash
cd server && npm test   # auth, tasks, permissions, pagination, stats
cd client && npm test   # utils, Redux slice, Pagination component
```

## Docker

```bash
docker compose up --build                       # mongo + API (:5000) + client (:8080)
docker compose exec server node scripts/seed.js # create the test accounts
```

Then open http://localhost:8080. Set `JWT_SECRET` in your shell (or a root `.env`) for anything beyond local use.

## Deployment

Step-by-step instructions for MongoDB Atlas, Render (`render.yaml` blueprint) and Vercel (`client/vercel.json`) are in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## API Documentation

Full request/response documentation for every endpoint is in [docs/API.md](docs/API.md). A ready-to-import Postman collection is at [docs/TeamMgmtPlatform.postman_collection.json](docs/TeamMgmtPlatform.postman_collection.json) — run **Login** first and the token is stored for the other requests.

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Health check |
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Log in, returns JWT |
| GET | `/api/auth/me` | Required | Get the current authenticated user |
| GET | `/api/users` | Required | List users (for the task assignee dropdown) |
| GET | `/api/tasks` | Required | List tasks (search/filter/sort/`page`/`limit` via query params) |
| GET | `/api/tasks/stats` | Required | Aggregated counts for dashboard cards and charts |
| GET | `/api/tasks/:id` | Required | Get a single task |
| POST | `/api/tasks` | Required | Create a task |
| PUT | `/api/tasks/:id` | Required | Update a task (creator, assignee, or admin) |
| DELETE | `/api/tasks/:id` | Required | Delete a task (creator or admin) |
