# Nice Geopram — Minimal Service Ordering App

This is a minimal Express + Mongo app that demonstrates:
- Admin-created services
- User ordering flow
- Payment simulation (emulates MPESA callback)
- Admin dashboard showing transactions

Quick start

1. Copy `.env.example` to `.env` and fill `MONGO_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
2. Install:

```
npm install
```

3. Seed sample services (optional):

```
node seed.js
```

4. Run:

```
npm run dev
```

Open `http://localhost:3000` for user view and `http://localhost:3000/admin.html` for admin dashboard.

Notes
- Payment flow is simulated. Replace `/api/payments/simulate` with real MPESA integration using the `.env` MPESA keys and `MPESA_CALLBACK_URL`.
- Admin endpoints use Basic Auth with `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

To produce a zip of the project:

```
zip -r nice-geopram.zip .
```
