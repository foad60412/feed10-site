# Feed 10 Families - Donation Website MVP

A professional one-page donation campaign website with:
- USD-only campaign goal
- PayPal Checkout donations
- Recent donations shown publicly
- Admin dashboard
- Campaign creation / closing
- Visit tracking
- Supabase database

## 1. Install
```bash
npm install
cp .env.example .env.local
npm run dev
```

## 2. Supabase setup
Create a Supabase project, open SQL Editor, and run `supabase-schema.sql`.
Then copy your Supabase URL, anon key, and service role key into `.env.local`.

## 3. PayPal setup
Create a PayPal Developer app and add:
```env
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_ENV=sandbox
```
The PayPal JavaScript SDK uses `createOrder` to launch Checkout, and after approval the server captures the order. Webhooks should listen to `PAYMENT.CAPTURE.COMPLETED` for reliable confirmation.

## 4. Webhook URL
After deploying, create a webhook in PayPal Developer Dashboard:
```text
https://your-domain.com/api/paypal/webhook
```
Subscribe at least to:
- PAYMENT.CAPTURE.COMPLETED
- PAYMENT.CAPTURE.DENIED
- PAYMENT.CAPTURE.PENDING

Then add the webhook ID to `.env.local` / hosting variables:
```env
PAYPAL_WEBHOOK_ID=...
```

## 5. Admin
Open:
```text
/admin
```
Use the password from:
```env
ADMIN_PASSWORD=change_this_password
```

## Important
Do not use fake donation numbers. Only show completed donations from PayPal. Keep donor privacy respected by allowing anonymous donations.
