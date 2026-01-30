# Wireeo Backend

Node.js, Express, and MongoDB API for the Wireeo project. Fully decoupled and API-based.

## Tech Stack

- **Node.js** + **Express.js**
- **MongoDB** with **Mongoose**
- **JWT** authentication (admin / user roles)
- **dotenv** for environment variables
- **CORS** enabled for frontend integration
- **express-validator** for input validation

## Project Structure

```
backend/
├── src/
│   ├── config/       # App config, DB connection
│   ├── models/       # Mongoose models
│   ├── controllers/  # Route handlers
│   ├── routes/       # API routes
│   ├── middleware/   # Auth, admin, validation, errors
│   ├── services/     # Business logic helpers
│   └── utils/        # Validators, seed, etc.
├── app.js
├── server.js
├── .env
├── .env.example
└── package.json
```

## API Routes

| Base | Description |
|------|-------------|
| `/api/auth` | Register, Login |
| `/api/users` | User count, list (admin) |
| `/api/ranges` | List, CRUD (create/edit/delete admin-only) |
| `/api/products` | List, filter (configurable/normal), CRUD (admin) |
| `/api/collections` | My collection, add configurable products, remove |
| `/api/projects` | CRUD, add products, add from collection |
| `/api/canvas` | Save edits, get by product |
| `/api/pdf` | Create config, list, get by id |
| `/api/admin/dashboard` | Dashboard stats (admin) |

## MongoDB Setup

### 1. Install MongoDB

**Windows (e.g. via installer):**

- Download: [MongoDB Community Server](https://www.mongodb.com/try/download/community)
- Run the installer and choose “Complete”. Optionally install MongoDB Compass.
- Add MongoDB `bin` to `PATH` (e.g. `C:\Program Files\MongoDB\Server\7.0\bin`).

**macOS (Homebrew):**

```bash
brew tap mongodb/brew
brew install mongodb-community
```

**Ubuntu/Debian:**

```bash
sudo apt-get install -y mongodb
# or use official MongoDB repo: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/
```

### 2. Start MongoDB

**Windows (Service):**

- MongoDB typically runs as a service. Start it from “Services” or:

```bash
net start MongoDB
```

**macOS (Homebrew):**

```bash
brew services start mongodb-community
```

**Linux (systemd):**

```bash
sudo systemctl start mongod
```

### 3. Create a database

You don’t need to create the database manually. When the app first connects using `MONGODB_URI`, MongoDB creates the `wireeo` database (and collections) as you use them.

Optional, via Mongo shell:

```bash
mongosh
> use wireeo
> db.createCollection("users")
```

## Environment Variables

Copy `.env.example` to `.env` and set:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wireeo
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `CORS_ORIGIN` | Allowed frontend origins (comma-separated) |

## Install & Run

### 1. Install dependencies

```bash
cd backend
npm install
```

If you see `ENOTCACHED` or cache-related errors, try:

```bash
npm cache clean --force
npm install --prefer-online
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. (Optional) Seed admin user

```bash
npm run seed
```

Creates `admin@wireeo.com` / `admin123` (change password after first login).

### 4. Start the server

```bash
npm start
# or, for development with watch:
npm run dev
```

Server runs at **http://localhost:5000**.

### 5. Health check

```bash
curl http://localhost:5000/health
```

## Frontend connection

Point the frontend to the backend API.

**Base URL:** `http://localhost:5000/api`

**Example (Vite):** In `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Use `fetch` or `axios` with `VITE_API_URL` as base. Send JWT in `Authorization: Bearer <token>` for protected routes.

**Auth flow:**

1. `POST /api/auth/register` – body: `{ name, email, password }`
2. `POST /api/auth/login` – body: `{ email, password }`
3. Response includes `{ token, user }`. Use `token` in `Authorization` for subsequent requests.

## Example API Calls

**Register:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@wireeo.com","password":"admin123"}'
```

**Login:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@wireeo.com","password":"admin123"}'
```

**Dashboard stats (admin):**

```bash
curl http://localhost:5000/api/admin/dashboard/stats \
  -H "Authorization: Bearer <YOUR_JWT>"
```

**List ranges:**

```bash
curl http://localhost:5000/api/ranges
```

**List configurable products:**

```bash
curl "http://localhost:5000/api/products/configurable?range=<RANGE_ID>"
```

**List normal products:**

```bash
curl "http://localhost:5000/api/products/normal?range=<RANGE_ID>"
```

## License

ISC
