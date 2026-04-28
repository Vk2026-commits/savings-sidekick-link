# Load Testing — Faithnancial

This directory contains a [k6](https://k6.io) script to verify the backend handles concurrent load.

**Why isn't this run automatically?** Lovable's build sandbox can't generate sustained load against a production endpoint. You run k6 from your own machine (or a CI runner you control) so the test traffic is real.

## Quick start

```bash
brew install k6                               # macOS — see k6.io for other OSes

export SUPABASE_URL="https://<your-ref>.supabase.co"
export SUPABASE_ANON_KEY="<publishable anon key>"
export TEST_EMAIL="loadtest@yourdomain.com"   # create this user once via the app
export TEST_PASSWORD="<that user's password>"

k6 run -e STAGE=100  loadtest/k6-script.js   # 100 VUs
k6 run -e STAGE=500  loadtest/k6-script.js   # 500 VUs
k6 run -e STAGE=1000 loadtest/k6-script.js   # 1000 VUs
```

## What it measures

- Login latency (`/auth/v1/token`)
- Dashboard read latency (bills, transactions, income, budgets)
- p95 / p99 response times
- Error rate

The script's `thresholds` will fail the run if p95 exceeds 1.5s or error rate exceeds 5%.

## Notes & limitations

- **Use a dedicated test account.** The script repeatedly logs in as one user; do not use a real user.
- **Supabase free tier rate-limits aggressive auth traffic.** Spread login over more VUs or pre-issue tokens for true 1000 VU runs.
- **This validates *throughput*, not security.** Run the Vitest access-control suite (`bunx vitest run src/test/access-control.test.ts`) for that.
