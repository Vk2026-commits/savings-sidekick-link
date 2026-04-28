// k6 load test for Faithnancial backend
// ----------------------------------------
// Run from your own machine (NOT Lovable):
//   1. Install k6:  brew install k6   (or  https://k6.io/docs/getting-started/installation )
//   2. Set env vars:
//        export SUPABASE_URL="https://<your-project-ref>.supabase.co"
//        export SUPABASE_ANON_KEY="<publishable-anon-key>"
//        export TEST_EMAIL="loadtest@example.com"   # pre-create this user
//        export TEST_PASSWORD="<password>"
//   3. Run a stage:
//        k6 run -e STAGE=100 loadtest/k6-script.js
//        k6 run -e STAGE=500 loadtest/k6-script.js
//        k6 run -e STAGE=1000 loadtest/k6-script.js
//
// What it measures:
//   - login latency (auth/v1/token)
//   - dashboard read latency (rest/v1/bills, rest/v1/transactions)
//   - p95 / p99 response times
//   - error rate
//
// Stop conditions: thresholds in `options` will fail the run if SLOs are breached.

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

const SUPABASE_URL = __ENV.SUPABASE_URL;
const ANON_KEY = __ENV.SUPABASE_ANON_KEY;
const EMAIL = __ENV.TEST_EMAIL;
const PASSWORD = __ENV.TEST_PASSWORD;
const STAGE = parseInt(__ENV.STAGE || "100", 10);

if (!SUPABASE_URL || !ANON_KEY || !EMAIL || !PASSWORD) {
  throw new Error("Set SUPABASE_URL, SUPABASE_ANON_KEY, TEST_EMAIL, TEST_PASSWORD env vars.");
}

const loginTrend = new Trend("login_duration", true);
const dashTrend = new Trend("dashboard_duration", true);
const errorRate = new Rate("errors");

export const options = {
  stages: [
    { duration: "30s", target: STAGE },   // ramp up
    { duration: "2m", target: STAGE },    // sustain
    { duration: "30s", target: 0 },       // ramp down
  ],
  thresholds: {
    http_req_failed: ["rate<0.02"],          // <2% failures
    http_req_duration: ["p(95)<1500"],       // p95 < 1.5s
    login_duration: ["p(95)<2000"],
    dashboard_duration: ["p(95)<1500"],
    errors: ["rate<0.05"],
  },
};

function login() {
  const res = http.post(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    JSON.stringify({ email: EMAIL, password: PASSWORD }),
    { headers: { apikey: ANON_KEY, "Content-Type": "application/json" }, tags: { name: "login" } },
  );
  loginTrend.add(res.timings.duration);
  const ok = check(res, { "login 200": (r) => r.status === 200 });
  if (!ok) errorRate.add(1);
  return res.status === 200 ? res.json("access_token") : null;
}

function dashboardReads(token) {
  const headers = { apikey: ANON_KEY, Authorization: `Bearer ${token}` };
  const responses = http.batch([
    ["GET", `${SUPABASE_URL}/rest/v1/bills?select=*&limit=200`, null, { headers, tags: { name: "bills" } }],
    ["GET", `${SUPABASE_URL}/rest/v1/transactions?select=*&limit=200`, null, { headers, tags: { name: "transactions" } }],
    ["GET", `${SUPABASE_URL}/rest/v1/income_sources?select=*`, null, { headers, tags: { name: "income" } }],
    ["GET", `${SUPABASE_URL}/rest/v1/category_budgets?select=*`, null, { headers, tags: { name: "budgets" } }],
  ]);
  for (const r of responses) {
    dashTrend.add(r.timings.duration);
    if (r.status >= 400) errorRate.add(1);
  }
}

export default function () {
  const token = login();
  if (!token) {
    sleep(1);
    return;
  }
  dashboardReads(token);
  sleep(Math.random() * 2 + 1); // 1-3s think time
}
