# Google Sheets order sync

The backend can append new orders to the designated Google Sheet through a private server-to-server webhook. The integration is disabled until both environment variables are configured.

## Setup

1. Open the target spreadsheet: https://docs.google.com/spreadsheets/d/1kwX6-tkuoBe6kgpwm3XQl2Hl1te7Flq-wjw5vS2Oul0/edit
2. Select **Extensions → Apps Script** and paste the contents of [google-sheets-order-webhook.gs](./google-sheets-order-webhook.gs) into `Code.gs`.
3. In Apps Script **Project Settings → Script properties**, add `ORDER_WEBHOOK_SECRET` with a long random secret.
4. Deploy as a **Web app**, executing as your account. The web app must accept requests from the backend; its endpoint checks the shared secret before writing.
5. Add these server-side environment variables to the deployed backend (never to frontend variables):
   - `GOOGLE_SHEETS_WEBHOOK_URL`: the deployed Apps Script web app URL ending in `/exec`
   - `GOOGLE_SHEETS_WEBHOOK_SECRET`: the exact same secret set in Script Properties
6. Place a test order and verify that an `Orders` tab appears with the order details.

The script creates an `Orders` tab with headers and prevents duplicate rows for retries. The address and line items are stored as JSON; totals, discount, shipping, coupon, payment status, and order status have their own columns.

## Reliability note

The order endpoint currently queues this export as a best-effort asynchronous request. If Google is unavailable, the order response is not blocked and the server logs a sync error. For production-grade guaranteed delivery, use a persistent database plus a retryable outbox/worker; spreadsheet sync alone must not be the source of truth for orders.
