# HR-Management-System

HR PTAA dashboard with a React/Vite frontend and Express/Prisma backend. This project includes role-based permission management that persists in PostgreSQL.

## 📁 Repository layout
- `src/` — frontend application
- `backend/` — backend API and Prisma models
- `backend/scripts/seed.js` — seed users and permissions
- `backend/prisma/schema.prisma` — Prisma database schema

## 🚀 Local development

### Backend
1. Copy `backend/.env.example` to `backend/.env`
2. Fill in your PostgreSQL connection string and JWT secret:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=your-strong-jwt-secret
```

3. Install dependencies and run:

```bash
cd backend
npm install
npx prisma generate
npm run seed
npm start
```

Backend will run at `http://localhost:4000` by default.

### Frontend
1. Copy `.env.example` to `.env`
2. Set the backend URL:

```env
VITE_API_URL=http://localhost:4000
```

3. Install dependencies and run:

```bash
cd ..
npm install
npm run dev
```

Frontend will run at `http://localhost:5173` by default.

## 🌐 Deployment guide

### Railway (Backend)
1. Create a Railway project and add a PostgreSQL database plugin.
2. Set Railway environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
3. Make sure the service root is `backend` if Railway detects the repository as monorepo.
4. Use `npm start` as the start command.

Railway will provide a public backend URL like `https://<project>.up.railway.app`.

### Vercel (Frontend)
1. Import the repository into Vercel.
2. Set Framework Preset to `Vite`.
3. Configure environment variable:
   - `VITE_API_URL=https://<your-railway-backend>.up.railway.app`
4. Set build command to `npm run build`.
5. Set output directory to `dist`.

## 🛠️ Notes
- `VITE_API_URL` is a build-time variable used by the frontend to call the backend.
- Permissions changes are stored in PostgreSQL via the backend API.
- Do not commit `.env` or `backend/.env`.

## ✅ Verification
- Login as Admin
- Open `Pengaturan`
- Toggle permissions or update user role/status
- Refresh and confirm changes persist

