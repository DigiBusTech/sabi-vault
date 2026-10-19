"use client";

import React, { useEffect, useState } from "react";
import { Check, ExternalLink, Loader2, Lock, Settings2, X } from "lucide-react";

interface CloudConnectModalProps {
  provider: "google_drive" | "dropbox";
  open: boolean;
  onClose: () => void;
}

type ConnectState =
  | { status: "loading" }
  | { status: "ready"; authorizeUrl: string }
  | { status: "unconfigured"; message: string; requiredConfig: string[] }
  | { status: "error"; message: string };

const PROVIDER_META = {
  google_drive: {
    name: "Google Drive",
    logo: "https://cdn.simpleicons.org/googledrive",
    scopeCopy: "Read-only access to files you explicitly pick. Nothing is uploaded to Sabi Vault servers.",
  },
  dropbox: {
    name: "Dropbox",
    logo: "https://cdn.simpleicons.org/dropbox",
    scopeCopy: "Read-only access to files you explicitly pick. Nothing is uploaded to Sabi Vault servers.",
  },
} as const;

/**
 * Cloud storage linking dialog. Queries the node's integration endpoint:
 * when OAuth credentials are configured it hands off to the provider's
 * consent screen; otherwise it shows an honest configuration state instead
 * of pretending to connect.
 */
export function CloudConnectModal({ provider, open, onClose }: CloudConnectModalProps) {
  const [state, setState] = useState<ConnectState>({ status: "loading" });
  const meta = PROVIDER_META[provider];

  useEffect(() => {
    if (!open) return;
    setState({ status: "loading" });
    let cancelled = false;

    fetch(`/api/v1/integrations/${provider}/connect`)
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && data.authorizeUrl) {
          setState({ status: "ready", authorizeUrl: data.authorizeUrl });
        } else if (res.status === 503) {
          setState({
            status: "unconfigured",
            message: data.message || "Integration is not configured on this node.",
            requiredConfig: data.requiredConfig || data.requiredEnv || [],
          });
        } else {
          setState({ status: "error", message: data.error || "Failed to start the connection flow." });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error", message: "Network error while contacting the node." });
      });

    return () => {
      cancelled = true;
    };
  }, [open, provider]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Connect ${meta.name}`}
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
        style={{ animation: "dashCardIn 0.3s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={meta.logo} alt="" className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-heading text-base font-bold text-slate-900">
              Connect {meta.name}
            </h3>
            <p className="text-xs text-slate-500">Ephemeral sync, zero raw storage</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
          <div className="flex items-start gap-2.5">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-xs leading-relaxed text-slate-600">
              {meta.scopeCopy} Documents stream through memory, are hashed (SHA-256) and anchored
              on-chain, then the buffer is zeroed.
            </p>
          </div>
        </div>

        <div className="mt-5">
          {state.status === "loading" && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking node configuration...
            </div>
          )}

          {state.status === "ready" && (
            <a
              href={state.authorizeUrl}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98]"
            >
              Continue to {meta.name}
              <ExternalLink className="h-4 w-4" />
            </a>
          )}

          {state.status === "unconfigured" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2.5">
                <Settings2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-bold text-amber-900">Awaiting OAuth credentials</p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-800">
                    {state.message} An administrator registers a {meta.name} OAuth app and sets these
                    keys in the Super Admin dashboard:
                  </p>
                  <div className="mt-2 space-y-1">
                    {state.requiredConfig.map((v) => (
                      <code
                        key={v}
                        className="block w-fit rounded bg-white px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-900 ring-1 ring-amber-200"
                      >
                        {v}
                      </code>
                    ))}
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-amber-800">
                    Until then, use manual upload. It runs through the exact same ephemeral
                    hashing pipeline.
                  </p>
                </div>
              </div>
            </div>
          )}

          {state.status === "error" && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
              {state.message}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
          <Check className="h-3 w-3 text-emerald-500" />
          NDPC / GDPR aligned. You can revoke access anytime from your {meta.name} account.
        </div>
      </div>
    </div>
  );
}
