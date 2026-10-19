#!/usr/bin/env node
/**
 * Sabi Vault: Super Admin bootstrap
 *
 * Promotes an existing Supabase Auth account to the super_admin role so it
 * can open the control plane at /dashboard. Uses only the Supabase keys
 * already present in .env.local (service role, server-side, never shipped
 * to the browser).
 *
 * Usage:
 *   node scripts/promote_super_admin.mjs you@example.com
 *   node scripts/promote_super_admin.mjs you@example.com --demote   (back to citizen)
 *
 * After running, sign out and back in so the session token picks up the
 * new app_metadata role claim.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// --- Minimal .env.local loader (no dotenv dependency) ---
function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), name);
    if (!existsSync(path)) continue;
    const lines = readFileSync(path, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (!match || line.trim().startsWith("#")) continue;
      const [, key, raw] = match;
      if (process.env[key] === undefined) {
        process.env[key] = raw.replace(/^["']|["']$/g, "");
      }
    }
  }
}

const email = process.argv[2];
const demote = process.argv.includes("--demote");

if (!email || !email.includes("@")) {
  console.error("Usage: node scripts/promote_super_admin.mjs <email> [--demote]");
  process.exit(1);
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const targetRole = demote ? "citizen" : "super_admin";

// Find the user by email (paginate defensively for larger user bases).
let target = null;
for (let page = 1; page <= 10 && !target; page++) {
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
  if (error) {
    console.error(`Failed to list users: ${error.message}`);
    process.exit(1);
  }
  target = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (data.users.length < 200) break;
}

if (!target) {
  console.error(`No Supabase Auth account found for ${email}. Register first at /login.`);
  process.exit(1);
}

const { error: updateError } = await admin.auth.admin.updateUserById(target.id, {
  app_metadata: { ...target.app_metadata, role: targetRole },
});

if (updateError) {
  console.error(`Failed to update role: ${updateError.message}`);
  process.exit(1);
}

console.log(`\n  ${email}`);
console.log(`  role: ${target.app_metadata?.role || "citizen"}  ->  ${targetRole}`);
console.log(`\n  Sign out and back in for the new role to take effect.`);
if (!demote) {
  console.log(`  Then open /dashboard to reach the control plane.\n`);
}
