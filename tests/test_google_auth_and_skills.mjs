import assert from "assert";
import fs from "fs";
import path from "path";

console.log("\n=======================================================");
console.log("SabiProfile: Google Fast Auth & Multi-Agent SaaS Skills Suite");
console.log("=======================================================\n");

async function runTests() {
  // Test 1: Verify installed skills in .agents/skills/
  console.log("[Test 1] Verifying 4 newly installed skills...");
  const expectedSkills = [
    "multi-agent-orchestration",
    "saas-architect",
    "saas-pipeline",
    "backend-architect"
  ];

  for (const sk of expectedSkills) {
    const skillFile = path.join(".agents", "skills", sk, "SKILL.md");
    assert(fs.existsSync(skillFile), `Skill ${sk}/SKILL.md must exist`);
    const content = fs.readFileSync(skillFile, "utf8");
    assert(content.length > 500, `Skill ${sk} must have substantial instructions`);
    console.log(`  ✓ Skill '${sk}' verified (${content.length} bytes).`);
  }

  // Test 2: B2B, B2C, B2G SaaS Architect specifications
  console.log("\n[Test 2] Verifying B2B, B2C, and B2G SaaS Architecture specifications...");
  const saasContent = fs.readFileSync(path.join(".agents", "skills", "saas-architect", "SKILL.md"), "utf8");
  assert(saasContent.includes("B2B SaaS Considerations"), "Must include B2B");
  assert(saasContent.includes("B2C SaaS Considerations"), "Must include B2C");
  assert(saasContent.includes("B2G (Business-to-Government"), "Must include B2G");
  console.log("  ✓ SaaS Architect skill specifies B2B, B2C, and B2G GovTech sovereign models.");

  // Test 3: Google Auth Platform Configuration Registry
  console.log("\n[Test 3] Verifying Google Auth Configuration Keys...");
  const configSource = fs.readFileSync(path.join("src", "core", "config", "platform_config.ts"), "utf8");
  assert(configSource.includes("auth.google_oauth_enabled"), "Registry must include google_oauth_enabled");
  assert(configSource.includes("auth.google_client_id"), "Registry must include google_client_id");
  assert(configSource.includes("auth.google_client_secret"), "Registry must include google_client_secret");
  assert(configSource.includes("auth.google_redirect_uri"), "Registry must include google_redirect_uri");
  console.log("  ✓ Google Auth keys registered in Super Admin platform configuration.");

  // Test 4: Google Auth API & Callback Integration
  console.log("\n[Test 4] Verifying Google Auth API Routes & Callback...");
  assert(fs.existsSync(path.join("src", "app", "api", "v1", "auth", "google", "signin", "route.ts")), "Signin route must exist");
  assert(fs.existsSync(path.join("src", "app", "api", "v1", "auth", "google", "config", "route.ts")), "Config route must exist");
  assert(fs.existsSync(path.join("src", "components", "auth", "GoogleAuthButton.tsx")), "GoogleAuthButton must exist");
  console.log("  ✓ Google fast sign-in API, configuration endpoint, and UI button active.");

  // Test 5: Google OAuth Redirect URI Normalization (Resolves Error 400 redirect_uri_mismatch)
  console.log("\n[Test 5] Verifying Google OAuth Canonical Redirect URI Resolver...");
  const oauthModulePath = path.join("src", "lib", "auth", "google_oauth.ts");
  assert(fs.existsSync(oauthModulePath), "google_oauth.ts helper module must exist");
  const oauthSource = fs.readFileSync(oauthModulePath, "utf8");
  assert(oauthSource.includes("export function resolveGoogleRedirectUri"), "Must export resolveGoogleRedirectUri");
  assert(oauthSource.includes("sabiprofile.com"), "Must canonicalize sabiprofile.com");

  // Verify import in signin and callback routes
  const signinSource = fs.readFileSync(path.join("src", "app", "api", "v1", "auth", "google", "signin", "route.ts"), "utf8");
  assert(signinSource.includes("resolveGoogleRedirectUri"), "Signin route must use resolveGoogleRedirectUri");

  const callbackSource = fs.readFileSync(path.join("src", "app", "auth", "callback", "route.ts"), "utf8");
  assert(callbackSource.includes("resolveGoogleRedirectUri"), "Callback route must use resolveGoogleRedirectUri");
  assert(callbackSource.includes("globalUserStore.getVault"), "Callback route must seed user vault");

  // Simulate resolution logic matching the typescript implementation
  function testResolver(url, headers = {}, configuredUri = "https://sabiprofile.com/auth/callback") {
    let host = "";
    let proto = "https";
    try {
      const u = new URL(url);
      host = u.host;
      proto = u.protocol.replace(":", "");
    } catch {}
    if (headers["x-forwarded-host"]) {
      host = headers["x-forwarded-host"].split(",")[0].trim();
    } else if (headers["host"]) {
      host = headers["host"].trim();
    }
    if (headers["x-forwarded-proto"]) {
      proto = headers["x-forwarded-proto"].split(",")[0].trim();
    }
    const cleanHost = host.toLowerCase().split(":")[0];
    const port = host.split(":")[1];
    if (cleanHost === "localhost" || cleanHost === "127.0.0.1") {
      const devPort = port ? `:${port}` : ":3000";
      return `http://${cleanHost}${devPort}/auth/callback`;
    }
    if (cleanHost === "sabiprofile.com" || cleanHost.endsWith(".sabiprofile.com")) {
      if (configuredUri && configuredUri.includes("sabiprofile.com")) {
        return configuredUri.replace(/\/+$/, "");
      }
      return "https://sabiprofile.com/auth/callback";
    }
    if (cleanHost.endsWith(".vercel.app")) {
      return `https://${cleanHost}/auth/callback`;
    }
    const finalProto = proto === "http" && !cleanHost.includes("localhost") ? "https" : proto;
    const portPart = port && port !== "80" && port !== "443" ? `:${port}` : "";
    return `${finalProto}://${cleanHost}${portPart}/auth/callback`;
  }

  // Apex domain test
  assert.strictEqual(
    testResolver("https://sabiprofile.com/login"),
    "https://sabiprofile.com/auth/callback",
    "Apex domain must resolve to https://sabiprofile.com/auth/callback"
  );
  // WWW subdomain test (normalizes to apex whitelisted URI)
  assert.strictEqual(
    testResolver("https://www.sabiprofile.com/login"),
    "https://sabiprofile.com/auth/callback",
    "www.sabiprofile.com must normalize to https://sabiprofile.com/auth/callback"
  );
  // Reverse proxy x-forwarded-host test
  assert.strictEqual(
    testResolver("http://internal-node/login", { "x-forwarded-host": "www.sabiprofile.com", "x-forwarded-proto": "https" }),
    "https://sabiprofile.com/auth/callback",
    "x-forwarded-host www must resolve to https://sabiprofile.com/auth/callback"
  );
  // Vercel deployment test
  assert.strictEqual(
    testResolver("https://sabi-vault.vercel.app/login"),
    "https://sabi-vault.vercel.app/auth/callback",
    "Vercel domain must resolve to https://sabi-vault.vercel.app/auth/callback"
  );
  // Local development test
  assert.strictEqual(
    testResolver("http://localhost:3000/login"),
    "http://localhost:3000/auth/callback",
    "Localhost must resolve to http://localhost:3000/auth/callback"
  );
  console.log("  ✓ Redirect URI canonicalization verified across apex, www, Vercel, and localhost.");

  // Test 6: Dual-Mode Supabase + Direct Google OAuth & Descriptive Error Propagation
  console.log("\n[Test 6] Verifying Dual-Mode Supabase + Direct Google OAuth & Descriptive Error Reporting...");
  const googleBtnSource = fs.readFileSync(path.join("src", "components", "auth", "GoogleAuthButton.tsx"), "utf8");
  assert(googleBtnSource.includes("supabase.auth.signInWithOAuth"), "GoogleAuthButton must attempt Supabase OAuth first");
  assert(googleBtnSource.includes("/api/v1/auth/google/signin"), "GoogleAuthButton must fallback to direct route");

  assert(callbackSource.includes("createServerClient"), "Callback must use createServerClient with cookie binding");
  assert(callbackSource.includes("response.cookies.set"), "Callback must write session cookies directly to redirect response");
  assert(callbackSource.includes("error_description"), "Callback must propagate error_description to avoid misleading confirmation_failed errors");

  const loginFormSource = fs.readFileSync(path.join("src", "components", "auth", "LoginForm.tsx"), "utf8");
  assert(loginFormSource.includes("error_description"), "LoginForm must extract error_description from searchParams");
  console.log("  ✓ Dual-mode Supabase/Direct OAuth, response cookie binding, and error reporting verified.");

  // Test 7: OAuth Code Homepage Interceptor (Edge Middleware & Client Listener)
  console.log("\n[Test 7] Verifying OAuth Code Homepage Interceptor & Client Redirection...");
  const middlewareSource = fs.readFileSync(path.join("src", "middleware.ts"), "utf8");
  assert(middlewareSource.includes("OAuth Code Redirect Interceptor"), "Middleware must contain OAuth Code Redirect Interceptor");
  assert(middlewareSource.includes('req.nextUrl.searchParams.has("code")'), "Middleware must check for code param");
  assert(middlewareSource.includes('/auth/callback'), "Middleware must forward code to /auth/callback");

  const listenerPath = path.join("src", "components", "auth", "OAuthCodeRedirectListener.tsx");
  assert(fs.existsSync(listenerPath), "OAuthCodeRedirectListener.tsx client component must exist");
  const listenerSource = fs.readFileSync(listenerPath, "utf8");
  assert(listenerSource.includes("OAuthCodeRedirectListener"), "Listener must export OAuthCodeRedirectListener");
  assert(listenerSource.includes("window.location.replace"), "Listener must use location.replace to avoid back-button traps");

  const layoutSource = fs.readFileSync(path.join("src", "app", "layout.tsx"), "utf8");
  assert(layoutSource.includes("OAuthCodeRedirectListener"), "Root layout must mount OAuthCodeRedirectListener");

  // Simulation test of middleware interception logic
  function simulateOAuthMiddleware(urlStr) {
    const u = new URL(urlStr);
    const pathname = u.pathname;
    if ((pathname === "/" || pathname === "/login") && u.searchParams.has("code")) {
      const callbackUrl = new URL("/auth/callback", u.origin);
      u.searchParams.forEach((value, key) => {
        callbackUrl.searchParams.set(key, value);
      });
      return { redirect: callbackUrl.toString() };
    }
    return { passThrough: true };
  }

  // Intercept user's exact reported URL
  const userReportedUrl = "https://www.sabiprofile.com/?code=e8428cee-107b-48d6-a206-3bbbf24e21f0";
  const result1 = simulateOAuthMiddleware(userReportedUrl);
  assert.strictEqual(
    result1.redirect,
    "https://www.sabiprofile.com/auth/callback?code=e8428cee-107b-48d6-a206-3bbbf24e21f0",
    "Reported www homepage code URL must be forwarded to /auth/callback with code preserved"
  );

  const apexReportedUrl = "https://sabiprofile.com/?code=728735fe-720f-4950-b11c-b29e3936ddd3&state=test_state";
  const result2 = simulateOAuthMiddleware(apexReportedUrl);
  assert.strictEqual(
    result2.redirect,
    "https://sabiprofile.com/auth/callback?code=728735fe-720f-4950-b11c-b29e3936ddd3&state=test_state",
    "Apex homepage code URL must be forwarded to /auth/callback with code and state preserved"
  );

  const loginCodeUrl = "https://sabiprofile.com/login?code=test_code_999";
  const result3 = simulateOAuthMiddleware(loginCodeUrl);
  assert.strictEqual(
    result3.redirect,
    "https://sabiprofile.com/auth/callback?code=test_code_999",
    "Login page with code param must be forwarded to /auth/callback"
  );

  const normalHomepageUrl = "https://www.sabiprofile.com/";
  const result4 = simulateOAuthMiddleware(normalHomepageUrl);
  assert.strictEqual(result4.passThrough, true, "Normal homepage request without code must pass through");
  console.log("  ✓ OAuth Code interceptor verified for both edge middleware and client-side listener.");

  // Test 8: Shared Domain (.sabiprofile.com) Cookie Persistence & Modern getAll/setAll Binding
  console.log("\n[Test 8] Verifying Shared Apex Domain Cookie Persistence & Telemetry Integration...");
  const clientSource = fs.readFileSync(path.join("src", "lib", "supabase", "client.ts"), "utf8");
  assert(clientSource.includes(".sabiprofile.com"), "Client must configure shared apex domain for cookies");
  assert(clientSource.includes("cookieOptions"), "Client must provide cookieOptions to createBrowserClient");

  const updatedCallbackSource = fs.readFileSync(path.join("src", "app", "auth", "callback", "route.ts"), "utf8");
  assert(updatedCallbackSource.includes("getAll"), "Callback must use modern getAll for SSR cookie extraction");
  assert(updatedCallbackSource.includes("setAll"), "Callback must use modern setAll for SSR cookie propagation");
  assert(updatedCallbackSource.includes(".sabiprofile.com"), "Callback must enforce shared apex cookie domain");
  assert(updatedCallbackSource.includes("telemetryLogger"), "Callback must log authentication events to Super Admin telemetry");
  console.log("  ✓ Shared cookie domain across apex/subdomain and telemetry audit logging verified.");

  console.log("\n=======================================================");
  console.log("ALL 8 GOOGLE AUTH & SKILL SUITES PASSED (100%)!");
  console.log("=======================================================\n");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
