# API Reference

REST API for the Task & Team Management Platform (Express 5 + MongoDB).

A ready-to-import Postman collection lives next to this file: [`TeamMgmtPlatform.postman_collection.json`](TeamMgmtPlatform.postman_collection.json).

## Contents

- [Conventions](#conventions)
  - [Base URL](#base-url)
  - [Authentication](#authentication)
  - [Response envelope](#response-envelope)
  - [Status codes](#status-codes)
  - [Common errors](#common-errors)
  - [Data models](#data-models)
- [Endpoints](#endpoints)
  - [GET /api/health](#get-apihealth)
  - [POST /api/auth/register](#post-apiauthregister)
  - [POST /api/auth/login](#post-apiauthlogin)
  - [GET /api/auth/me](#get-apiauthme)
  - [GET /api/users](#get-apiusers)
  - [GET /api/tasks](#get-apitasks)
  - [GET /api/tasks/stats](#get-apitasksstats)
  - [GET /api/tasks/:id](#get-apitasksid)
  - [POST /api/tasks](#post-apitasks)
  - [PUT /api/tasks/:id](#put-apitasksid)
  - [DELETE /api/tasks/:id](#delete-apitasksid)

---

## Conventions

### Base URL

| Environment | Base URL |
|---|---|
| Local development | `http://localhost:5000/api` |
| Docker Compose | `http://localhost:5000/api` |
| Production (Render) | `https://<render-app>.onrender.com/api` |

All paths below are shown in full (for example `/api/tasks`). Request and response bodies are JSON, so send `Content-Type: application/json` with every request that has a body.

### Authentication

Every endpoint except `GET /api/health`, `POST /api/auth/register` and `POST /api/auth/login` requires a JWT in the `Authorization` header:

```
Authorization: Bearer <token>
```

- You get a token from `register` or `login` (`data.token`).
- **Token lifetime:** 2 hours by default. A login with `"rememberMe": true` gets a token that lasts **30 days**. Registration always issues a 2-hour token.
- The token payload is `{ id, role }`, signed with HS256 using `JWT_SECRET`.
- There is no refresh or logout endpoint. To log out, the client throws the token away.

Auth failures always return `401`:

| Condition | `message` |
|---|---|
| Header missing or not `Bearer ...` | `Not authorized, no token provided` |
| Token malformed or bad signature | `Invalid token` |
| Token expired | `Session expired, please log in again` |
| User in token has been deleted | `User belonging to this token no longer exists` |

### Response envelope

**Success**

```json
{
  "success": true,
  "data": { }
}
```

`GET /api/tasks` also returns a top-level `pagination` object next to `data` (see [below](#get-apitasks)).

**Error**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Please provide a valid email" }
  ]
}
```

`errors` appears only on request-validation failures (`message: "Validation failed"`). It lists one entry per failed rule, so a single field can appear more than once. Rules that have no custom message report `"Invalid value"`.

### Status codes

| Code | Meaning |
|---|---|
| `200 OK` | Request succeeded |
| `201 Created` | Resource created (register, create task) |
| `400 Bad Request` | Validation failed, malformed id, duplicate email, or a request body that is not valid JSON |
| `401 Unauthorized` | Missing, invalid or expired token, or wrong login credentials |
| `403 Forbidden` | Authenticated, but not allowed to modify or delete this task |
| `404 Not Found` | Task not found, or unknown route (`Route not found: <METHOD> <url>`) |
| `500 Internal Server Error` | Unexpected server error (`Something went wrong on the server`) |

### Common errors

These apply across endpoints and are not repeated under each one:

- `401`: any of the auth failures above, on protected endpoints.
- `400 Invalid <path>: <value>`: a value could not be cast to the right type (a Mongoose `CastError`).
- `400`: Mongoose schema validation messages joined with `, ` (a fallback; the request validators normally catch these first).
- `404 Route not found: <METHOD> <url>`: unknown path or method.

### Data models

**User** (public representation)

| Field | Type | Notes |
|---|---|---|
| `id` / `_id` | string (ObjectId) | Auth endpoints return `id`; `/api/users` and populated task fields use `_id` |
| `name` | string | 2–50 characters |
| `email` | string | Unique, stored lowercase |
| `role` | `"user"` \| `"admin"` | Default `"user"`. Admin can only be set in the database or seed script |
| `createdAt` | ISO date string | Auth endpoints only |

The password is never returned.

**Task**

| Field | Type | Notes |
|---|---|---|
| `_id` | string (ObjectId) | |
| `title` | string | 3–120 characters, trimmed |
| `description` | string | Up to 2000 characters, default `""` |
| `priority` | `"Low"` \| `"Medium"` \| `"High"` | Default `"Medium"` |
| `status` | `"Pending"` \| `"In Progress"` \| `"Completed"` | Default `"Pending"` |
| `dueDate` | ISO date string | Required |
| `assignedTo` | `{ _id, name, email }` | Populated user |
| `createdBy` | `{ _id, name, email }` | Populated user; set from the token |
| `createdAt`, `updatedAt` | ISO date string | Automatic timestamps |
| `__v` | number | Mongoose version key (left out when sorting by priority) |

---

## Endpoints

### GET /api/health

Liveness check, used by Render's health check.

- **Auth:** none

**Example request**

```bash
curl http://localhost:5000/api/health
```

**200 OK**

```json
{
  "success": true,
  "message": "API is healthy"
}
```

---

### POST /api/auth/register

Create an account. Returns a token (valid for 2 hours) and the new user.

- **Auth:** none

**Body**

| Field | Type | Required | Rules |
|---|---|---|---|
| `name` | string | yes | Trimmed; not empty; 2–50 characters |
| `email` | string | yes | Trimmed; valid email; normalized (lowercased); must not already exist |
| `password` | string | yes | At least 8 characters, with at least one lowercase letter, one uppercase letter, one digit and one special (non-alphanumeric) character |

Any `role` field is ignored. New accounts are always `user`.

**Example request**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{ "name": "Jane Doe", "email": "jane@example.com", "password": "Secret@123" }'
```

**201 Created**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "66f1c2a4e3b1a2d4c5f60a11",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "createdAt": "2026-09-29T10:15:00.000Z"
    }
  }
}
```

**Errors**

| Status | `message` | When |
|---|---|---|
| 400 | `Validation failed` | A body rule failed. `errors[].message` is one of: `Name is required`, `Invalid value` (name length), `Email is required`, `Please provide a valid email`, `Password must be at least 8 characters`, `Password must contain a lowercase letter`, `Password must contain an uppercase letter`, `Password must contain a number`, `Password must contain a special character` |
| 400 | `An account with this email already exists` | Email already registered |

Example validation error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "password", "message": "Password must contain an uppercase letter" },
    { "field": "password", "message": "Password must contain a special character" }
  ]
}
```

---

### POST /api/auth/login

Exchange credentials for a JWT.

- **Auth:** none

**Body**

| Field | Type | Required | Rules |
|---|---|---|---|
| `email` | string | yes | Trimmed; valid email; normalized (lowercased) |
| `password` | string | yes | Not empty (strength rules are not checked on login) |
| `rememberMe` | boolean | no | Must be boolean-like (`true`/`false`, `"true"`/`"false"`, `1`/`0`). `true` gives a 30-day token; otherwise the token lasts 2 hours |

**Example request**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "testuser@example.com", "password": "Test@1234", "rememberMe": true }'
```

**200 OK**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "66f1c2a4e3b1a2d4c5f60a01",
      "name": "Test User",
      "email": "testuser@example.com",
      "role": "user",
      "createdAt": "2026-09-20T08:00:00.000Z"
    }
  }
}
```

**Errors**

| Status | `message` | When |
|---|---|---|
| 400 | `Validation failed` | `Email is required`, `Please provide a valid email`, `Password is required`, or `Invalid value` (`rememberMe` is not a boolean) |
| 401 | `Invalid email or password` | Unknown email or wrong password (the message is the same for both on purpose) |

---

### GET /api/auth/me

Return the user who owns the token.

- **Auth:** required

**Example request**

```bash
curl http://localhost:5000/api/auth/me -H "Authorization: Bearer $TOKEN"
```

**200 OK**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "66f1c2a4e3b1a2d4c5f60a01",
      "name": "Test User",
      "email": "testuser@example.com",
      "role": "user",
      "createdAt": "2026-09-20T08:00:00.000Z"
    }
  }
}
```

**Errors:** `401` (see [Authentication](#authentication)).

---

### GET /api/users

List all users, sorted by name ascending. Used to fill the task assignee dropdown.

- **Auth:** required

**Example request**

```bash
curl http://localhost:5000/api/users -H "Authorization: Bearer $TOKEN"
```

**200 OK**

```json
{
  "success": true,
  "data": [
    { "_id": "66f1c2a4e3b1a2d4c5f60a02", "name": "Admin User", "email": "admin@example.com", "role": "admin" },
    { "_id": "66f1c2a4e3b1a2d4c5f60a01", "name": "Test User", "email": "testuser@example.com", "role": "user" }
  ]
}
```

**Errors:** `401`.

---

### GET /api/tasks

List tasks, with optional search, filtering, sorting and pagination. Every authenticated user can see every task.

- **Auth:** required

**Query parameters**

Empty values (for example `?status=`) count as not sent.

| Param | Type | Default | Rules / behaviour |
|---|---|---|---|
| `search` | string | none | Case-insensitive substring match on `title`. Regex special characters are escaped, so `a.b` matches the literal `a.b` |
| `status` | string | none | One of `Pending`, `In Progress`, `Completed` (exact, case-sensitive) |
| `priority` | string | none | One of `Low`, `Medium`, `High` (exact, case-sensitive) |
| `sortBy` | string | `createdAt` | One of `dueDate`, `createdAt`, `priority`, `title`. `priority` sorts by weight (Low=1, Medium=2, High=3), not alphabetically |
| `order` | string | `desc` | `asc` or `desc` |
| `page` | integer | `1` | ≥ 1 |
| `limit` | integer | `10` | 1–100 |

**Pagination contract**

- **Neither `page` nor `limit` sent:** returns **all** matching tasks. The response still has `pagination`, with `page: 1`, `limit` equal to `total`, and `totalPages: 1`.
- **Either one sent:** paginated. A missing `page` defaults to `1` and a missing `limit` defaults to `10`.
- `pagination` always sits at the top level next to `data`: `{ page, limit, total, totalPages }`. Here `total` counts **all** tasks that match the filters (not just this page) and `totalPages = ceil(total / limit)`.
- A `page` past the last page returns `data: []` with the correct `total` and `totalPages`.
- Ties are broken by `_id` in the same direction, so pages stay stable.

**Example request (paginated)**

```bash
curl "http://localhost:5000/api/tasks?page=1&limit=2&status=Pending&sortBy=dueDate&order=asc" \
  -H "Authorization: Bearer $TOKEN"
```

**200 OK**

```json
{
  "success": true,
  "data": [
    {
      "_id": "66f1c2a4e3b1a2d4c5f60b05",
      "title": "Implement dashboard UI",
      "description": "Sidebar, navbar, and summary cards.",
      "priority": "Medium",
      "status": "Pending",
      "dueDate": "2026-10-03T10:00:00.000Z",
      "assignedTo": { "_id": "66f1c2a4e3b1a2d4c5f60a01", "name": "Test User", "email": "testuser@example.com" },
      "createdBy": { "_id": "66f1c2a4e3b1a2d4c5f60a01", "name": "Test User", "email": "testuser@example.com" },
      "createdAt": "2026-09-29T10:00:00.000Z",
      "updatedAt": "2026-09-29T10:00:00.000Z",
      "__v": 0
    },
    {
      "_id": "66f1c2a4e3b1a2d4c5f60b06",
      "title": "Add search and filters",
      "description": "Search by title, filter by status/priority, sort by date.",
      "priority": "Low",
      "status": "Pending",
      "dueDate": "2026-10-05T10:00:00.000Z",
      "assignedTo": { "_id": "66f1c2a4e3b1a2d4c5f60a01", "name": "Test User", "email": "testuser@example.com" },
      "createdBy": { "_id": "66f1c2a4e3b1a2d4c5f60a02", "name": "Admin User", "email": "admin@example.com" },
      "createdAt": "2026-09-29T10:00:00.000Z",
      "updatedAt": "2026-09-29T10:00:00.000Z",
      "__v": 0
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 2,
    "total": 4,
    "totalPages": 2
  }
}
```

**Example request (unpaginated)**

```bash
curl "http://localhost:5000/api/tasks?search=api" -H "Authorization: Bearer $TOKEN"
```

```json
{
  "success": true,
  "data": [ { "_id": "...", "title": "Build task CRUD API", "...": "..." }, { "_id": "...", "title": "Build authentication API", "...": "..." } ],
  "pagination": { "page": 1, "limit": 2, "total": 2, "totalPages": 1 }
}
```

**Errors**

| Status | `message` | When |
|---|---|---|
| 400 | `Validation failed` | `errors[].field` is `status` or `priority` (`Invalid value`), `sortBy` (`sortBy must be one of: dueDate, createdAt, priority, title`), `order` (`Invalid value`), `page` (`page must be a positive integer`), or `limit` (`limit must be between 1 and 100`) |
| 401 | | See [Authentication](#authentication) |

---

### GET /api/tasks/stats

Counts for the dashboard cards and charts. The counts cover **all** tasks in the system; they are not limited to the current user.

- **Auth:** required
- **Query parameters:** none

**Response fields** (`data`)

| Field | Type | Description |
|---|---|---|
| `total` | integer | All tasks |
| `pending` | integer | `status = Pending` |
| `inProgress` | integer | `status = In Progress` |
| `completed` | integer | `status = Completed` |
| `overdue` | integer | Tasks whose `dueDate` has passed and whose `status` is not `Completed` |
| `byPriority` | object | `{ Low, Medium, High }`: count per priority (`0` when there are none) |

**Example request**

```bash
curl http://localhost:5000/api/tasks/stats -H "Authorization: Bearer $TOKEN"
```

**200 OK**

```json
{
  "success": true,
  "data": {
    "total": 8,
    "pending": 4,
    "inProgress": 2,
    "completed": 2,
    "overdue": 0,
    "byPriority": { "Low": 2, "Medium": 3, "High": 3 }
  }
}
```

**Errors:** `401`.

---

### GET /api/tasks/:id

Fetch one task, with `assignedTo` and `createdBy` populated.

- **Auth:** required

**Path parameters**

| Param | Type | Rules |
|---|---|---|
| `id` | string | A valid MongoDB ObjectId (24 hex characters) |

**Example request**

```bash
curl http://localhost:5000/api/tasks/66f1c2a4e3b1a2d4c5f60b03 -H "Authorization: Bearer $TOKEN"
```

**200 OK**

```json
{
  "success": true,
  "data": {
    "_id": "66f1c2a4e3b1a2d4c5f60b03",
    "title": "Build authentication API",
    "description": "Register, login, JWT middleware.",
    "priority": "High",
    "status": "In Progress",
    "dueDate": "2026-09-30T10:00:00.000Z",
    "assignedTo": { "_id": "66f1c2a4e3b1a2d4c5f60a01", "name": "Test User", "email": "testuser@example.com" },
    "createdBy": { "_id": "66f1c2a4e3b1a2d4c5f60a02", "name": "Admin User", "email": "admin@example.com" },
    "createdAt": "2026-09-29T10:00:00.000Z",
    "updatedAt": "2026-09-29T10:00:00.000Z",
    "__v": 0
  }
}
```

**Errors**

| Status | `message` | When |
|---|---|---|
| 400 | `Validation failed` (`errors: [{ "field": "id", "message": "Invalid task id" }]`) | `id` is not an ObjectId |
| 401 | | See [Authentication](#authentication) |
| 404 | `Task not found` | No task with this id |

---

### POST /api/tasks

Create a task. `createdBy` is set to the authenticated user.

- **Auth:** required

**Body**

| Field | Type | Required | Rules |
|---|---|---|---|
| `title` | string | yes | Trimmed; not empty; 3–120 characters |
| `description` | string | no | Trimmed; up to 2000 characters. Empty or falsy values are accepted and stored as `""` |
| `priority` | string | no | `Low`, `Medium` or `High`. Default `Medium` |
| `status` | string | no | `Pending`, `In Progress` or `Completed`. Default `Pending` |
| `dueDate` | string | yes | ISO 8601 date, e.g. `2026-10-15` or `2026-10-15T00:00:00.000Z`. Past dates are allowed |
| `assignedTo` | string | yes | ObjectId of the assignee (get one from `GET /api/users`) |

The server does not check that `assignedTo` belongs to an existing user. Always pick an id from `GET /api/users`.

**Example request**

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Write release notes",
    "description": "Summarise the changes shipped in v1.1.",
    "priority": "High",
    "dueDate": "2026-10-15T00:00:00.000Z",
    "assignedTo": "66f1c2a4e3b1a2d4c5f60a01"
  }'
```

**201 Created**

```json
{
  "success": true,
  "data": {
    "_id": "66f1c2a4e3b1a2d4c5f60c01",
    "title": "Write release notes",
    "description": "Summarise the changes shipped in v1.1.",
    "priority": "High",
    "status": "Pending",
    "dueDate": "2026-10-15T00:00:00.000Z",
    "assignedTo": { "_id": "66f1c2a4e3b1a2d4c5f60a01", "name": "Test User", "email": "testuser@example.com" },
    "createdBy": { "_id": "66f1c2a4e3b1a2d4c5f60a02", "name": "Admin User", "email": "admin@example.com" },
    "createdAt": "2026-09-29T11:00:00.000Z",
    "updatedAt": "2026-09-29T11:00:00.000Z",
    "__v": 0
  }
}
```

**Errors**

| Status | `message` | When |
|---|---|---|
| 400 | `Validation failed` | `Title is required`, `Invalid value` (title length or description too long), `Priority must be Low, Medium, or High`, `Invalid status`, `Due date is required`, `Due date must be a valid date`, `Assigned user is required`, `Invalid assigned user id` |
| 401 | | See [Authentication](#authentication) |

---

### PUT /api/tasks/:id

Partially update a task. Only the fields you send change.

- **Auth:** required
- **Permission:** the task's **creator**, its **assignee**, or an **admin**.

**Path parameters:** `id`, a valid ObjectId.

**Body** (every field optional)

| Field | Type | Rules |
|---|---|---|
| `title` | string | Trimmed; 3–120 characters |
| `description` | string | Trimmed; up to 2000 characters (empty values allowed) |
| `priority` | string | `Low`, `Medium` or `High` |
| `status` | string | `Pending`, `In Progress` or `Completed` |
| `dueDate` | string | ISO 8601 date |
| `assignedTo` | string | ObjectId of the new assignee |

`createdBy` cannot be changed. Unknown fields are ignored.

**Example request**

```bash
curl -X PUT http://localhost:5000/api/tasks/66f1c2a4e3b1a2d4c5f60c01 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "status": "In Progress", "priority": "Medium" }'
```

**200 OK**

```json
{
  "success": true,
  "data": {
    "_id": "66f1c2a4e3b1a2d4c5f60c01",
    "title": "Write release notes",
    "description": "Summarise the changes shipped in v1.1.",
    "priority": "Medium",
    "status": "In Progress",
    "dueDate": "2026-10-15T00:00:00.000Z",
    "assignedTo": { "_id": "66f1c2a4e3b1a2d4c5f60a01", "name": "Test User", "email": "testuser@example.com" },
    "createdBy": { "_id": "66f1c2a4e3b1a2d4c5f60a02", "name": "Admin User", "email": "admin@example.com" },
    "createdAt": "2026-09-29T11:00:00.000Z",
    "updatedAt": "2026-09-29T11:30:00.000Z",
    "__v": 0
  }
}
```

**Errors**

| Status | `message` | When |
|---|---|---|
| 400 | `Validation failed` | `Invalid task id` (field `id`), or `Invalid value` for any body field that breaks its rule |
| 401 | | See [Authentication](#authentication) |
| 403 | `Not authorized to modify this task` | Caller is not the creator, the assignee, or an admin |
| 404 | `Task not found` | No task with this id |

---

### DELETE /api/tasks/:id

Delete a task permanently.

- **Auth:** required
- **Permission:** the task's **creator** or an **admin**. The assignee **cannot** delete it.

**Path parameters:** `id`, a valid ObjectId.

**Example request**

```bash
curl -X DELETE http://localhost:5000/api/tasks/66f1c2a4e3b1a2d4c5f60c01 -H "Authorization: Bearer $TOKEN"
```

**200 OK**

```json
{
  "success": true,
  "data": { "id": "66f1c2a4e3b1a2d4c5f60c01" }
}
```

**Errors**

| Status | `message` | When |
|---|---|---|
| 400 | `Validation failed` (`Invalid task id`) | `id` is not an ObjectId |
| 401 | | See [Authentication](#authentication) |
| 403 | `Not authorized to delete this task` | Caller is neither the creator nor an admin |
| 404 | `Task not found` | No task with this id |

---

## Permissions summary

| Action | Any authenticated user | Assignee | Creator | Admin |
|---|:-:|:-:|:-:|:-:|
| List / view tasks, stats, users | yes | yes | yes | yes |
| Create task | yes | | | |
| Update task | | yes | yes | yes |
| Delete task | | no | yes | yes |
