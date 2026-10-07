# Production launch checklist

## Database
- Create Neon/PostgreSQL database.
- Set DATABASE_URL.
- Run Prisma migrations and seed real consultants/products/offers.
- Replace in-memory arrays with Prisma repositories.

## Payments
- Add Razorpay production keys only as server environment variables.
- Create Razorpay orders server-side.
- Verify signature server-side before confirming bookings/orders.
- Add Razorpay webhook endpoint and idempotency handling.

## Operations
- Add admin authentication + role based authorization.
- Add WhatsApp Business API for booking/order confirmations and COD verification.
- Add transactional email/SMS.
- Add shipping provider integration and tracking.
- Store consultant availability/blackout dates in DB.

## Growth
- GA4 + Search Console + Meta Pixel with consent.
- Service-specific SEO landing pages, schema.org FAQ/Service/Review markup.
- Abandoned checkout recovery.
- Prepaid incentive and COD risk scoring.

## Security
- HTTPS, secure cookies, CSRF protection where applicable, validation, rate limiting.
- Never commit .env, API keys or payment secrets.
- Audit logs for admin actions.
