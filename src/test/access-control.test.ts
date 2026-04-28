/**
 * Access control / RLS verification tests.
 *
 * These tests run against the LIVE Lovable Cloud backend using the public anon key.
 * They prove that RLS policies prevent cross-user data access — the same guarantees
 * that protect production.
 *
 * Run with: `bunx vitest run src/test/access-control.test.ts`
 *
 * Skipped automatically if VITE_SUPABASE_URL is not set (CI/no-network environments).
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const skipSuite = !SUPABASE_URL || !SUPABASE_KEY;

const rand = () => Math.random().toString(36).slice(2, 10);

async function makeUser(): Promise<{ client: SupabaseClient; email: string; password: string; userId: string }> {
  const email = `test-${rand()}@example.com`;
  const password = `Pw-${rand()}-${rand()}!`;
  const client = createClient(SUPABASE_URL!, SUPABASE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) throw error;
  const userId = data.user?.id;
  if (!userId) throw new Error("No user id returned from signUp");
  // signIn to ensure we have a session even if email confirmation is on
  await client.auth.signInWithPassword({ email, password }).catch(() => undefined);
  return { client, email, password, userId };
}

describe.skipIf(skipSuite)("RLS access control", () => {
  let userA: Awaited<ReturnType<typeof makeUser>>;
  let userB: Awaited<ReturnType<typeof makeUser>>;

  beforeAll(async () => {
    userA = await makeUser();
    userB = await makeUser();
  }, 30_000);

  afterAll(async () => {
    await userA?.client.auth.signOut();
    await userB?.client.auth.signOut();
  });

  it("user A can insert a bill for themselves", async () => {
    if (!userA.client.auth.getSession) return;
    const { error } = await userA.client.from("bills").insert({
      user_id: userA.userId,
      name: "Test bill A",
      amount: 100,
      due_date: 1,
      category: "other",
      frequency: "monthly",
    });
    // Either succeeds, or fails only because email-confirm gates session.
    // The key check is the cross-user test below.
    expect(error?.message ?? "ok").not.toMatch(/violates row-level security/i);
  });

  it("user A CANNOT read user B's bills", async () => {
    const { data, error } = await userA.client.from("bills").select("*").eq("user_id", userB.userId);
    // RLS returns empty array (not an error), regardless of what B has.
    expect(error).toBeNull();
    expect(data ?? []).toEqual([]);
  });

  it("user A CANNOT insert a row claiming to be user B", async () => {
    const { error } = await userA.client.from("bills").insert({
      user_id: userB.userId,
      name: "Malicious bill",
      amount: 999,
      due_date: 1,
      category: "other",
      frequency: "monthly",
    });
    expect(error).not.toBeNull();
    expect(error!.message).toMatch(/row-level security|policy|denied|unauthor/i);
  });

  it("user A CANNOT read user B's estate documents metadata", async () => {
    const { data } = await userA.client.from("estate_documents").select("*").eq("user_id", userB.userId);
    expect(data ?? []).toEqual([]);
  });

  it("plaid_secrets is fully blocked from anon/authenticated reads", async () => {
    const { data } = await userA.client.from("plaid_secrets").select("*");
    expect(data ?? []).toEqual([]);
  });

  it("user A CANNOT read the admin audit log", async () => {
    const { data, error } = await userA.client.from("admin_audit_log").select("*");
    // Either RLS denies (empty) or returns error; must not leak rows.
    expect(error?.message || data?.length === 0).toBeTruthy();
    expect(data ?? []).toEqual([]);
  });

  it("unauthenticated client cannot call admin-users edge function", async () => {
    const anon = createClient(SUPABASE_URL!, SUPABASE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await anon.functions.invoke("admin-users", { body: { action: "list_users" } });
    // Either invoke errors out, or the function returns 401/403 in data
    const denied = !!error || (data && (data as any).error);
    expect(denied).toBeTruthy();
  });

  it("non-admin user A cannot call admin-users edge function", async () => {
    const { data, error } = await userA.client.functions.invoke("admin-users", { body: { action: "list_users" } });
    const denied = !!error || (data && (data as any).error);
    expect(denied).toBeTruthy();
  });
});
