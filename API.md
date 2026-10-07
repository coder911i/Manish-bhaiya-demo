# Demo API

## Customer
- GET /api/consultants
- GET /api/consultants/:id
- GET /api/products
- GET /api/products/:id
- GET /api/slots
- POST /api/bookings
- POST /api/payment/create
- POST /api/orders

## Admin
- GET /api/admin/stats

This is a demo backend with in-memory data. Production should use PostgreSQL/Neon, authenticated admin APIs, server-side payment verification, webhooks, rate limiting, audit logs and persistent storage.

## Run
npm install
npm start
Open http://localhost:3000
