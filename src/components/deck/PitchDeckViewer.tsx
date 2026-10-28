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
  ShieldAlert,
  Cloud,
  Key,
  Server,
  Target,
  FileText,
  Landmark,
  Users,
  Mail,
  DollarSign,
  Clock,
  Zap,
  PieChart,
  BrainCircuit,
  Check,
  X,
  Award,
} from "lucide-react";
import { PITCH_DECK_SLIDES, PitchDeckSlide } from "@/data/pitch_deck_slides";

function renderIcon(iconName?: string, className = "w-5 h-5") {
  switch (iconName) {
    case "Plane":
      return <Plane className={className} />;
    case "Briefcase":
      return <Briefcase className={className} />;
    case "ShieldAlert":
      return <ShieldAlert className={className} />;
    case "Cloud":
      return <Cloud className={className} />;
    case "Key":
      return <Key className={className} />;
    case "CheckCircle2":
      return <CheckCircle2 className={className} />;
    case "Lock":
      return <Lock className={className} />;
    case "ShieldCheck":
      return <ShieldCheck className={className} />;
    case "Server":
      return <Server className={className} />;
    case "BrainCircuit":
      return <BrainCircuit className={className} />;
    case "Globe":
      return <Globe className={className} />;
    case "Layers":
      return <Layers className={className} />;
    case "Target":
      return <Target className={className} />;
    case "TrendingUp":
      return <TrendingUp className={className} />;
    case "GraduationCap":
      return <GraduationCap className={className} />;
    case "FileText":
      return <FileText className={className} />;
    case "Sparkles":
      return <Sparkles className={className} />;
    case "Landmark":
      return <Landmark className={className} />;
    case "Coins":
      return <Coins className={className} />;
    case "Building":
      return <Building className={className} />;
    case "Users":
      return <Users className={className} />;
    case "Mail":
      return <Mail className={className} />;
    case "DollarSign":
      return <DollarSign className={className} />;
    case "Clock":
      return <Clock className={className} />;
    case "Database":
      return <Database className={className} />;
    case "Zap":
      return <Zap className={className} />;
    case "PieChart":
      return <PieChart className={className} />;
    case "Cpu":
      return <Cpu className={className} />;
    default:
      return <ShieldCheck className={className} />;
  }
}

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
      className={`w-full min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-montserrat select-none ${
        isFullscreen ? "p-0" : "py-6 sm:py-8 px-3 sm:px-6 lg:px-8"
      }`}
    >
      {/* =========================================================================
          PRINT STYLESHEET: CLEAN WHITE VECTOR PRESENTATION
          ========================================================================= */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page {
              size: landscape;
              margin: 10mm;
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
              min-height: 96vh;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding: 28px 36px;
              box-sizing: border-box;
              border: 1px solid #e2e8f0;
              margin-bottom: 24px;
              background: #ffffff !important;
              border-radius: 16px;
            }
          }
        `,
        }}
      />

      {/* =========================================================================
          PRINT-ONLY DECK (Hidden on screen, rendered on window.print)
          ========================================================================= */}
      <div className="hidden print:block print:w-full print:bg-white print:text-slate-900">
        {PITCH_DECK_SLIDES.map((slide) => (
          <div key={`print-${slide.id}`} className="print-page-break">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-base font-extrabold tracking-tight text-slate-900 font-poppins">
                    SabiProfile
                  </div>
                  <div className="text-xs text-emerald-700 font-bold uppercase tracking-wider">
                    {slide.category} • Sovereign Identity Protocol
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-800 font-mono">
                  SLIDE {String(slide.number).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
                </span>
                <div className="text-[10px] text-slate-400 font-semibold">Base L2 Cryptographic Ledger</div>
              </div>
            </div>

            {/* Content Body */}
            <div className="my-auto py-6">
              <span className="text-xs font-black tracking-widest uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                {slide.tagline}
              </span>
              <h1 className="font-poppins text-2xl font-black text-slate-900 mt-2 mb-2 leading-tight max-w-4xl">
                {slide.headline}
              </h1>
              {slide.subtitle && (
                <p className="text-xs text-slate-600 max-w-3xl mb-6 leading-relaxed">
                  {slide.subtitle}
                </p>
              )}

              {/* Metrics */}
              {slide.keyMetrics && (
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {slide.keyMetrics.map((m, i) => (
                    <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="text-[10px] font-bold uppercase text-slate-500">{m.label}</div>
                      <div className="text-2xl font-black text-emerald-700 mt-1 font-poppins">{m.value}</div>
                      {m.detail && <div className="text-[10px] text-slate-400 mt-0.5">{m.detail}</div>}
                    </div>
                  ))}
                </div>
              )}

              {/* Points */}
              {slide.points && (
                <div className="grid grid-cols-2 gap-4">
                  {slide.points.map((pt, i) => (
                    <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="text-sm font-bold text-slate-900 mb-1">{pt.title}</div>
                      <div className="text-xs text-slate-600 leading-relaxed">{pt.description}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Matrix Table */}
              {slide.tableData && (
                <div className="overflow-hidden border border-slate-200 rounded-xl mt-3">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 border-b border-slate-200">
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
                          <td className="p-2 font-bold text-slate-800">{row.Feature}</td>
                          <td className="p-2 text-slate-500">{row["Legacy ATS (Workday/Greenhouse)"]}</td>
                          <td className="p-2 text-slate-500">{row["Background Checkers (Checkr/Sterling)"]}</td>
                          <td className="p-2 text-slate-500">{row["Decentralized Wallets"]}</td>
                          <td className="p-2 font-black bg-emerald-50 text-emerald-700">{row["SabiProfile"]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Team Slide Layout */}
              {slide.id === "slide-11" && (
                <div className="grid grid-cols-2 gap-6 mt-4">
                  <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Founder & Chief Executive Officer
                    </div>
                    <div className="text-lg font-black text-slate-900 font-poppins mt-1">
                      Uyouko Nathaniel Ekpo
                    </div>
                    <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                      Distributed systems engineer, sovereign data architect, and cryptographic protocol designer.
                      Architect of SabiProfile's zero-knowledge storage invariants, Base L2 smart contracts, and
                      multi-agent AI pipeline.
                    </p>
                    <div className="text-[11px] font-bold text-emerald-700 mt-2">
                      linkedin.com/in/uyouko-nathaniel-ekpo-111b69396
                    </div>
                  </div>

                  <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Co-Founder & Head of Global Mobility / HR
                    </div>
                    <div className="text-lg font-black text-slate-900 font-poppins mt-1">
                      Bernis DOUSSOH
                    </div>
                    <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                      Renowned travel/tourism expert, HR specialist, and international relocation compliance veteran with
                      extensive operational experience across international consular regulations and statutory mobility.
                    </p>
                    <div className="text-[11px] font-bold text-emerald-700 mt-2">
                      linkedin.com/in/bernis-doussoh-516b5498
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-xs text-slate-500">
              <div>
                <strong className="text-slate-800">SabiProfile Inc.</strong> • https://www.sabiprofile.com • investors@sabiprofile.com
              </div>
              <div>90:10 GovTech Split Policy • Base L2 Blockchain</div>
            </div>
          </div>
        ))}
      </div>

      {/* =========================================================================
          INTERACTIVE SCREEN PRESENTATION MODE (Clean Modern White & Emerald)
          ========================================================================= */}
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col no-print">
        {/* Top Control Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-slate-800 hover:text-slate-950 transition-colors"
              title="Return to SabiProfile Home"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-poppins font-extrabold text-base tracking-tight text-slate-900 block leading-tight">
                  SabiProfile
                </span>
                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                  Seed Pitch Deck
                </span>
              </div>
            </Link>

            <span className="hidden sm:inline-block h-6 w-px bg-slate-300 mx-1" />

            {/* Mode Switcher */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 shadow-sm rounded-lg p-1 text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setViewMode("slide")}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                  viewMode === "slide"
                    ? "bg-emerald-600 text-white font-bold shadow-sm"
                    : "hover:text-slate-900 text-slate-600"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Slides</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("dossier")}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                  viewMode === "dossier"
                    ? "bg-emerald-600 text-white font-bold shadow-sm"
                    : "hover:text-slate-900 text-slate-600"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>All Slides</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notes Toggle */}
            <button
              type="button"
              onClick={() => setShowNotes((prev) => !prev)}
              className={`text-xs font-semibold px-3 py-2 rounded-lg border transition-all flex items-center gap-1.5 ${
                showNotes
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
              }`}
              title="Toggle Founder Speaker Notes (Shortcut: N)"
            >
              {showNotes ? <Volume2 className="w-3.5 h-3.5 text-emerald-700" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
              <span className="hidden sm:inline">{showNotes ? "Hide Notes" : "Speaker Notes"}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="text-xs font-semibold px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-all flex items-center gap-1.5"
              title="Toggle Fullscreen (Shortcut: F)"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
            </button>

            {/* PDF Download Button */}
            <button
              type="button"
              onClick={handleTriggerPrint}
              className="text-xs font-bold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-600/25 flex items-center gap-2 active:scale-95"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Download PDF</span>
            </button>
          </div>
        </header>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-300 ease-out"
            style={{ width: `${((currentSlideIndex + 1) / totalSlides) * 100}%` }}
          />
        </div>

        {/* =====================================================================
            VIEW MODE A: SINGLE SLIDE PRESENTATION CAROUSEL (WHITE & EMERALD)
            ===================================================================== */}
        {viewMode === "slide" && (
          <div className="flex-1 flex flex-col justify-between">
            {/* The Main Slide Card (Clean White Canvas) */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[540px] bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(15,23,42,0.06)] flex flex-col justify-between overflow-hidden">
              {/* Slide Meta Top Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
                    {currentSlide.category}
                  </span>
                  <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                    {currentSlide.tagline}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    SLIDE <strong className="text-slate-900 font-black">{String(currentSlide.number).padStart(2, "0")}</strong> / {String(totalSlides).padStart(2, "0")}
                  </span>
                </div>
              </div>

              {/* Slide Body */}
              <div className="my-auto py-4">
                {/* SLIDE 1: SPECIAL BRANDING COVER HERO */}
                {currentSlide.visualType === "title-hero" ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3.5 mb-2">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
                        <ShieldCheck className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="font-poppins text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                          SabiProfile
                        </div>
                        <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                          Sovereign Identity Protocol
                        </div>
                      </div>
                    </div>

                    <h1 className="font-poppins text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight max-w-4xl">
                      {currentSlide.headline}
                    </h1>

                    <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
                      {currentSlide.subtitle}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
                      {currentSlide.keyMetrics?.map((m, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-500/50 hover:bg-emerald-50/20 transition-all shadow-sm"
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 mb-2">
                            {renderIcon(m.icon, "w-4 h-4 text-emerald-700")}
                          </div>
                          <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                            {m.label}
                          </div>
                          <div className="text-2xl font-black text-emerald-700 font-poppins mt-0.5">
                            {m.value}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 font-medium">{m.detail}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* STANDARD SLIDE HEADLINE */}
                    <h2 className="font-poppins text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 leading-tight max-w-4xl">
                      {currentSlide.headline}
                    </h2>

                    {currentSlide.subtitle && (
                      <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-600 max-w-3xl leading-relaxed">
                        {currentSlide.subtitle}
                      </p>
                    )}

                    {/* SLIDE 2: THE PROBLEM (CARDS WITH ALERT ICONS) */}
                    {currentSlide.visualType === "tri-sector-problem" && currentSlide.points && (
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {currentSlide.points.map((pt, i) => (
                          <div
                            key={i}
                            className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 hover:bg-amber-50/20 transition-all flex flex-col justify-between shadow-sm"
                          >
                            <div>
                              <div className="w-10 h-10 rounded-xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-800 mb-3">
                                {renderIcon(pt.icon, "w-5 h-5 text-amber-700")}
                              </div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 px-2 py-0.5 rounded bg-amber-100 inline-block mb-1.5">
                                {pt.tag}
                              </span>
                              <h3 className="font-poppins text-base font-bold text-slate-900 mb-2">
                                {pt.title}
                              </h3>
                              <p className="text-xs text-slate-600 leading-relaxed">{pt.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* SLIDE 3: THE SOLUTION (3-STEP PROCESS FLOW) */}
                    {currentSlide.visualType === "solution-flow" && currentSlide.points && (
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                        {currentSlide.points.map((pt, i) => (
                          <div
                            key={i}
                            className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/90 hover:border-emerald-400 transition-all shadow-sm flex flex-col justify-between"
                          >
                            <div>
                              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white mb-3 shadow-md shadow-emerald-600/20">
                                {renderIcon(pt.icon, "w-5 h-5 text-white")}
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 px-2 py-0.5 rounded bg-emerald-100 inline-block mb-1.5">
                                {pt.tag}
                              </span>
                              <h3 className="font-poppins text-base font-bold text-slate-900 mb-2">
                                {pt.title}
                              </h3>
                              <p className="text-xs text-slate-600 leading-relaxed">{pt.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* SLIDE 4: ARCHITECTURAL INVARIANTS (2X2 GRID) */}
                    {currentSlide.visualType === "architecture-invariants" && currentSlide.points && (
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentSlide.points.map((pt, i) => (
                          <div
                            key={i}
                            className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex items-start gap-3.5 shadow-sm"
                          >
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                              {renderIcon(pt.icon, "w-5 h-5 text-emerald-700")}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-poppins text-sm font-bold text-slate-900">{pt.title}</h3>
                                {pt.tag && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                    {pt.tag}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">{pt.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* SLIDE 5: MARKET SIZING (TAM/SAM/SOM + METRICS) */}
                    {currentSlide.visualType === "market-sizing" && (
                      <div className="mt-6 space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                          {currentSlide.keyMetrics?.map((m, i) => (
                            <div
                              key={i}
                              className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 shadow-sm"
                            >
                              <div className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">
                                {m.label}
                              </div>
                              <div className="text-2xl font-black text-emerald-700 font-poppins mt-1">
                                {m.value}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5 font-medium">{m.detail}</div>
                            </div>
                          ))}
                        </div>

                        {currentSlide.points && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {currentSlide.points.map((pt, i) => (
                              <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                                <div className="flex items-center gap-2 mb-1 text-xs font-bold text-slate-900">
                                  {renderIcon(pt.icon, "w-4 h-4 text-emerald-700")}
                                  <span>{pt.title}</span>
                                </div>
                                <p className="text-[11px] text-slate-600 leading-relaxed">{pt.description}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SLIDE 6: MULTI-AGENT DISCOVERY (PIPELINE) */}
                    {currentSlide.visualType === "multi-agent-discovery" && currentSlide.points && (
                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {currentSlide.points.map((pt, i) => (
                          <div
                            key={i}
                            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all shadow-sm flex flex-col justify-between"
                          >
                            <div>
                              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 mb-2.5">
                                {renderIcon(pt.icon, "w-5 h-5 text-emerald-700")}
                              </div>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block mb-1.5">
                                {pt.tag}
                              </span>
                              <h3 className="font-poppins text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                                {pt.title}
                              </h3>
                              <p className="text-[11px] text-slate-600 leading-relaxed">{pt.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* SLIDE 7: BUSINESS MODEL (90:10 REVENUE SPLIT) */}
                    {currentSlide.visualType === "business-model" && (
                      <div className="mt-6 space-y-4">
                        {/* 90:10 Revenue Split Highlight Card */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 shrink-0">
                              <Coins className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-800">
                                On-Chain GovTech Micro-Transaction
                              </div>
                              <div className="text-lg font-black text-slate-900 font-poppins">
                                90 : 10 Configurable Revenue Split ($1.00 / Query)
                              </div>
                              <div className="text-xs text-slate-600">
                                90% ($0.90) to SabiProfile Treasury • 10% ($0.10) to Sovereign Regional Node Host
                              </div>
                            </div>
                          </div>
                          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white border border-emerald-300 text-emerald-800 shadow-sm shrink-0">
                            Dynamic Admin Engine
                          </span>
                        </div>

                        {currentSlide.points && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {currentSlide.points.map((pt, i) => (
                              <div
                                key={i}
                                className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between"
                              >
                                <div>
                                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 mb-2">
                                    {renderIcon(pt.icon, "w-4 h-4 text-emerald-700")}
                                  </div>
                                  <div className="text-xs font-bold text-slate-900 mb-1">{pt.title}</div>
                                  <div className="text-[11px] text-slate-600 leading-relaxed">
                                    {pt.description}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SLIDE 8: TRACTION & PROOF */}
                    {currentSlide.visualType === "traction-milestones" && (
                      <div className="mt-6 space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                          {currentSlide.keyMetrics?.map((m, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 mb-1.5">
                                {renderIcon(m.icon, "w-4 h-4 text-emerald-700")}
                              </div>
                              <div className="text-[10px] font-bold uppercase text-slate-500">{m.label}</div>
                              <div className="text-2xl font-black text-emerald-700 font-poppins mt-0.5">
                                {m.value}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5 font-medium">{m.detail}</div>
                            </div>
                          ))}
                        </div>

                        {currentSlide.points && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {currentSlide.points.map((pt, i) => (
                              <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                                <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  <span>{pt.title}</span>
                                </div>
                                <p className="text-[11px] text-slate-600 leading-relaxed">{pt.description}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SLIDE 9: COMPETITIVE MATRIX TABLE */}
                    {currentSlide.tableData && (
                      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100 text-slate-800 border-b border-slate-200">
                              <th className="p-3 font-bold">Feature</th>
                              <th className="p-3 font-semibold text-slate-600">Legacy ATS</th>
                              <th className="p-3 font-semibold text-slate-600">Background Checkers</th>
                              <th className="p-3 font-semibold text-slate-600">Decentralized ID</th>
                              <th className="p-3 font-black bg-emerald-100/70 text-emerald-900 border-l border-emerald-300">
                                SabiProfile
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentSlide.tableData.map((row, i) => (
                              <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                                <td className="p-3 font-bold text-slate-900">{row.Feature}</td>
                                <td className="p-3 text-slate-500">{row["Legacy ATS (Workday/Greenhouse)"]}</td>
                                <td className="p-3 text-slate-500">{row["Background Checkers (Checkr/Sterling)"]}</td>
                                <td className="p-3 text-slate-500">{row["Decentralized Wallets"]}</td>
                                <td className="p-3 font-black bg-emerald-50/60 text-emerald-700 border-l border-emerald-200">
                                  {row["SabiProfile"]}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* SLIDE 10: GROWTH FLYWHEEL */}
                    {currentSlide.visualType === "growth-flywheel" && currentSlide.points && (
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {currentSlide.points.map((pt, i) => (
                          <div
                            key={i}
                            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all shadow-sm flex flex-col justify-between"
                          >
                            <div>
                              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 mb-3">
                                {renderIcon(pt.icon, "w-5 h-5 text-emerald-700")}
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 inline-block mb-1.5">
                                {pt.tag}
                              </span>
                              <h3 className="font-poppins text-base font-bold text-slate-900 mb-2">
                                {pt.title}
                              </h3>
                              <p className="text-xs text-slate-600 leading-relaxed">{pt.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* SLIDE 11: LEADERSHIP TEAM */}
                    {currentSlide.visualType === "team-leadership" && (
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Uyouko Nathaniel Ekpo */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-emerald-50/30 border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition-all shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-14 h-14 rounded-2xl bg-emerald-700 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-700/20">
                                UE
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                                Founder & CEO
                              </span>
                            </div>
                            <h3 className="font-poppins text-xl font-black text-slate-900">
                              Uyouko Nathaniel Ekpo
                            </h3>
                            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                              Distributed systems engineer, sovereign data architect, and cryptographic protocol designer.
                              Architect of SabiProfile's zero-knowledge storage invariants, Base L2 smart contracts, and
                              autonomous multi-agent AI evaluation pipeline.
                            </p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500">
                              Lagos & Abuja, Nigeria
                            </span>
                            <a
                              href="https://www.linkedin.com/in/uyouko-nathaniel-ekpo-111b69396/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all"
                            >
                              <Linkedin className="w-3.5 h-3.5" />
                              <span>LinkedIn</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>

                        {/* Bernis DOUSSOH */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-emerald-50/30 border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition-all shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-14 h-14 rounded-2xl bg-teal-700 flex items-center justify-center text-white font-black text-xl shadow-md shadow-teal-700/20">
                                BD
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                                Co-Founder & Mobility Lead
                              </span>
                            </div>
                            <h3 className="font-poppins text-xl font-black text-slate-900">
                              Bernis DOUSSOH
                            </h3>
                            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                              Renowned travel/tourism expert, HR specialist, and international relocation compliance veteran with
                              extensive operational experience across cross-border immigration logistics, consular statutory
                              frameworks, and international talent compliance.
                            </p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500">
                              Cross-Border Mobility Corridors
                            </span>
                            <a
                              href="https://www.linkedin.com/in/bernis-doussoh-516b5498/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all"
                            >
                              <Linkedin className="w-3.5 h-3.5" />
                              <span>LinkedIn</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SLIDE 12: THE ASK & CAPITAL ALLOCATION */}
                    {currentSlide.visualType === "investment-ask" && (
                      <div className="mt-6 space-y-4">
                        <div className="p-5 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div>
                            <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-200">
                              Seed Round Financing
                            </div>
                            <div className="text-3xl sm:text-4xl font-black font-poppins mt-0.5">
                              $1,500,000 USD
                            </div>
                            <div className="text-xs text-emerald-100 mt-1">
                              18 Months Operational Runway • Target $1.2M ARR Run-Rate
                            </div>
                          </div>
                          <a
                            href="mailto:investors@sabiprofile.com"
                            className="px-5 py-2.5 rounded-xl bg-white text-emerald-900 font-extrabold text-xs hover:bg-slate-100 transition-all shadow-md shrink-0 flex items-center gap-1.5"
                          >
                            <span>Contact Founders</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        {currentSlide.points && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {currentSlide.points.map((pt, i) => (
                              <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-2">
                                  {renderIcon(pt.icon, "w-4 h-4 text-emerald-700")}
                                  <span>{pt.title}</span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">{pt.description}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Slide Meta Bottom Bar */}
              <div className="pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="font-semibold text-slate-700">Base L2 Blockchain Anchored</span>
                </div>
                <div>
                  <span className="text-slate-400">Confidential Pitch Deck • </span>
                  <span className="text-emerald-700 font-bold">SabiProfile Inc.</span>
                </div>
              </div>
            </div>

            {/* Presenter Speaker Notes Collapsible Panel */}
            {showNotes && (
              <div className="mt-4 p-4 rounded-2xl bg-white border border-emerald-300 text-xs leading-relaxed text-slate-700 flex items-start gap-3 shadow-md">
                <Volume2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-900 block mb-1 uppercase tracking-wider text-[10px]">
                    Founder Speaker Notes (Slide {currentSlide.number})
                  </span>
                  <p className="italic text-slate-800">{currentSlide.speakerNotes}</p>
                </div>
              </div>
            )}

            {/* Bottom Slide Navigation Bar */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToPrevSlide}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={goToNextSlide}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 text-xs font-extrabold shadow-md shadow-emerald-600/20 active:scale-95"
                >
                  <span>Next Slide</span>
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Thumbnails list */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
                {PITCH_DECK_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    className={`h-8 px-3 rounded-lg text-xs font-bold font-mono transition-all shrink-0 ${
                      currentSlideIndex === idx
                        ? "bg-emerald-600 text-white shadow-sm font-black"
                        : "bg-white text-slate-600 hover:text-slate-950 hover:bg-slate-50 border border-slate-200 shadow-sm"
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
            VIEW MODE B: DOSSIER / ALL SLIDES (CONTINUOUS SCROLL WHITE MODE)
            ===================================================================== */}
        {viewMode === "dossier" && (
          <div className="space-y-6 mt-2">
            {PITCH_DECK_SLIDES.map((slide, idx) => (
              <div
                key={`dossier-${slide.id}`}
                className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {slide.category}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">{slide.tagline}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    SLIDE {String(idx + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
                  </span>
                </div>

                <h2 className="font-poppins text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {slide.headline}
                </h2>
                {slide.subtitle && (
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed max-w-3xl">
                    {slide.subtitle}
                  </p>
                )}

                {slide.keyMetrics && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    {slide.keyMetrics.map((m, i) => (
                      <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="text-[10px] font-bold uppercase text-slate-500">{m.label}</div>
                        <div className="text-xl font-bold text-emerald-700 mt-1">{m.value}</div>
                        {m.detail && <div className="text-[10px] text-slate-400 mt-0.5">{m.detail}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {slide.points && slide.visualType !== "team-leadership" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                    {slide.points.map((pt, i) => (
                      <div key={i} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
                        <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                          {renderIcon(pt.icon, "w-4 h-4 text-emerald-700")}
                          <span>{pt.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 leading-relaxed">{pt.description}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Team in dossier mode */}
                {slide.id === "slide-11" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 text-base">Uyouko Nathaniel Ekpo</span>
                        <a
                          href="https://www.linkedin.com/in/uyouko-nathaniel-ekpo-111b69396/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-bold"
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                          <span>LinkedIn</span>
                        </a>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-800 block mb-2">Founder & CEO</span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Distributed systems engineer, sovereign data architect, and cryptographic protocol designer.
                      </p>
                    </div>

                    <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 text-base">Bernis DOUSSOH</span>
                        <a
                          href="https://www.linkedin.com/in/bernis-doussoh-516b5498/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-bold"
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                          <span>LinkedIn</span>
                        </a>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-800 block mb-2">
                        Co-Founder & Head of Global Mobility / HR
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl text-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-4">
              <Printer className="w-6 h-6 text-emerald-700" />
            </div>

            <h3 className="font-poppins text-lg font-bold text-slate-900">
              Download Investor Pitch Deck PDF
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              When your browser print dialog opens, select the following settings for a crisp, high-resolution landscape presentation:
            </p>

            <ul className="mt-3 space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Destination:</strong> Save as PDF</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Layout:</strong> Landscape</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Options:</strong> Enable "Background graphics"</span>
              </li>
            </ul>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPrintModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executePrint}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
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
