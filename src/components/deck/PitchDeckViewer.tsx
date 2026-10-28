"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Layers,
  LayoutGrid,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Printer,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  Lock,
  Globe,
  Database,
  Building,
  Briefcase,
  GraduationCap,
  Plane,
  Coins,
  Linkedin,
} from "lucide-react";
import { PITCH_DECK_SLIDES, PitchDeckSlide } from "@/data/pitch_deck_slides";

export function PitchDeckViewer() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [viewMode, setViewMode] = useState<"slide" | "dossier">("slide");
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSlides = PITCH_DECK_SLIDES.length;
  const currentSlide = PITCH_DECK_SLIDES[currentSlideIndex];

  const goToNextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  }, [totalSlides]);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index);
    if (viewMode === "dossier") {
      setViewMode("slide");
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goToNextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevSlide();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setShowNotes((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextSlide, goToPrevSlide]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const handleTriggerPrint = () => {
    setPrintModalOpen(true);
  };

  const executePrint = () => {
    setPrintModalOpen(false);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  return (
    <div
      ref={containerRef}
      className={`w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-montserrat relative select-none ${
        isFullscreen ? "p-0" : "py-6 sm:py-8 px-3 sm:px-6"
      }`}
    >
      {/* =========================================================================
          PRINT-ONLY FULL DECK PRESENTATION (Hidden on screen, rendered on window.print)
          ========================================================================= */}
      <div className="hidden print:block print:w-full print:bg-white print:text-slate-900">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: landscape;
              margin: 8mm;
            }
            body {
              background: #ffffff !important;
              color: #0f172a !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print {
              display: none !important;
            }
            .print-page-break {
              page-break-after: always !important;
              break-after: page !important;
              page-break-inside: avoid !important;
              min-height: 98vh;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding: 24px 32px;
              box-sizing: border-box;
              border: 1px solid #e2e8f0;
              margin-bottom: 20px;
              background: #ffffff !important;
            }
          }
        `}} />

        {PITCH_DECK_SLIDES.map((slide) => (
          <div key={`print-${slide.id}`} className="print-page-break">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                  S
                </div>
                <div>
                  <span className="text-xs font-bold tracking-wider uppercase text-emerald-700">
                    SabiProfile Sovereign Identity
                  </span>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {slide.category} • Base L2 Cryptographic Ledger
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-800">
                  SLIDE {String(slide.number).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
                </span>
                <div className="text-[10px] text-slate-400">Confidential Investor Deck</div>
              </div>
            </div>

            {/* Content Body */}
            <div className="my-6 flex-1">
              <span className="text-xs font-extrabold tracking-widest uppercase text-emerald-600">
                {slide.tagline}
              </span>
              <h1 className="font-poppins text-2xl font-black tracking-tight text-slate-900 mt-1 mb-2 leading-tight">
                {slide.headline}
              </h1>
              {slide.subtitle && (
                <p className="text-sm text-slate-600 max-w-4xl mb-6 leading-relaxed">
                  {slide.subtitle}
                </p>
              )}

              {/* Metrics Grid */}
              {slide.keyMetrics && (
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {slide.keyMetrics.map((m, i) => (
                    <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {m.label}
                      </div>
                      <div className="text-xl font-extrabold text-emerald-700 mt-1">{m.value}</div>
                      {m.detail && <div className="text-[10px] text-slate-400 mt-0.5">{m.detail}</div>}
                    </div>
                  ))}
                </div>
              )}

              {/* Points Grid */}
              {slide.points && (
                <div className="grid grid-cols-2 gap-4">
                  {slide.points.map((pt, i) => (
                    <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="font-poppins text-sm font-bold text-slate-900">{pt.title}</h3>
                        {pt.tag && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {pt.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{pt.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Competitive Matrix Table */}
              {slide.tableData && (
                <div className="overflow-hidden border border-slate-200 rounded-xl mt-3">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                        <th className="p-2.5 font-bold">Capability</th>
                        <th className="p-2.5 font-bold">Legacy ATS</th>
                        <th className="p-2.5 font-bold">Background Checkers</th>
                        <th className="p-2.5 font-bold">Decentralized ID</th>
                        <th className="p-2.5 font-bold bg-emerald-50 text-emerald-900">SabiProfile</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slide.tableData.map((row, i) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0">
                          <td className="p-2 font-semibold text-slate-800">{row.Feature}</td>
                          <td className="p-2 text-slate-500">{row["Legacy ATS (Workday/Greenhouse)"]}</td>
                          <td className="p-2 text-slate-500">{row["Background Checkers (Checkr/Sterling)"]}</td>
                          <td className="p-2 text-slate-500">{row["Decentralized Wallets"]}</td>
                          <td className="p-2 font-bold bg-emerald-50/50 text-emerald-700">{row["SabiProfile"]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Team specific print layout */}
              {slide.id === "slide-11" && (
                <div className="grid grid-cols-2 gap-5 mt-4">
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-poppins text-base font-extrabold text-slate-900">
                        Uyouko Nathaniel Ekpo
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                        Founder & CEO
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Distributed systems engineer, sovereign data architect, and cryptographic protocol designer.
                      Architected SabiProfile's zero-knowledge storage invariants, Base L2 smart contracts, and
                      multi-agent AI pipeline.
                    </p>
                    <div className="text-[10px] text-emerald-800 font-semibold mt-2">
                      linkedin.com/in/uyouko-nathaniel-ekpo-111b69396
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-poppins text-base font-extrabold text-slate-900">
                        Bernis DOUSSOH
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                        Co-Founder & HR/Mobility Lead
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Renowned travel/tourism expert, HR specialist, and international relocation compliance veteran with
                      extensive operational experience across international consular regulations and statutory mobility.
                    </p>
                    <div className="text-[10px] text-emerald-800 font-semibold mt-2">
                      linkedin.com/in/bernis-doussoh-516b5498
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[11px] text-slate-500">
              <div>
                <span>SabiProfile Inc. • </span>
                <span className="text-emerald-700 font-semibold">https://www.sabiprofile.com</span>
                <span> • investors@sabiprofile.com</span>
              </div>
              <div className="font-medium text-slate-400">
                90:10 GovTech Split Policy • Base L2 Blockchain
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* =========================================================================
          INTERACTIVE SCREEN PRESENTATION MODE
          ========================================================================= */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col no-print">
        {/* Top Control Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-slate-200 hover:text-white transition-colors"
              title="Return to SabiProfile Home"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
                <ShieldCheck className="w-5 h-5 text-slate-950" />
              </div>
              <div className="hidden sm:block">
                <span className="font-poppins font-extrabold text-base tracking-tight text-white block">
                  SabiProfile
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">
                  Investor Pitch Deck
                </span>
              </div>
            </Link>

            <span className="hidden sm:inline-block h-6 w-px bg-slate-800 mx-1" />

            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-semibold text-slate-300">
              <button
                type="button"
                onClick={() => setViewMode("slide")}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  viewMode === "slide"
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                    : "hover:text-white text-slate-400"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Slides</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("dossier")}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  viewMode === "dossier"
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                    : "hover:text-white text-slate-400"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>All Slides</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Speaker Notes Toggle */}
            <button
              type="button"
              onClick={() => setShowNotes((prev) => !prev)}
              className={`text-xs font-semibold px-3 py-2 rounded-lg border transition-all flex items-center gap-1.5 ${
                showNotes
                  ? "bg-slate-800 border-emerald-500/60 text-emerald-400"
                  : "bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
              title="Toggle Founder Speaker Notes (Shortcut: N)"
            >
              {showNotes ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              <span className="hidden md:inline">{showNotes ? "Hide Notes" : "Speaker Notes"}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="text-xs font-semibold px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5"
              title="Toggle Fullscreen (Shortcut: F)"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
            </button>

            {/* PDF Download Button */}
            <button
              type="button"
              onClick={handleTriggerPrint}
              className="text-xs font-bold px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 active:scale-95"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Download PDF</span>
            </button>
          </div>
        </header>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mb-4 border border-slate-800/80">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 ease-out"
            style={{ width: `${((currentSlideIndex + 1) / totalSlides) * 100}%` }}
          />
        </div>

        {/* =====================================================================
            VIEW MODE A: SINGLE SLIDE PRESENTATION CAROUSEL
            ===================================================================== */}
        {viewMode === "slide" && (
          <div className="flex-1 flex flex-col justify-between">
            {/* The Main 16:9 Slide Card */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[520px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800/90 rounded-2xl p-6 sm:p-10 shadow-2xl flex flex-col justify-between overflow-hidden group">
              {/* Subtle Ambient Glow */}
              <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Slide Meta Top Row */}
              <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-3 sm:pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    {currentSlide.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                    {currentSlide.tagline}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-bold text-slate-400 font-mono">
                    SLIDE <span className="text-white font-black">{String(currentSlide.number).padStart(2, "0")}</span> / {String(totalSlides).padStart(2, "0")}
                  </div>
                </div>
              </div>

              {/* Slide Central Body */}
              <div className="relative z-10 my-auto py-4">
                <h2 className="font-poppins text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight max-w-4xl">
                  {currentSlide.headline}
                </h2>

                {currentSlide.subtitle && (
                  <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-slate-300 max-w-3xl leading-relaxed">
                    {currentSlide.subtitle}
                  </p>
                )}

                {/* Visual Type 1: Title Hero */}
                {currentSlide.visualType === "title-hero" && (
                  <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {currentSlide.keyMetrics?.map((metric, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-colors"
                      >
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {metric.label}
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 font-poppins">
                          {metric.value}
                        </div>
                        {metric.detail && (
                          <div className="text-[11px] text-slate-500 mt-0.5">{metric.detail}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Visual Type: Points Grid */}
                {currentSlide.points && currentSlide.visualType !== "team-leadership" && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {currentSlide.points.map((pt, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <h3 className="font-poppins text-xs sm:text-sm font-bold text-white leading-snug">
                              {pt.title}
                            </h3>
                            {pt.tag && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                                {pt.tag}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                            {pt.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Visual Type: Competitive Matrix */}
                {currentSlide.tableData && (
                  <div className="mt-5 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900/90 text-slate-300 border-b border-slate-800">
                          <th className="p-3 font-bold">Feature</th>
                          <th className="p-3 font-semibold text-slate-400">Legacy ATS</th>
                          <th className="p-3 font-semibold text-slate-400">Background Checkers</th>
                          <th className="p-3 font-semibold text-slate-400">Decentralized ID</th>
                          <th className="p-3 font-bold bg-emerald-950/40 text-emerald-400 border-l border-emerald-900/40">
                            SabiProfile
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentSlide.tableData.map((row, i) => (
                          <tr key={i} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-900/50">
                            <td className="p-3 font-bold text-slate-200">{row.Feature}</td>
                            <td className="p-3 text-slate-400">{row["Legacy ATS (Workday/Greenhouse)"]}</td>
                            <td className="p-3 text-slate-400">{row["Background Checkers (Checkr/Sterling)"]}</td>
                            <td className="p-3 text-slate-400">{row["Decentralized Wallets"]}</td>
                            <td className="p-3 font-bold bg-emerald-950/20 text-emerald-400 border-l border-emerald-900/40">
                              {row["SabiProfile"]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Visual Type: Team Leadership */}
                {currentSlide.visualType === "team-leadership" && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Founder & CEO */}
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-500/60 transition-all flex flex-col justify-between shadow-xl">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            Founder & Chief Executive Officer
                          </span>
                          <a
                            href="https://www.linkedin.com/in/uyouko-nathaniel-ekpo-111b69396/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                          >
                            <Linkedin className="w-3.5 h-3.5" />
                            <span>LinkedIn Profile</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <h3 className="font-poppins text-lg sm:text-xl font-black text-white">
                          Uyouko Nathaniel Ekpo
                        </h3>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                          Distributed systems engineer, sovereign data architect, and cryptographic protocol designer.
                          Architected SabiProfile's zero-knowledge storage invariants, Base L2 smart contracts, and
                          autonomous multi-agent AI evaluation pipeline.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Core Specialization: Distributed Systems & Cryptography</span>
                        <span className="text-emerald-400 font-semibold">Lagos & Abuja, Nigeria</span>
                      </div>
                    </div>

                    {/* Co-Founder & Global Mobility / HR Lead */}
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-500/60 transition-all flex flex-col justify-between shadow-xl">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            Co-Founder & Head of Global Mobility & HR
                          </span>
                          <a
                            href="https://www.linkedin.com/in/bernis-doussoh-516b5498/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                          >
                            <Linkedin className="w-3.5 h-3.5" />
                            <span>LinkedIn Profile</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <h3 className="font-poppins text-lg sm:text-xl font-black text-white">
                          Bernis DOUSSOH
                        </h3>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                          Renowned travel/tourism expert, HR specialist, and international relocation compliance veteran with
                          extensive operational experience across cross-border immigration logistics, consular statutory
                          frameworks, and international talent compliance.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Core Specialization: Consular Compliance & Enterprise HR</span>
                        <span className="text-emerald-400 font-semibold">International Mobility Corridors</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Visual Type: Investment Ask */}
                {currentSlide.visualType === "investment-ask" && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
                    {currentSlide.keyMetrics?.map((km, i) => (
                      <div key={i} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {km.label}
                        </div>
                        <div className="text-2xl font-black text-emerald-400 mt-1 font-poppins">{km.value}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{km.detail}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Slide Meta Bottom Row */}
              <div className="relative z-10 pt-3 sm:pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Base L2 Smart Contracts Deployed</span>
                </div>
                <div>
                  <span className="text-slate-500">Confidential Pitch Deck • </span>
                  <span className="text-emerald-400 font-semibold">SabiProfile Protocol</span>
                </div>
              </div>
            </div>

            {/* Presenter Speaker Notes Collapsible Box */}
            {showNotes && (
              <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-xs leading-relaxed text-slate-300 flex items-start gap-3 shadow-lg">
                <Volume2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-400 block mb-1 uppercase tracking-wider text-[10px]">
                    Founder & Presenter Spoken Notes (Slide {currentSlide.number})
                  </span>
                  <p className="italic text-slate-200">{currentSlide.speakerNotes}</p>
                </div>
              </div>
            )}

            {/* Bottom Carousel Navigation Controls */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToPrevSlide}
                  className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={goToNextSlide}
                  className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all flex items-center gap-1.5 text-xs font-extrabold shadow-md shadow-emerald-500/20 active:scale-95"
                >
                  <span>Next Slide</span>
                  <ChevronRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>

              {/* Slide Thumbnail Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
                {PITCH_DECK_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    className={`h-7 px-2.5 rounded-md text-[11px] font-bold font-mono transition-all shrink-0 ${
                      currentSlideIndex === idx
                        ? "bg-emerald-500 text-slate-950 shadow-sm"
                        : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                    }`}
                    title={`Slide ${idx + 1}: ${slide.headline}`}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW MODE B: DOSSIER / ALL SLIDES CONTINUOUS SCROLL
            ===================================================================== */}
        {viewMode === "dossier" && (
          <div className="space-y-6 mt-2">
            {PITCH_DECK_SLIDES.map((slide, idx) => (
              <div
                key={`dossier-${slide.id}`}
                className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {slide.category}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{slide.tagline}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    SLIDE {String(idx + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
                  </span>
                </div>

                <h2 className="font-poppins text-xl sm:text-2xl font-black text-white leading-tight">
                  {slide.headline}
                </h2>
                {slide.subtitle && (
                  <p className="mt-1 text-sm text-slate-400 leading-relaxed max-w-3xl">
                    {slide.subtitle}
                  </p>
                )}

                {slide.keyMetrics && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    {slide.keyMetrics.map((m, i) => (
                      <div key={i} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                        <div className="text-[10px] font-bold uppercase text-slate-400">{m.label}</div>
                        <div className="text-xl font-bold text-emerald-400 mt-1">{m.value}</div>
                        {m.detail && <div className="text-[10px] text-slate-500 mt-0.5">{m.detail}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {slide.points && slide.visualType !== "team-leadership" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                    {slide.points.map((pt, i) => (
                      <div key={i} className="p-3.5 bg-slate-950/50 border border-slate-800 rounded-xl">
                        <div className="text-xs font-bold text-white mb-1">{pt.title}</div>
                        <div className="text-[11px] text-slate-400 leading-relaxed">{pt.description}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Team in dossier mode */}
                {slide.id === "slide-11" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 bg-slate-950/70 border border-emerald-500/30 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-base">Uyouko Nathaniel Ekpo</span>
                        <a
                          href="https://www.linkedin.com/in/uyouko-nathaniel-ekpo-111b69396/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                          <span>LinkedIn</span>
                        </a>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-400 block mb-2">Founder & CEO</span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Distributed systems engineer, sovereign data architect, and cryptographic protocol designer.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-950/70 border border-emerald-500/30 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-base">Bernis DOUSSOH</span>
                        <a
                          href="https://www.linkedin.com/in/bernis-doussoh-516b5498/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                          <span>LinkedIn</span>
                        </a>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-400 block mb-2">
                        Co-Founder & Head of Global Mobility / HR
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Renowned travel/tourism expert, HR specialist, and international relocation compliance veteran.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          PRINT / PDF EXPORT CONFIRMATION MODAL
          ========================================================================= */}
      {printModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Printer className="w-6 h-6 text-emerald-400" />
            </div>

            <h3 className="font-poppins text-lg font-bold text-white">
              Download Investor Pitch Deck PDF
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              When the browser print dialog opens, set the following options for an optimal landscape presentation:
            </p>

            <ul className="mt-3 space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Destination:</strong> Save as PDF</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Layout:</strong> Landscape</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Options:</strong> Check "Background graphics"</span>
              </li>
            </ul>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPrintModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executePrint}
                className="px-5 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
              >
                Open Print & Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
