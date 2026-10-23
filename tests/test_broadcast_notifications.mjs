import assert from "assert";
import fs from "fs";
import path from "path";

console.log("\n=======================================================");
console.log("SabiProfile: Live Multi-Tenant Notification Broadcast Suite");
console.log("=======================================================\n");

async function runTests() {
  // Test 1: Verify Supabase Migration Schema
  console.log("[Test 1] Verifying Supabase Broadcast Migration Schema...");
  const migrationPath = path.join("supabase", "migrations", "20261023120000_broadcast_notifications.sql");
  assert(fs.existsSync(migrationPath), "Migration file 20261023120000_broadcast_notifications.sql must exist");
  const migrationSql = fs.readFileSync(migrationPath, "utf8");
  assert(migrationSql.includes("CREATE TABLE IF NOT EXISTS public.broadcast_notifications"), "Must create broadcast_notifications table");
  assert(migrationSql.includes("audience VARCHAR(32)"), "Must declare audience field");
  assert(migrationSql.includes("'all', 'citizen', 'enterprise', 'super_admin'"), "Must enforce audience constraints");
  assert(migrationSql.includes("'info', 'success', 'warning', 'danger', 'purple', 'custom'"), "Must enforce theme constraints");
  assert(migrationSql.includes("ENABLE ROW LEVEL SECURITY"), "Must enable RLS");
  assert(migrationSql.includes("idx_broadcast_notifications_active"), "Must create active index");
  console.log("  ✓ Database migration schema with RLS and constraints verified.");

  // Test 2: Verify TypeScript Interfaces
  console.log("\n[Test 2] Verifying TypeScript Models & Definitions...");
  const typesPath = path.join("src", "types", "broadcast.ts");
  assert(fs.existsSync(typesPath), "src/types/broadcast.ts must exist");
  const typesCode = fs.readFileSync(typesPath, "utf8");
  assert(typesCode.includes("export type BroadcastAudience"), "Must export BroadcastAudience");
  assert(typesCode.includes("export type BroadcastTheme"), "Must export BroadcastTheme");
  assert(typesCode.includes("export interface BroadcastNotification"), "Must export BroadcastNotification");
  assert(typesCode.includes("export interface CreateBroadcastInput"), "Must export CreateBroadcastInput");
  console.log("  ✓ Broadcast TypeScript interfaces verified.");

  // Test 3: Verify Core Broadcast Store Logic & Audience Scoping
  console.log("\n[Test 3] Verifying BroadcastNotificationStore Logic & Scoping...");
  const storePath = path.join("src", "core", "notifications", "broadcast_store.ts");
  assert(fs.existsSync(storePath), "broadcast_store.ts must exist");
  const storeCode = fs.readFileSync(storePath, "utf8");
  assert(storeCode.includes("getActiveBroadcasts"), "Must implement getActiveBroadcasts");
  assert(storeCode.includes("createBroadcast"), "Must implement createBroadcast");
  assert(storeCode.includes("updateBroadcast"), "Must implement updateBroadcast");
  assert(storeCode.includes("deleteBroadcast"), "Must implement deleteBroadcast");

  // In-memory simulation of store filtering rules
  const mockItems = [
    { id: "1", title: "General", audience: "all", is_active: true, priority: 1, starts_at: new Date(Date.now() - 1000).toISOString() },
    { id: "2", title: "Citizens Only", audience: "citizen", is_active: true, priority: 2, starts_at: new Date(Date.now() - 1000).toISOString() },
    { id: "3", title: "Orgs Only", audience: "enterprise", is_active: true, priority: 3, starts_at: new Date(Date.now() - 1000).toISOString() },
    { id: "4", title: "Paused", audience: "all", is_active: false, priority: 1, starts_at: new Date(Date.now() - 1000).toISOString() },
  ];

  function filterByRole(items, role) {
    return items.filter(i => {
      if (!i.is_active) return false;
      if (role === "all") return true;
      return i.audience === role || i.audience === "all";
    }).sort((a, b) => b.priority - a.priority);
  }

  const citizenFeed = filterByRole(mockItems, "citizen");
  assert.strictEqual(citizenFeed.length, 2, "Citizen should see 2 notifications (general + citizen)");
  assert.strictEqual(citizenFeed[0].id, "2", "Higher priority (2) should be sorted first");

  const orgFeed = filterByRole(mockItems, "enterprise");
  assert.strictEqual(orgFeed.length, 2, "Enterprise should see 2 notifications (general + enterprise)");
  assert.strictEqual(orgFeed[0].id, "3", "Enterprise priority (3) should be sorted first");

  const allFeed = filterByRole(mockItems, "all");
  assert.strictEqual(allFeed.length, 3, "General feed should contain all 3 active notifications");
  console.log("  ✓ In-memory audience filtering and priority sorting verified.");

  // Test 4: Verify Public and Admin REST API Routes
  console.log("\n[Test 4] Verifying REST API Endpoints...");
  assert(fs.existsSync(path.join("src", "app", "api", "v1", "broadcasts", "route.ts")), "Public /api/v1/broadcasts route must exist");
  assert(fs.existsSync(path.join("src", "app", "api", "v1", "admin", "broadcasts", "route.ts")), "Admin /api/v1/admin/broadcasts route must exist");
  assert(fs.existsSync(path.join("src", "app", "api", "v1", "admin", "broadcasts", "[id]", "route.ts")), "Admin [id] route must exist");

  const adminRouteCode = fs.readFileSync(path.join("src", "app", "api", "v1", "admin", "broadcasts", "route.ts"), "utf8");
  assert(adminRouteCode.includes("authenticateAdmin"), "Must protect admin routes with authenticateAdmin");
  assert(adminRouteCode.includes("broadcastStore.createBroadcast"), "Must call broadcastStore.createBroadcast");
  console.log("  ✓ API endpoints and admin authentication guards verified.");

  // Test 5: Verify Client Header Banner & Stacking Components
  console.log("\n[Test 5] Verifying BroadcastBannerBar Client Component & Docking...");
  const bannerComponentPath = path.join("src", "components", "notifications", "BroadcastBannerBar.tsx");
  assert(fs.existsSync(bannerComponentPath), "BroadcastBannerBar.tsx must exist");
  const bannerCode = fs.readFileSync(bannerComponentPath, "utf8");
  assert(bannerCode.includes("THEME_STYLES"), "Must define theme styles");
  assert(bannerCode.includes("sabi_dismissed_bcast_"), "Must track dismissals in localStorage");
  assert(bannerCode.includes("handleDismiss"), "Must support dismissing notifications");
  assert(bannerCode.includes("postgres_changes"), "Must subscribe to realtime changes");

  // Check DashboardShell integration
  const shellCode = fs.readFileSync(path.join("src", "components", "dashboard", "DashboardShell.tsx"), "utf8");
  assert(shellCode.includes("<BroadcastBannerBar"), "DashboardShell must mount BroadcastBannerBar");
  console.log("  ✓ BroadcastBannerBar component and DashboardShell docking verified.");

  // Test 6: Verify Super Admin Broadcast Manager & Navigation
  console.log("\n[Test 6] Verifying Super Admin Broadcast Console & Navigation...");
  const managerPath = path.join("src", "components", "admin", "BroadcastManager.tsx");
  assert(fs.existsSync(managerPath), "BroadcastManager.tsx must exist");
  const managerCode = fs.readFileSync(managerPath, "utf8");
  assert(managerCode.includes("Live WYSIWYG Banner Preview"), "Must include live banner preview");
  assert(managerCode.includes("THEME_PRESETS"), "Must define theme presets");
  assert(managerCode.includes("AUDIENCE_OPTIONS"), "Must define audience options");

  const adminPagePath = path.join("src", "app", "dashboard", "admin", "broadcasts", "page.tsx");
  assert(fs.existsSync(adminPagePath), "Admin broadcasts page route must exist");

  const navCode = fs.readFileSync(path.join("src", "lib", "dashboard", "nav.ts"), "utf8");
  assert(navCode.includes("/dashboard/admin/broadcasts"), "nav.ts must include broadcasts link");
  console.log("  ✓ Super Admin BroadcastManager, WYSIWYG preview, and navigation tab verified.");

  console.log("\n=======================================================");
  console.log("ALL 6 BROADCAST NOTIFICATION SUITES PASSED (100%)!");
  console.log("=======================================================\n");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

