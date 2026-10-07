# Production launch checklist

## Payments — PayU
- Set `PAYU_KEY`, `PAYU_SALT`, `PAYU_ENV` and `PUBLIC_URL` as server-side environment variables.
- Hosted checkout posts directly to PayU; card/UPI credentials never touch the merchant UI.
- Server generates SHA-512 request hash.
- Server validates PayU response hash before marking a payment successful.
- Callback + webhook endpoints are available.
- Keep `PAYU_SALT` server-only; never expose it to browser code.
- Run PayU test transactions before switching `PAYU_ENV=live`.

## Database
- Create Neon/PostgreSQL database and set `DATABASE_URL`.
- Run `npx prisma migrate deploy` and `npx prisma generate`.
- Replace the remaining demo in-memory repositories with Prisma-backed persistence before final launch.
- Seed the real consultant/product/catalog data from the client's store.

## Operations
- Add authenticated admin sessions + role-based authorization before exposing CMS publicly.
- Add WhatsApp Business API for booking/order confirmations and COD verification.
- Add transactional email/SMS.
- Add shipping provider integration and tracking.
- Store consultant availability/blackout dates in DB.

## Growth
- GA4 + Search Console + Meta Pixel with consent.
- Service-specific SEO landing pages and schema.org FAQ/Service/Review markup.
- Abandoned checkout recovery.
- Prepaid incentive and COD risk scoring.

## Security
- HTTPS, secure cookies, CSRF protection where applicable, validation and rate limiting.
- Never commit `.env`, API keys or payment secrets.
- Add audit logs for admin actions.
- Reconcile PayU transactions server-side and handle duplicate callbacks idempotently.
