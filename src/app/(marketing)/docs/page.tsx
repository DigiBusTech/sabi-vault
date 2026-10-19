import type { Metadata } from "next";
import { KeyRound, TerminalSquare } from "lucide-react";
import { ShieldCheckAnimated } from "@/components/ui/animated-icons";
import { LiquidGlassCard } from "@/components/ui/LiquidGlass";
import { Reveal } from "@/components/marketing/Reveal";

export const metadata: Metadata = {
  title: "Documentation | Sabi Vault",
  description:
    "Authentication model, API surface, and verification guarantees for the Sabi Vault developer API.",
};

const authMethods = [
  {
    icon: ShieldCheckAnimated,
    name: "User session",
    detail: "Supabase Auth session cookie or Bearer JWT. Roles come from server-managed app metadata and cannot be set by the caller.",
    scope: "Citizen vault routes",
  },
  {
    icon: KeyRound,
    name: "Organization key",
    detail: "X-Sabi-Org-Key header, issued by a super admin to a registered organization in active standing.",
    scope: "Screening, M2M, and query routes",
  },
  {
    icon: KeyRound,
    name: "Scoped consent key",
    detail: "sbk_live_v1_... token minted by a citizen. HMAC-signed, scoped to categories, with TTL, query quota, recipient binding, and one-click revocation.",
    scope: "Candidate data access, always paired with an organization key",
  },
  {
    icon: TerminalSquare,
    name: "Admin master key",
    detail: "X-Sabi-Admin-Key or Bearer matching the deployment's master secret. Rejects default or missing secrets in production.",
    scope: "Admin control-plane routes",
  },
];

const endpointGroups = [
  {
    group: "Citizen vault",
    routes: [
      ["GET /api/v1/vault/credentials", "List the caller's vault records"],
      ["POST /api/v1/vault/credentials", "Add a record to the caller's vault"],
      ["DELETE /api/v1/vault/credentials", "Remove a record from the caller's vault"],
      ["POST /api/v1/vault/sync", "Ephemeral cloud sync, hash, and on-chain commit"],
      ["GET /api/v1/vault/keys", "List scoped keys (summaries only, secrets never re-disclosed)"],
      ["POST /api/v1/vault/keys", "Mint a scoped consent key"],
      ["POST /api/v1/vault/keys/revoke", "Revoke a key the caller owns"],
      ["GET /api/v1/vault/audit-log", "Citizen transparency log of vault access"],
    ],
  },
  {
    group: "Screening and queries",
    routes: [
      ["POST /api/v1/screen", "Screen one candidate key against a rubric (org key + consent key)"],
      ["POST /api/v1/vault/query", "Consented scoped read of a candidate vault (dual key)"],
      ["POST /api/v1/enterprise/criteria", "Manage requirement rubrics"],
      ["POST /api/v1/enterprise/screen-batch", "Parallel batch screening"],
    ],
  },
  {
    group: "Machine to machine",
    routes: [
      ["POST /api/v1/m2m/query", "Scoped candidate query with quota decrement"],
      ["POST /api/v1/m2m/evaluate", "Multi-agent evaluation with dual-key authentication"],
      ["POST /api/v1/m2m/batch-verify", "Queued batch verification"],
      ["GET /api/v1/m2m/webhooks", "List webhook subscriptions"],
      ["POST /api/v1/m2m/webhooks", "Subscribe to key.revoked and tamper events"],
    ],
  },
  {
    group: "Government, notary, admin",
    routes: [
      ["GET /api/v1/govt/analytics", "Sovereign node telemetry and revenue share"],
      ["POST /api/v1/govt/disburse", "Disburse the 40% sovereign split"],
      ["POST /api/v1/notary/attest", "Tier 2 legal attestation anchored on-chain"],
      ["GET /api/v1/admin/orgs", "Organization registry (admin key)"],
      ["GET /api/v1/admin/users", "User registry (admin key)"],
      ["GET /api/v1/admin/telemetry", "Platform telemetry (admin key)"],
      ["GET /api/v1/admin/config", "Configuration vault (admin key)"],
    ],
  },
];

export default function DocsPage() {
  return (
    <main className="bg-white text-brand-dark">
      <section className="mx-auto max-w-7xl px-5 pt-20 pb-16 lg:px-8">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-green">
            Documentation
          </p>
          <h1 className="mt-4 max-w-3xl font-poppins text-4xl font-extrabold leading-[1.08] tracking-tight md:text-5xl">
            The Sabi Vault API, end to end.
          </h1>
          <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-slate-600">
            Everything an integrator needs: how authentication works, which routes exist, and
            what the verification pipeline guarantees. Full request and response schemas live in
            the repository as API_DOCUMENTATION.md.
          </p>
        </Reveal>
      </section>

      <section className="border-y border-slate-200 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <Reveal>
            <h2 className="font-poppins text-2xl font-bold tracking-tight md:text-3xl">
              Four credentials, four jobs
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {authMethods.map((method, index) => (
              <Reveal key={method.name} delay={index * 80}>
                <LiquidGlassCard className="h-full rounded-2xl p-7">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green-light text-brand-green">
                      <method.icon size={18} strokeWidth={1.8} />
                    </div>
                    <span className="liquid-glass-pill px-3 py-1 text-[11px] font-semibold text-slate-500">{method.scope}</span>
                  </div>
                  <h3 className="mt-4 font-poppins text-base font-bold">{method.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{method.detail}</p>
                </LiquidGlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <Reveal>
          <h2 className="font-poppins text-2xl font-bold tracking-tight md:text-3xl">
            Endpoint index
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {endpointGroups.map((group, index) => (
            <Reveal key={group.group} delay={(index % 2) * 90}>
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-7">
                <h3 className="font-poppins text-base font-bold text-brand-green">{group.group}</h3>
                <ul className="mt-4 space-y-3">
                  {group.routes.map(([route, description]) => (
                    <li key={route}>
                      <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-brand-dark">
                        {route}
                      </code>
                      <p className="mt-1 text-sm text-slate-600">{description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <Reveal>
            <h2 className="font-poppins text-2xl font-bold tracking-tight md:text-3xl">
              Verification guarantees
            </h2>
            <ul className="mt-8 max-w-3xl space-y-4">
              {[
                "Every screening run starts with an on-chain integrity check. A hash mismatch or a simulated anchor fails the request closed.",
                "Scoped keys enforce their own policy: category scope, expiry, quota, and recipient binding are verified on every call.",
                "The evaluation agent cites only verified record fields. Missing data fails the category; it is never estimated.",
                "Production deployments refuse to start verification without configured signing and admin secrets.",
              ].map((item) => (
                <li key={item} className="liquid-glass-card flex gap-4 rounded-2xl p-5">
                  <ShieldCheckAnimated size={18} className="mt-0.5 shrink-0 text-brand-green" />
                  <p className="text-sm leading-relaxed text-slate-700">{item}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
