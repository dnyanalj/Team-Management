# Deployment Guide

Production setup:

| Layer | Host | Config in repo |
|---|---|---|
| Database | MongoDB Atlas | none |
| API (`server/`) | Render web service | [`render.yaml`](../render.yaml) |
| Client (`client/`) | Vercel | [`client/vercel.json`](../client/vercel.json) |

Deploy in this order: **Atlas, then Render, then Vercel, then go back to Render to set `CLIENT_ORIGIN`.** The client needs the API URL at build time, and the API needs the client URL for CORS.

For a local production-like stack with no cloud accounts, see [Docker](#docker-local-full-stack).

---

## 1. MongoDB Atlas

1. **Create a cluster.** Sign in at <https://cloud.mongodb.com>, create a project, then choose **Create a deployment** and pick the free **M0** tier. Choose a region close to your Render region.
2. **Create a database user.** Under **Security → Database Access → Add New Database User**, pick password authentication, choose a username, and generate a strong password. Give it the **Read and write to any database** role. Save the password now; you need it for the connection string.
3. **Allow network access.** Under **Security → Network Access → Add IP Address**, choose **Allow access from anywhere** (`0.0.0.0/0`). Render's free tier has no fixed outbound IPs, so you can't allowlist specific addresses. The database user's credentials protect access instead.
4. **Get the connection string.** Go to **Database → Connect → Drivers**, pick Node.js, and copy the URI. Replace `<password>` with the user's password (URL-encode any special characters, for example `@` becomes `%40`), and add the database name `taskmgmt` before the `?`:

   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/taskmgmt?retryWrites=true&w=majority
   ```

   This is your `MONGODB_URI`.

---

## 2. Render (API)

### Option A: Blueprint (recommended)

The repo includes a [`render.yaml`](../render.yaml) that defines a Node web service with `rootDir: server`, `npm ci --omit=dev` as the build command, `npm start` as the start command, and a health check at `/api/health`.

1. Push the repo to GitHub or GitLab.
2. In the Render dashboard choose **New → Blueprint** and select the repo. Render reads `render.yaml`.
3. Render asks for the variables marked `sync: false`:
   - `MONGODB_URI`: the Atlas connection string from step 1.
   - `CLIENT_ORIGIN`: you don't have the Vercel URL yet, so enter a placeholder such as `http://localhost:5173` and update it in [step 4](#4-point-cors-at-the-vercel-url).

   `JWT_SECRET` is generated automatically (`generateValue: true`) and `NODE_ENV` is set to `production`.
4. Click **Apply**. When the deploy finishes, open `https://<render-app>.onrender.com/api/health`. It should return:

   ```json
   { "success": true, "message": "API is healthy" }
   ```

### Option B: Manual web service

1. **New → Web Service**, then connect the repo.
2. Settings:

   | Setting | Value |
   |---|---|
   | Root Directory | `server` |
   | Runtime | Node |
   | Build Command | `npm ci --omit=dev` |
   | Start Command | `npm start` |
   | Health Check Path | `/api/health` (under **Advanced**) |

3. Environment variables:

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | Atlas connection string |
   | `JWT_SECRET` | A long random string, e.g. the output of `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
   | `CLIENT_ORIGIN` | Placeholder for now; set it to the Vercel URL in step 4 |

   Don't set `PORT`. Render provides it and the server reads `process.env.PORT`.

### Seed the database

Once the service is live, open the service's **Shell** tab in Render and run:

```bash
npm run seed
```

This creates the two test accounts (`testuser@example.com` / `Test@1234` and `admin@example.com` / `Admin@1234`) and 8 sample tasks. It is idempotent: existing users are kept, and it skips tasks if the collection already has any.

> The Shell tab is only available on paid instance types. On the free tier, you can seed from your own machine instead: run `npm run seed` in `server/` with `MONGODB_URI` in `server/.env` pointing at the Atlas cluster.

> Free Render instances sleep after about 15 minutes of inactivity, so the first request after that can take 30–60 seconds.

---

## 3. Vercel (client)

1. In Vercel choose **Add New → Project** and import the repo.
2. Configure:

   | Setting | Value |
   |---|---|
   | Root Directory | `client` |
   | Framework Preset | Vite |
   | Build Command | `npm run build` (default) |
   | Output Directory | `dist` (default) |

3. Add an environment variable (Production, and Preview if you use it):

   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://<render-app>.onrender.com/api` |

   Vite inlines this value **at build time**. If you change it later, redeploy so it takes effect.
4. Deploy. [`client/vercel.json`](../client/vercel.json) rewrites every path to `/index.html`, so refreshing or deep-linking a client route (for example `/tasks`) works instead of returning 404.

---

## 4. Point CORS at the Vercel URL

1. Copy the production URL Vercel gives you, e.g. `https://teammgmt.vercel.app`. Use the origin only: no trailing slash, no path.
2. In Render, go to the service's **Environment** tab and set:

   ```
   CLIENT_ORIGIN=https://teammgmt.vercel.app
   ```

   To allow several origins (a custom domain, local dev), separate them with commas: `https://teammgmt.vercel.app,https://app.example.com`.
3. Save. Render redeploys with the new value.
4. Open the Vercel URL and log in with a seeded account. If the browser console shows a CORS error, check that `CLIENT_ORIGIN` matches the page's origin exactly.

---

## Docker (local full stack)

The root [`docker-compose.yml`](../docker-compose.yml) runs MongoDB 7, the API and the nginx-served client together.

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Client | <http://localhost:8080> |
| API | <http://localhost:5000/api> (health check: `/api/health`) |
| MongoDB | Internal only, at `mongodb://mongo:27017/taskmgmt`, data kept in the `mongo-data` volume |

Seed the database once the containers are running:

```bash
docker compose exec server node scripts/seed.js
```

Notes:

- `JWT_SECRET` defaults to `change-me-in-production`. Override it with `JWT_SECRET=... docker compose up --build`, or put `JWT_SECRET=...` in a `.env` file at the repo root.
- The client image bakes in `VITE_API_BASE_URL=http://localhost:5000/api` at build time. The browser calls the API on the host's port 5000, not the internal `server` hostname. To change it, edit the `args` in `docker-compose.yml` and rebuild.
- `docker compose down` stops the stack. `docker compose down -v` also deletes the database volume.
