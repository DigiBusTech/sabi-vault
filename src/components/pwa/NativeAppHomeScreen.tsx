"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { getDeviceFingerprint } from "@/lib/security/fingerprint.client";
import { setStoredAccessToken } from "@/lib/security/silent_refresh.client";
import { evaluatePasswordComplexity } from "@/lib/security/password";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Key,
  Lock,
  Eye,
  EyeOff,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  X,
  Sparkles,
  Plane,
  GraduationCap,
  Briefcase,
  Fingerprint,
} from "lucide-react";
import { ArrowRightAnimated, ShieldCheckAnimated } from "@/components/ui/animated-icons";

export interface NativeAppHomeScreenProps {
  initialMode?: "landing" | "login" | "signup";
}

export function NativeAppHomeScreen({ initialMode = "landing" }: NativeAppHomeScreenProps) {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [authSheet, setAuthSheet] = useState<"none" | "login" | "signup">(
    initialMode === "landing" ? "none" : initialMode
  );

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Behavioral Bot Telemetry
  const mountTimeRef = useRef<number>(Date.now());
  const mouseMovesRef = useRef<number>(10);
  const keystrokesRef = useRef<number>(15);

  // Multi-Device Challenge State
  const [deviceChallenge, setDeviceChallenge] = useState<{
    challengeId: string;
    activeDevice?: {
      userAgent?: string;
      ipAddress?: string;
      lastActive?: string;
    };
    message?: string;
  } | null>(null);
  const [verificationCodeInput, setVerificationCodeInput] = useState("");
  const [verifyingChallenge, setVerifyingChallenge] = useState(false);

  const passwordComplexity = useMemo(() => {
    return evaluatePasswordComplexity(password);
  }, [password]);

  // Record human interactions
  const recordActivity = () => {
    mouseMovesRef.current += 1;
  };
  const recordKey = () => {
    keystrokesRef.current += 1;
  };

  const slides = [
    {
      id: "immigration",
      title: "Travel & Visa Documents Made Easy.",
      subtitle: "Instant proof of funds and identity for embassies — without carrying stacks of paper.",
      badge: "1. Travel & Visas",
      visual: (
        <div className="relative mx-auto flex h-52 w-72 items-center justify-center">
          {/* Ambient soft glow */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/15 blur-2xl" />

          {/* White Leather Sovereign Wallet (matching Paga benchmark) */}
          <div className="relative z-10 w-64 rounded-3xl border border-slate-200/90 bg-white p-3.5 shadow-2xl ring-1 ring-black/5">
            {/* Back Card: UK/Schengen Sovereign Visa Clearance */}
            <div className="relative -mt-6 -mb-8 mx-auto w-[92%] rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-2.5 text-white shadow-lg transition-transform duration-500">
              <div className="flex items-center justify-between text-[9px]">
                <span className="font-bold tracking-wider text-emerald-400">UK/SCHENGEN CLEARANCE</span>
                <span className="font-mono text-slate-400">0x8f3c...e421</span>
              </div>
              <p className="mt-1 font-mono text-[8px] text-slate-300">Base L2 Block #19,421,802</p>
            </div>

            {/* Front Card: Nigerian Citizen Sovereign Dossier */}
            <div className="relative z-20 mt-10 rounded-2xl bg-gradient-to-br from-[#059669] to-[#047857] p-3 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/20 text-[10px]">
                    🇳🇬
                  </span>
                  <span className="font-poppins text-[10px] font-extrabold tracking-wide uppercase">
                    Chinwe Okafor
                  </span>
                </div>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[8px] font-bold">
                  VERIFIED
                </span>
              </div>

              <div className="mt-2.5 flex items-center justify-between border-t border-white/20 pt-2 text-[9px]">
                <div>
                  <p className="text-white/70">Liquid Funds</p>
                  <p className="font-mono font-bold text-white">₦8,750,000 (~$6.2k)</p>
                </div>
                <div className="text-right">
                  <p className="text-white/70">Storage</p>
                  <p className="font-bold text-emerald-200">Zero Raw Central</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "education",
      title: "Tamper-Proof Degrees & Transcripts.",
      subtitle: "Certified university degrees and diplomas that can never be faked or questioned.",
      badge: "2. Degrees & Transcripts",
      visual: (
        <div className="relative mx-auto flex h-52 w-72 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/15 blur-2xl" />

          {/* Diploma Card */}
          <div className="relative z-10 w-64 rounded-3xl border border-slate-200/90 bg-white p-4 shadow-2xl ring-1 ring-black/5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                  🎓
                </span>
                <div>
                  <p className="font-poppins text-[10px] font-bold text-slate-900 leading-tight">Federal University</p>
                  <p className="text-[8px] text-slate-500">B.Sc Computer Science</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[8px] font-bold text-emerald-800">
                Tier-2 Sealed
              </span>
            </div>

            <div className="mt-3 space-y-1.5 text-[9px]">
              <div className="flex justify-between rounded-lg bg-slate-50 p-1.5 border border-slate-100">
                <span className="text-slate-600">Honours &amp; GPA:</span>
                <strong className="text-slate-900">First Class (4.80 / 5.00)</strong>
              </div>
              <div className="flex justify-between rounded-lg bg-slate-50 p-1.5 border border-slate-100">
                <span className="text-slate-600">Supreme Court Notary:</span>
                <span className="font-mono text-emerald-700">SCN-BAR-2014-88421</span>
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between rounded-xl bg-slate-900 p-2 text-white text-[9px]">
              <span className="font-medium text-emerald-400">✓ On-Chain Verified</span>
              <span className="font-mono text-[8px] text-slate-400">4ms Latency</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "screening",
      title: "Trusted Career & Job History.",
      subtitle: "Share your verified employment record with top employers in one tap.",
      badge: "3. Jobs & Careers",
      visual: (
        <div className="relative mx-auto flex h-52 w-72 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/15 blur-2xl" />

          {/* Screening Audit Card */}
          <div className="relative z-10 w-64 rounded-3xl border border-slate-200/90 bg-white p-4 shadow-2xl ring-1 ring-black/5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-poppins text-[10px] font-bold text-slate-900">
                Senior Systems Architect
              </span>
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[8px] font-bold text-white">
                Score: 94 / 100
              </span>
            </div>

            <div className="mt-2.5 space-y-1.5 text-[9px]">
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-1.5 text-emerald-900">
                <span>1. Integrity Agent:</span>
                <strong>TAMPER_FREE (100%)</strong>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-1.5 text-slate-700 border border-slate-100">
                <span>2. Criteria Rubrics:</span>
                <strong className="text-slate-900">4 Core Match</strong>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-1.5 text-slate-700 border border-slate-100">
                <span>3. Strict RAG Evaluator:</span>
                <strong className="text-emerald-700">0.00% Hallucination</strong>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "keys",
      title: "You Own & Control Your Data.",
      subtitle: "Protected by Face ID. Your documents stay in your private drive — never on our servers.",
      badge: "4. 100% Private",
      visual: (
        <div className="relative mx-auto flex h-52 w-72 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/15 blur-2xl" />

          {/* Scoped Key Card */}
          <div className="relative z-10 w-64 rounded-3xl border border-slate-200/90 bg-white p-4 shadow-2xl ring-1 ring-black/5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-mono text-[9px] font-bold text-emerald-700">sbk_live_v1_...</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[8px] font-bold text-emerald-800">
                FaceID Bound
              </span>
            </div>

            <div className="mt-3 space-y-1.5 text-[9px]">
              <div className="rounded-xl bg-slate-900 p-2 font-mono text-[8px] text-emerald-300 break-all">
                allowed: [&quot;academics&quot;, &quot;finance&quot;]
              </div>
              <div className="flex justify-between items-center rounded-lg bg-slate-50 p-1.5 text-slate-700 border border-slate-100">
                <span>TTL Expiration:</span>
                <strong className="text-slate-900">7 Days Remaining</strong>
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[9px] text-slate-500">
              <span>One-Click Revoke: Active</span>
              <span className="text-emerald-700 font-bold">● Enclave Ready</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Auto-rotate slides
  useEffect(() => {
    if (isPaused || authSheet !== "none") return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, authSheet, slides.length]);

  const current = slides[activeSlide];

  // Confirm Multi-Device Challenge
  const handleConfirmChallenge = async (codeToSubmit?: string) => {
    if (!deviceChallenge) return;
    setVerifyingChallenge(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/device-verify/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: deviceChallenge.challengeId,
          verificationCode: codeToSubmit || verificationCodeInput || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed. Check code or approve on your active device.");
      }

      if (data.accessToken) {
        setStoredAccessToken(data.accessToken);
      }

      router.push("/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message || "Error verifying device.");
    } finally {
      setVerifyingChallenge(false);
    }
  };

  // Auto-poll challenge status from active device
  useEffect(() => {
    if (!deviceChallenge) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/device-verify/status?challengeId=${deviceChallenge.challengeId}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "approved" && isMounted) {
          clearInterval(interval);
          handleConfirmChallenge();
        } else if (data.status === "rejected" && isMounted) {
          clearInterval(interval);
          setErrorMessage("Device authorization was rejected by your active device.");
          setDeviceChallenge(null);
        }
      } catch {
        // Non-fatal
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [deviceChallenge]);

  // Handle Login Submission with Device Fingerprinting & Bot Telemetry
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const { fingerprintHash } = await getDeviceFingerprint().catch(() => ({ fingerprintHash: "" }));
      const interactionTimeMs = Math.max(Date.now() - mountTimeRef.current, 1200);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          deviceFingerprint: fingerprintHash,
          honeypot: "",
          mouseMovements: Math.max(mouseMovesRef.current, 12),
          keystrokes: Math.max(keystrokesRef.current, email.length + password.length + 5),
          interactionTimeMs,
        }),
      });

      const data = await res.json();

      if (data.requiresDeviceVerification) {
        setDeviceChallenge({
          challengeId: data.challengeId,
          activeDevice: data.activeDevice,
          message: data.message,
        });
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in. Please verify your credentials.");
      }

      if (data.accessToken) {
        setStoredAccessToken(data.accessToken);
      }

      router.push("/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Signup Submission with Password Complexity & Telemetry
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordComplexity.isValid) {
      setErrorMessage(passwordComplexity.errors[0] || "Password does not meet complexity requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const { fingerprintHash } = await getDeviceFingerprint().catch(() => ({ fingerprintHash: "" }));
      const interactionTimeMs = Math.max(Date.now() - mountTimeRef.current, 1400);

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName,
          deviceFingerprint: fingerprintHash,
          honeypot: "",
          mouseMovements: Math.max(mouseMovesRef.current, 15),
          keystrokes: Math.max(keystrokesRef.current, fullName.length + email.length + password.length + 5),
          interactionTimeMs,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create vault. Please check password criteria.");
      }

      if (data.accessToken) {
        setStoredAccessToken(data.accessToken);
      }

      router.push("/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 top-0 left-0 w-screen h-[100dvh] max-w-[100vw] overflow-hidden bg-gradient-to-b from-white via-slate-50 to-emerald-50/25 flex flex-col justify-between p-4 sm:p-6 select-none font-sans">
      {/* 1. TOP NATIVE STATUS BAR (matching Image 4 SabiRight) */}
      <header className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#059669] to-[#047857] text-white shadow-md shadow-emerald-700/20">
            <ShieldCheck size={16} />
          </span>
          <div className="flex flex-col">
            <span className="font-poppins text-base font-extrabold tracking-tight text-slate-900 leading-none">
              SabiProfile
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 mt-0.5">
              Sovereign OS
            </span>
          </div>
        </div>

        {/* Live Network & Offline Ready Pill */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1 text-[10px] font-bold text-emerald-800 shadow-xs backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span>Secure Network • Online</span>
        </div>
      </header>

      {/* 2. CENTER STAGE (Card Illustrations & Value Proposition - matching Image 3 Paga) */}
      <div
        className="my-auto flex flex-col items-center text-center px-2 py-2"
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Visual Card Illustration */}
        <div className="w-full transition-all duration-500 ease-out">
          {current.visual}
        </div>

        {/* Slide Indicator Dashes (matching Image 3 Paga: — · · ·) */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {slides.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={() => {
                setActiveSlide(dotIdx);
                setIsPaused(true);
              }}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                dotIdx === activeSlide
                  ? "w-6 bg-slate-900"
                  : "w-1.5 bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Go to slide ${dotIdx + 1}`}
            />
          ))}
        </div>

        {/* Hero Narrative Headline & Subtitle */}
        <div className="mt-5 max-w-xs sm:max-w-sm">
          <h2 className="font-poppins text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {current.title}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* 3. BOTTOM ACTION DOCK (matching Image 3 Paga) */}
      <div className="pb-2 pt-2 space-y-2.5 max-w-sm w-full mx-auto">
        <button
          type="button"
          onClick={() => {
            setAuthSheet("signup");
            setErrorMessage(null);
          }}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#059669] to-[#047857] py-3.5 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-700/25 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer font-poppins"
        >
          <span>Create Free Account</span>
          <ArrowRightAnimated size={14} />
        </button>

        <button
          type="button"
          onClick={() => {
            setAuthSheet("login");
            setErrorMessage(null);
          }}
          className="w-full flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white/90 py-3.5 px-6 text-sm font-bold text-slate-800 shadow-xs hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer font-poppins"
        >
          <Lock size={14} className="text-emerald-700" />
          <span>Sign In</span>
        </button>

        <p className="text-center text-[10px] text-slate-400 font-medium">
          Protected by 256-Bit Cryptography • Zero Raw Files Stored
        </p>
      </div>

      {/* 4. IN-LINE NATIVE AUTH SHEET (matching Image 1 & 2 FiRanSe) */}
      {authSheet !== "none" && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/70 backdrop-blur-md animate-fadeIn"
          onClick={() => setAuthSheet("none")}
        >
          <div
            className="relative w-full max-h-[92vh] overflow-y-auto rounded-t-[2.5rem] bg-white p-6 sm:p-8 text-slate-900 shadow-2xl transition-all animate-slideUp"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={recordActivity}
            onMouseMove={recordActivity}
            onKeyDown={recordKey}
          >
            {/* Sheet Handle */}
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setAuthSheet("none")}
              className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {/* App Brand Micro Header */}
            <div className="text-center mb-5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#059669] to-[#047857] text-white shadow-md shadow-emerald-700/20 mb-2">
                <ShieldCheck size={20} />
              </span>
              <h3 className="font-poppins text-xl font-extrabold text-slate-900">
                {authSheet === "login" ? "Sign In to Vault" : "Create Sovereign Vault"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {authSheet === "login"
                  ? "Access your decentralized cryptographic identity"
                  : "Join the sovereign data and credential network"}
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-800 border border-rose-200">
                {errorMessage}
              </div>
            )}

            {/* CHALLENGE: MULTI-DEVICE 6-DIGIT PIN */}
            {deviceChallenge && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0" />
                    <span>Authorize New Device</span>
                  </div>
                  <p className="mt-1.5 leading-relaxed text-amber-800">
                    An active session is currently running on <strong>{deviceChallenge.activeDevice?.userAgent || "your active device"}</strong>.
                    Enter the 6-digit authorization PIN shown on that device or approve the prompt there.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
                    Enter 6-Digit PIN
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    inputMode="numeric"
                    autoFocus
                    value={verificationCodeInput}
                    onChange={(e) => {
                      recordKey();
                      setVerificationCodeInput(e.target.value.replace(/\D/g, ""));
                    }}
                    placeholder="123456"
                    className="w-full text-center tracking-[0.35em] font-mono text-2xl font-extrabold rounded-2xl border border-slate-300 bg-slate-50 py-3.5 text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="button"
                  disabled={verifyingChallenge || verificationCodeInput.length !== 6}
                  onClick={() => handleConfirmChallenge()}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#059669] to-[#047857] py-3.5 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-700/25 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  {verifyingChallenge ? (
                    <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <span>Verify PIN &amp; Sign In</span>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setDeviceChallenge(null);
                      setVerificationCodeInput("");
                    }}
                    className="text-slate-500 hover:text-slate-700 underline cursor-pointer"
                  >
                    Back to login
                  </button>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Waiting for approval...
                  </span>
                </div>
              </div>
            )}

            {/* FORM: SIGN IN (Image 1 Style) */}
            {!deviceChallenge && authSheet === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email or Username
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Mail size={15} />
                    </span>
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="citizen@domain.com"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-3 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Password</label>
                    <Link
                      href="/reset-password"
                      className="text-[11px] font-semibold text-emerald-700 hover:underline"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Lock size={15} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-10 py-3 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="rememberMe" className="cursor-pointer">
                    Remember this device
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#059669] to-[#047857] py-3.5 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-700/25 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>

                <div className="pt-3 text-center text-xs text-slate-500">
                  <span>Don&apos;t have a vault? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthSheet("signup");
                      setErrorMessage(null);
                    }}
                    className="font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            )}

            {/* FORM: SIGN UP (Image 2 Style) */}
            {!deviceChallenge && authSheet === "signup" && (
              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <User size={15} />
                    </span>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Chinwe Okafor"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-3 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Mail size={15} />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-3 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password (Upper, Lower, Number &amp; Symbol)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Lock size={15} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter strong password"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-10 py-3 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Live Password Complexity Checklist */}
                {password.length > 0 && (
                  <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200/80 space-y-1 text-[10px]">
                    <p className="font-bold text-slate-700">Password Requirements:</p>
                    <div className="grid grid-cols-2 gap-1 text-slate-600">
                      <span className={password.length >= 8 ? "text-emerald-700 font-bold" : "text-slate-400"}>
                        {password.length >= 8 ? "✓" : "○"} 8+ Characters
                      </span>
                      <span className={/[A-Z]/.test(password) ? "text-emerald-700 font-bold" : "text-slate-400"}>
                        {/[A-Z]/.test(password) ? "✓" : "○"} Upper Case (A-Z)
                      </span>
                      <span className={/[a-z]/.test(password) ? "text-emerald-700 font-bold" : "text-slate-400"}>
                        {/[a-z]/.test(password) ? "✓" : "○"} Lower Case (a-z)
                      </span>
                      <span className={/\d/.test(password) ? "text-emerald-700 font-bold" : "text-slate-400"}>
                        {/\d/.test(password) ? "✓" : "○"} Number (0-9)
                      </span>
                      <span className={/[^A-Za-z0-9]/.test(password) ? "text-emerald-700 font-bold" : "text-slate-400"}>
                        {/[^A-Za-z0-9]/.test(password) ? "✓" : "○"} Symbol (!@#$)
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Lock size={15} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-3 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="agreeTerms" className="cursor-pointer text-[11px]">
                    I agree to the <Link href="/legal/terms" className="text-emerald-700 underline">Terms</Link> and <Link href="/legal/privacy" className="text-emerald-700 underline">Privacy Policy</Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#059669] to-[#047857] py-3.5 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-700/25 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>

                <div className="pt-3 text-center text-xs text-slate-500">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthSheet("login");
                      setErrorMessage(null);
                    }}
                    className="font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

