"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Vault,
  FileUp,
  KeyRound,
  ScrollText,
  Sliders,
  ScanSearch,
  Building2,
  Landmark,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Users,
  Settings2,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logoutAndResetSession, getStoredAccessToken } from "@/lib/security/silent_refresh.client";

export interface ShellNavItem {
  id: string;
  label: string;
}

interface DashboardShellProps {
  role: string;
  email: string;
  orgName?: string;
  navItems: ShellNavItem[];
  children: React.ReactNode;
}

const NAV_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  overview: LayoutDashboard,
  vault: Vault,
  documents: FileUp,
  keys: KeyRound,
  audit: ScrollText,
  rubrics: Sliders,
  screening: ScanSearch,
  organization: Building2,
  nodes: Landmark,
  users: Users,
  organizations: Building2,
  config: Settings2,
  ledger: Landmark,
  fraud: ShieldCheck,
};

function roleLabel(role: string): string {
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Enterprise dashboard shell: fixed sidebar with scroll-spy navigation,
 * user identity card, sign-out, and a subtle ambient background simulation
 * (drifting brand glows over a hairline grid). Ambient motion is CSS-only,
 * composited transforms, and neutralized by the global reduced-motion rule.
 */
export function DashboardShell({ role, email, orgName, navItems, children }: DashboardShellProps) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string>(navItems[0]?.id ?? "overview");
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [sessionTerminated, setSessionTerminated] = useState<boolean>(false);
  const [pendingChallenge, setPendingChallenge] = useState<{
    id: string;
    ipAddress: string;
    userAgent: string;
    verificationCode: string;
    createdAt: string;
  } | null>(null);
  const [respondingChallenge, setRespondingChallenge] = useState<boolean>(false);

  // Poll for pending multi-device authorization challenges every 4 seconds
  useEffect(() => {
    let isCancelled = false;

    const checkPendingChallenge = async () => {
      try {
        const token = getStoredAccessToken();
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch("/api/auth/device-verify/pending", {
          headers,
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (!isCancelled) {
            if (data.hasPending && data.challenge) {
              setPendingChallenge(data.challenge);
            } else {
              setPendingChallenge(null);
            }
          }
        }
      } catch {
        // Non-fatal
      }
    };

    checkPendingChallenge();
    const interval = setInterval(checkPendingChallenge, 4000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleRespondChallenge = async (action: "approve" | "reject") => {
    if (!pendingChallenge) return;
    setRespondingChallenge(true);
    try {
      const token = getStoredAccessToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/auth/device-verify/respond", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          challengeId: pendingChallenge.id,
          action,
        }),
      });

      if (res.ok) {
        setPendingChallenge(null);
      }
    } catch {
      // Non-fatal
    } finally {
      setRespondingChallenge(false);
    }
  };


  // Single-Session Enforcement Heartbeat:
  // Continuously monitors active session status across devices/browsers
  useEffect(() => {
    let isCancelled = false;

    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session", { credentials: "include" });
        if (res.status === 401) {
          const data = await res.json().catch(() => ({}));
          if (data.terminated || data.code === "SESSION_TERMINATED_CONCURRENT") {
            if (!isCancelled) {
              setSessionTerminated(true);
            }
          }
        }
      } catch {
        // Network flicker, ignore
      }
    };

    // Immediate check on mount
    checkSession();

    // Check periodically (every 8 seconds)
    const interval = setInterval(checkSession, 8000);

    // Also check immediately when window gains focus or tab becomes visible
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    };
    window.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", checkSession);
    const onSessionTerminatedEvent = () => setSessionTerminated(true);
    window.addEventListener("sabi:session-terminated", onSessionTerminatedEvent);


    return () => {
      isCancelled = true;
      clearInterval(interval);
      window.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", checkSession);
      window.removeEventListener("sabi:session-terminated", onSessionTerminatedEvent);
    };
  }, []);

  // Scroll-spy via IntersectionObserver (no scroll listeners).
  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [navItems]);

  const signOut = async () => {
    try {
      await logoutAndResetSession();
      await createClient().auth.signOut();
    } catch (e) {
      console.error("[Auth] Sign out error", e);
    }
    router.replace("/login");
    router.refresh();
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <p className="font-heading text-sm font-bold tracking-wide text-slate-900">SabiProfile</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
            {roleLabel(role)}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Workspace sections">
        {navItems.map((item) => {
          const Icon = NAV_ICONS[item.id] ?? LayoutDashboard;
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              {item.label}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              )}
            </a>
          );
        })}
      </nav>

      {/* User card */}
      <div className="border-t border-slate-200 p-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
              {email.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-900">{orgName || email}</p>
              {orgName && <p className="truncate text-[11px] text-slate-500">{email}</p>}
              {!orgName && (
                <p className="text-[11px] font-medium text-emerald-700">{roleLabel(role)}</p>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={signOut}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:text-slate-900 active:scale-[0.98]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
            <Link
              href="/"
              className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:text-slate-900 active:scale-[0.98]"
            >
              Site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900">
      {/* Ambient background simulation: drifting brand glows over a hairline grid */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(15,23,42,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.045) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse 90% 70% at 60% 0%, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 60% 0%, black 30%, transparent 75%)",
          }}
        />
        <div
          className="absolute -top-32 right-[-10%] h-[420px] w-[560px] rounded-full"
          style={{
            background: "radial-gradient(closest-side, rgba(5,150,105,0.09), transparent)",
            animation: "ambientDriftA 16s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-[-20%] left-[8%] h-[380px] w-[520px] rounded-full"
          style={{
            background: "radial-gradient(closest-side, rgba(15,23,42,0.05), transparent)",
            animation: "ambientDriftB 20s ease-in-out infinite",
          }}
        />
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-slate-200 bg-white lg:block">
        {sidebar}
      </aside>

      {/* Mobile topbar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <p className="font-heading text-sm font-bold text-slate-900">SabiProfile</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
              {roleLabel(role)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-[280px] border-r border-slate-200 bg-white shadow-2xl">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Content */}
      <main className="relative z-10 lg:pl-[260px]">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
      {/* Real-time Multi-Device Authorization Challenge Modal */}
      {pendingChallenge && (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="max-w-md w-full rounded-3xl border border-amber-400/50 bg-white p-7 text-slate-900 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 ring-4 ring-amber-50">
              <ShieldCheck size={28} className="text-amber-600" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-800">
                <Lock size={12} />
                Multi-Device Security Verification
              </span>
              <h3 className="mt-2 font-poppins text-xl font-extrabold text-slate-900">
                Authorize New Device?
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                A new device or browser is attempting to sign into your SabiProfile account. Do you authorize this device?
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-left text-xs space-y-2 border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Requesting Device:</span>
                <strong className="text-slate-900 truncate max-w-[200px]">
                  {pendingChallenge.userAgent}
                </strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IP Address:</span>
                <strong className="text-slate-900">{pendingChallenge.ipAddress}</strong>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-700">6-Digit PIN:</span>
                <span className="font-mono text-base font-extrabold tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                  {pendingChallenge.verificationCode}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Approving will register the new device and transfer your active single-session dashboard access.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={respondingChallenge}
                onClick={() => handleRespondChallenge("reject")}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 transition-colors cursor-pointer"
              >
                <span>Deny &amp; Block</span>
              </button>

              <button
                type="button"
                disabled={respondingChallenge}
                onClick={() => handleRespondChallenge("approve")}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#059669] py-2.5 text-xs font-bold text-white hover:bg-[#047857] shadow-md transition-all cursor-pointer"
              >
                <span>Approve Device</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unclosable Security Lockout Overlay for Concurrent Login */}
      {sessionTerminated && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="max-w-md w-full rounded-3xl border border-rose-500/40 bg-white p-7 text-slate-900 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 ring-4 ring-rose-50">
              <AlertTriangle size={28} />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-[11px] font-bold text-rose-800">
                <Lock size={12} />
                Single-Session Security Policy
              </span>
              <h3 className="mt-2 font-poppins text-xl font-extrabold text-slate-900">
                Session Terminated
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Another browser or device has logged into this account. SabiProfile enforces strict sovereign single-session compliance (1 active device per user). Access on this device has been revoked.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3.5 text-left text-[11px] space-y-1.5 text-slate-500 border border-slate-200/70">
              <div className="flex justify-between">
                <span>Security Protocol:</span>
                <strong className="text-slate-800">1 Device / Single-Session</strong>
              </div>
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <strong className="text-slate-800">{new Date().toLocaleTimeString()}</strong>
              </div>
              <div className="flex justify-between">
                <span>Enforcement:</span>
                <strong className="text-rose-600">FAIL-CLOSED (Locked)</strong>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                await logoutAndResetSession();
                window.location.href = "/login?terminated=concurrent";
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-rose-700 transition-colors shadow-md cursor-pointer"
            >
              <span>Sign In Again on This Device</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
