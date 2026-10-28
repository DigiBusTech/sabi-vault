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
  CheckCircle2,
  ExternalLink,
  Printer,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Lock,
  Globe,
  Database,
  Briefcase,
  GraduationCap,
  Plane,
  Coins,
  Linkedin,
  ShieldAlert,
  Cloud,
  Server,
  Users,
  Mail,
  Zap,
  PieChart,
  ShieldCheck,
  Check,
} from "lucide-react";
import { PITCH_DECK_SLIDES, PitchDeckSlide } from "@/data/pitch_deck_slides";

// Organic fluid ribbon wave matching the Canva presentation
function CanvaWave({ className = "", opacity = 1 }: { className?: string; opacity?: number }) {
  return (
    <svg
      viewBox="0 0 320 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      style={{ opacity }}
    >
      <path
        d="M 30 10 C 130 90, 290 60, 260 180 C 230 290, 70 230, 110 330 C 130 380, 220 370, 270 410"
        stroke="#285C56"
        strokeWidth="24"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Subtle halftone dot matrix corner decoration
function HalftoneDots({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" className={`pointer-events-none select-none opacity-20 ${className}`}>
      <defs>
        <pattern id="dot-pattern" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill="#285C56" />
        </pattern>
      </defs>
      <rect width="160" height="160" fill="url(#dot-pattern)" />
    </svg>
  );
}

// Sunburst radiating circular icon seen on Canva slide 4
function SunburstIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={`text-[#285C56] ${className}`}>
      <circle cx="50" cy="50" r="46" stroke="#285C56" strokeWidth="2" />
      {[0, 30, 60, 90, 120, 150].map((deg) => (
        <line
          key={deg}
          x1="50"
          y1="16"
          x2="50"
          y2="84"
          stroke="#285C56"
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${deg} 50 50)`}
        />
      ))}
    </svg>
  );
}

// Presentation Header on every slide
function SlideHeader({ date = "October 2026" }: { date?: string }) {
  return (
    <div className="flex items-center justify-between w-full px-8 md:px-14 pt-8 pb-3 select-none">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-[#285C56] flex items-center justify-center text-white font-bricolage font-bold text-sm shadow-sm">
          S
        </div>
        <span className="font-bricolage font-bold text-[#285C56] text-lg tracking-tight">SabiProfile</span>
      </div>
      <span className="text-[#3A6E68] font-medium text-xs md:text-sm tracking-wide">{date}</span>
    </div>
  );
}

// Presentation Footer on Cover & Closing slides
function SlideFooter() {
  return (
    <div className="flex items-center justify-between w-full px-8 md:px-14 pb-8 pt-4 text-xs text-[#3A6E68] select-none">
      <div>
        Presented by: <strong className="text-[#285C56]">Uyouko Nathaniel Ekpo &amp; Bernis DOUSSOH</strong>
      </div>
      <div>October 2026</div>
      <div className="font-medium text-[#285C56]">www.sabiprofile.com</div>
    </div>
  );
}

export function PitchDeckViewer() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);
  const [viewMode, setViewMode] = useState<"carousel" | "dossier">("carousel");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSlides = PITCH_DECK_SLIDES.length;
  const currentSlide = PITCH_DECK_SLIDES[currentSlideIndex];

  // Navigation handlers
  const goToNextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  }, [totalSlides]);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const goToSlide = (index: number) => {
    if (index >= 0 && index < totalSlides) {
      setCurrentSlideIndex(index);
      if (viewMode === "dossier") {
        setViewMode("carousel");
      }
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        goToNextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goToPrevSlide();
      } else if (e.key === "Home") {
        e.preventDefault();
        setCurrentSlideIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setCurrentSlideIndex(totalSlides - 1);
      } else if (e.key === "n" || e.key === "N") {
        setShowSpeakerNotes((prev) => !prev);
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextSlide, goToPrevSlide, totalSlides]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleDownloadPdf = () => {
    // If the static PDF file exists in /public, trigger instant download, or trigger window.print
    const link = document.createElement("a");
    link.href = "/SabiProfile_Pitch_Deck.pdf";
    link.download = "SabiProfile_Pitch_Deck.pdf";
    link.click();
    setShowPdfModal(true);
  };

  const handlePrint = () => {
    setShowPdfModal(false);
    window.print();
  };

  // Render individual presentation slide canvas
  const renderSlideContent = (slide: PitchDeckSlide, isThumbnail = false) => {
    switch (slide.visualType) {
      // SLIDE 1: COVER
      case "cover":
        return (
          <div className="relative w-full h-full flex flex-col justify-between bg-[#EFF0EA] overflow-hidden select-none">
            <HalftoneDots className="absolute bottom-0 left-0" />
            <CanvaWave className="absolute -top-12 -right-12 w-80 md:w-96 text-[#285C56]" />
            <SlideHeader date="October 2026" />

            <div className="px-8 md:px-14 my-auto relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
                <div>
                  <h1 className="font-bricolage font-extrabold text-6xl md:text-8xl text-[#285C56] tracking-tight leading-none">
                    Startup
                  </h1>
                  <h2 className="font-bricolage font-light text-4xl md:text-6xl text-[#377272] tracking-tight mt-1">
                    Pitch Deck
                  </h2>
                </div>
                <div className="inline-flex items-center px-6 py-2.5 rounded-full border border-[#285C56] text-[#285C56] text-sm md:text-base font-medium">
                  Business Presentation • Seed Round 2026
                </div>
              </div>
            </div>

            <SlideFooter />
          </div>
        );

      // SLIDE 2: LIST OF CONTENTS
      case "contents":
        return (
          <div className="relative w-full h-full flex flex-col justify-between bg-[#EFF0EA] overflow-hidden select-none">
            <CanvaWave className="absolute -bottom-16 -left-16 w-80 md:w-96 text-[#285C56]" />
            <SlideHeader date="October 2026" />

            <div className="px-8 md:px-14 my-auto relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-5">
                <h2 className="font-bricolage font-extrabold text-5xl md:text-7xl text-[#285C56] tracking-tight leading-[1.1]">
                  List of<br />Contents
                </h2>
              </div>
              <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
                {slide.points?.map((pt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#285C56] text-white font-bricolage font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                      {idx + 1}
                    </div>
                    <span className="font-medium text-[#285C56] text-sm md:text-base tracking-tight">
                      {pt.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-6" />
          </div>
        );

      // SLIDE 3: INTRODUCTION
      case "introduction":
        return (
          <div className="relative w-full h-full flex flex-col justify-between bg-[#EFF0EA] overflow-hidden select-none">
            <HalftoneDots className="absolute top-0 left-0" />
            <HalftoneDots className="absolute bottom-0 right-0" />
            <SlideHeader date="October 2026" />

            <div className="px-8 md:px-14 my-auto relative z-10">
              <h2 className="font-bricolage font-extrabold text-5xl md:text-7xl text-[#285C56] tracking-tight leading-none text-center mb-8">
                Introduction
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-6 flex flex-col gap-4">
                  <div className="p-6 md:p-8 rounded-3xl border border-[#285C56]/70 bg-[#EFF0EA]">
                    <p className="text-[#2D5550] text-sm md:text-base leading-relaxed">
                      {slide.bodyText?.slice(0, 240)}...
                    </p>
                  </div>
                  <p className="text-[#2D5550] text-sm md:text-base leading-relaxed px-2">
                    {slide.bodyText?.slice(241)}
                  </p>
                </div>

                <div className="md:col-span-6">
                  <div className="w-full h-64 md:h-80 rounded-3xl overflow-hidden border border-[#285C56]/40 relative bg-gradient-to-br from-[#285C56] to-[#193E39] p-8 flex flex-col justify-between text-white shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-bricolage font-bold text-lg text-emerald-200">
                        Sovereign Proof Engine
                      </span>
                      <span className="text-xs px-3 py-1 rounded-full bg-white/20">Base L2 Live</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bricolage font-bold mb-2">
                        Mathematical Attestation
                      </p>
                      <p className="text-xs md:text-sm text-emerald-100/90 leading-relaxed">
                        Replacing unverified PDFs with SHA-256 cryptographic hashes verified in under 800 milliseconds.
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-emerald-200">
                      <span>✓ Zero Central Files</span>
                      <span>✓ NDPC &amp; GDPR</span>
                      <span>✓ 90:10 Split</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-6" />
          </div>
        );

      // SLIDE 4: PROBLEM STATEMENT
      case "problem":
        return (
          <div className="relative w-full h-full flex flex-col justify-between bg-[#EFF0EA] overflow-hidden select-none">
            <HalftoneDots className="absolute top-0 left-0" />
            <HalftoneDots className="absolute bottom-0 right-0" />
            <SlideHeader date="October 2026" />

            <div className="px-8 md:px-14 my-auto relative z-10 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="font-bricolage font-extrabold text-5xl md:text-7xl text-[#285C56] tracking-tight leading-[1.05]">
                  Problem<br />Statement
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-[#3A6E68] text-sm md:text-base max-w-xs text-right hidden sm:block">
                    {slide.subtitle}
                  </span>
                  <SunburstIcon className="w-12 h-12" />
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-2">
                {slide.points?.map((prob, idx) => (
                  <div
                    key={idx}
                    className="p-6 md:p-7 rounded-3xl border border-[#285C56]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#EFF0EA]"
                  >
                    <div className="font-bricolage font-bold text-xl md:text-2xl text-[#285C56] shrink-0 sm:w-48">
                      {prob.title.split(":")[0]}
                    </div>
                    <div className="text-[#2D5550] text-sm md:text-base leading-relaxed sm:flex-1">
                      {prob.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-6" />
          </div>
        );

      // SLIDE 5: OUR INNOVATIVE SOLUTIONS
      case "solutions":
        return (
          <div className="relative w-full h-full flex flex-col justify-between bg-[#EFF0EA] overflow-hidden select-none">
            <CanvaWave className="absolute -top-16 -right-16 w-80 md:w-96 text-[#285C56]" />
            <SlideHeader date="October 2026" />

            <div className="px-8 md:px-14 my-auto relative z-10 flex flex-col gap-8">
              <div>
                <h2 className="font-bricolage font-extrabold text-5xl md:text-7xl text-[#285C56] tracking-tight leading-[1.05]">
                  Our Innovative<br />Solutions
                </h2>
                <p className="text-[#3A6E68] text-sm md:text-base mt-3 max-w-xl">
                  {slide.bodyText}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {slide.points?.map((sol, idx) => (
                  <div
                    key={idx}
                    className="p-6 md:p-7 rounded-3xl border border-[#285C56]/80 bg-[#EFF0EA] flex flex-col justify-between h-56 md:h-64"
                  >
                    <div>
                      <h3 className="font-bricolage font-bold text-xl md:text-2xl text-[#285C56] mb-3">
                        {sol.title}
                      </h3>
                      <p className="text-[#2D5550] text-xs md:text-sm leading-relaxed">
                        {sol.description}
                      </p>
                    </div>
                    <div className="text-xs font-semibold text-[#285C56] tracking-wide uppercase pt-2 border-t border-[#285C56]/20">
                      {sol.tag}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-6" />
          </div>
        );

      // SLIDE 6: DISCOVER OUR SERVICES
      case "services":
        return (
          <div className="relative w-full h-full flex flex-col justify-between bg-[#EFF0EA] overflow-hidden select-none">
            <CanvaWave className="absolute -bottom-16 -right-16 w-80 md:w-96 text-[#285C56]" />
            <SlideHeader date="October 2026" />

            <div className="px-8 md:px-14 my-auto relative z-10 flex flex-col gap-8">
              <div>
                <h2 className="font-bricolage font-extrabold text-5xl md:text-7xl text-[#285C56] tracking-tight leading-none mb-3">
                  Discover Our Services
                </h2>
                <p className="text-[#3A6E68] text-sm md:text-base max-w-xl">
                  {slide.bodyText}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {slide.points?.map((srv, idx) => (
                  <div
                    key={idx}
                    className="p-6 md:p-7 rounded-3xl border border-[#285C56]/80 bg-[#EFF0EA] flex flex-col justify-between h-56 md:h-64"
                  >
                    <div>
                      <h3 className="font-bricolage font-bold text-xl md:text-2xl text-[#285C56] mb-3">
                        {srv.title}
                      </h3>
                      <p className="text-[#2D5550] text-xs md:text-sm leading-relaxed">
                        {srv.description}
                      </p>
                    </div>
                    <div className="text-xs font-semibold text-[#285C56] tracking-wide uppercase pt-2 border-t border-[#285C56]/20">
                      {srv.tag}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-6" />
          </div>
        );

      // SLIDE 7: SIZE OF MARKET
      case "market-size":
        return (
          <div className="relative w-full h-full flex flex-col justify-between bg-[#EFF0EA] overflow-hidden select-none">
            <SlideHeader date="October 2026" />

            <div className="px-8 md:px-14 my-auto relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-6 flex flex-col gap-4">
                {slide.keyMetrics?.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-6 md:p-8 rounded-3xl border border-[#285C56]/80 bg-[#EFF0EA] flex items-center justify-between gap-6"
                  >
                    <div className="font-bricolage font-extrabold text-5xl md:text-7xl text-[#285C56] tracking-tight shrink-0">
                      {m.value}
                    </div>
                    <div className="text-[#2D5550] text-xs md:text-sm leading-relaxed text-right">
                      <strong className="block text-sm md:text-base text-[#285C56] font-bricolage mb-1">{m.label}</strong>
                      {m.detail}
                    </div>
                  </div>
                ))}
              </div>

              <div className="md:col-span-6 flex flex-col gap-4">
                <h2 className="font-bricolage font-extrabold text-5xl md:text-7xl text-[#285C56] tracking-tight leading-[1.05]">
                  Size of<br />Market
                </h2>
                <p className="text-[#2D5550] text-sm md:text-base leading-relaxed">
                  {slide.bodyText}
                </p>
                <div className="p-4 rounded-2xl bg-[#285C56]/10 border border-[#285C56]/30 text-[#285C56] text-xs md:text-sm font-medium">
                  <strong>Serviceable Obtainable Market (SOM):</strong> $1.2B focused on UK/Canada/EU student and skilled-worker migration corridors originating from West Africa.
                </div>
              </div>
            </div>

            <div className="h-6" />
          </div>
        );

      // SLIDE 8: DIRECT & INDIRECT COMPETITORS (Canva Template Slide 8 Layout)
      case "competitors":
        return (
          <div className="relative w-full h-full flex flex-col justify-between bg-[#EFF0EA] overflow-hidden select-none">
            <SlideHeader date="October 2026" />

            <div className="px-8 md:px-14 my-auto relative z-10 flex flex-col gap-6">
              {/* Top Half: Indirect Competitors */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-8 flex flex-col gap-3">
                  {slide.indirectCompetitors?.map((comp, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#285C56] mt-1.5 shrink-0" />
                      <div className="text-xs md:text-sm text-[#2D5550] leading-snug">
                        <strong className="text-[#285C56]">{comp.name}:</strong> {comp.description}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="md:col-span-4 text-right">
                  <h2 className="font-bricolage font-extrabold text-4xl md:text-6xl text-[#285C56] tracking-tight leading-tight">
                    Indirect<br />Competitor
                  </h2>
                </div>
              </div>

              {/* Exact Canva Center Horizontal Divider Line */}
              <div className="w-full h-[1.5px] bg-[#285C56]/80 my-2" />

              {/* Bottom Half: Direct Competitors */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-4">
                  <h2 className="font-bricolage font-extrabold text-4xl md:text-6xl text-[#285C56] tracking-tight leading-tight">
                    Direct<br />Competitor
                  </h2>
                </div>
                <div className="md:col-span-8 flex flex-col gap-3">
                  {slide.directCompetitors?.map((comp, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#285C56] mt-1.5 shrink-0" />
                      <div className="text-xs md:text-sm text-[#2D5550] leading-snug">
                        <strong className="text-[#285C56]">{comp.name}:</strong> {comp.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-6" />
          </div>
        );

      // SLIDE 9: KEY COMPETITIVE ADVANTAGES
      case "advantages":
        return (
          <div className="relative w-full h-full flex flex-col justify-between bg-[#EFF0EA] overflow-hidden select-none">
            <SlideHeader date="October 2026" />

            <div className="px-8 md:px-14 my-auto relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Left architectural container */}
              <div className="md:col-span-5">
                <div className="w-full h-72 md:h-84 rounded-tl-[80px] rounded-br-3xl rounded-tr-3xl rounded-bl-3xl border border-[#285C56]/60 bg-gradient-to-br from-[#285C56] to-[#193E39] p-8 flex flex-col justify-between text-white shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                      Zero-Breach Architecture
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bricolage font-bold text-3xl mb-2 text-white">
                      0 Bytes Raw Storage
                    </h3>
                    <p className="text-xs md:text-sm text-emerald-100/90 leading-relaxed">
                      SabiProfile eliminates central database honeypots, keeping files in user cloud storage while verifying cryptographic hashes on Base L2.
                    </p>
                  </div>
                  <div className="text-xs text-emerald-300 font-mono">
                    SHA-256 Verified On-Chain
                  </div>
                </div>
              </div>

              {/* Right content & cards */}
              <div className="md:col-span-7 flex flex-col gap-6">
                <h2 className="font-bricolage font-extrabold text-5xl md:text-7xl text-[#285C56] tracking-tight leading-[1.05]">
                  Key<br />Competitive<br />Advantages
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {slide.advantages?.map((adv, idx) => (
                    <div
                      key={idx}
                      className="p-5 md:p-6 rounded-3xl border border-[#285C56]/80 bg-[#EFF0EA] flex flex-col justify-between h-48 md:h-52"
                    >
                      <div>
                        <h4 className="font-bricolage font-bold text-lg md:text-xl text-[#285C56] mb-2">
                          {adv.title.split(":")[0]}
                        </h4>
                        <p className="text-xs text-[#2D5550] leading-relaxed">
                          {adv.description}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-[#285C56] uppercase tracking-wider pt-2 border-t border-[#285C56]/20">
                        {adv.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-6" />
          </div>
        );

      // SLIDE 10: TRACTION
      case "traction":
        return (
          <div className="relative w-full h-full flex flex-col justify-between bg-[#EFF0EA] overflow-hidden select-none">
            <SlideHeader date="October 2026" />

            <div className="px-8 md:px-14 my-auto relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-5 flex flex-col gap-4">
                <h2 className="font-bricolage font-extrabold text-5xl md:text-7xl text-[#285C56] tracking-tight leading-none">
                  Traction
                </h2>
                <div className="p-6 md:p-7 rounded-3xl border border-[#285C56]/80 bg-[#EFF0EA]">
                  <p className="text-[#2D5550] text-sm md:text-base leading-relaxed mb-4">
                    {slide.bodyText}
                  </p>
                  <div className="flex flex-col gap-2 text-xs md:text-sm font-medium text-[#285C56]">
                    <div>✓ All 88 Next.js 14 App Router routes active</div>
                    <div>✓ Sub-800ms cryptographic verification latency</div>
                    <div>✓ Base L2 smart contract anchoring verified</div>
                  </div>
                </div>
              </div>

              {/* Exact Canva vertical bar chart representation */}
              <div className="md:col-span-7">
                <div className="p-6 md:p-8 rounded-3xl border border-[#285C56]/80 bg-[#EFF0EA] h-72 md:h-84 flex flex-col justify-between">
                  <div className="flex items-center justify-end gap-6 text-xs text-[#285C56] font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#377272]" /> Routes &amp; APIs
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#193E39]" /> Verification Latency
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 items-end h-48 pt-6 border-b border-[#285C56]/20">
                    <div className="flex flex-col items-center gap-2 h-full justify-end">
                      <div className="w-full bg-[#377272] rounded-t-xl h-[40%]" />
                      <span className="text-[10px] md:text-xs text-[#285C56] font-medium">Auth</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 h-full justify-end">
                      <div className="w-full bg-[#193E39] rounded-t-xl h-[65%]" />
                      <span className="text-[10px] md:text-xs text-[#285C56] font-medium">Vault</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 h-full justify-end">
                      <div className="w-full bg-[#377272] rounded-t-xl h-[85%]" />
                      <span className="text-[10px] md:text-xs text-[#285C56] font-medium">Discovery</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 h-full justify-end">
                      <div className="w-full bg-[#193E39] rounded-t-xl h-[100%]" />
                      <span className="text-[10px] md:text-xs text-[#285C56] font-medium">Base L2</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#3A6E68]">
                    <span>Item 1 (Auth)</span>
                    <span>Item 2 (Vault)</span>
                    <span>Item 3 (Discovery)</span>
                    <span>Item 4 (Ledger)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-6" />
          </div>
        );

      // SLIDE 11: ACCOMPLISHMENTS & ROADMAP
      case "roadmap":
        return (
          <div className="relative w-full h-full flex flex-col justify-between bg-[#EFF0EA] overflow-hidden select-none">
            <SlideHeader date="October 2026" />

            <div className="px-8 md:px-14 my-auto relative z-10 flex flex-col gap-8">
              <h2 className="font-bricolage font-extrabold text-5xl md:text-7xl text-[#285C56] tracking-tight leading-none text-center">
                Accomplishments &amp; Roadmap
              </h2>

              {/* Exact Canva Connected Milestones Timeline */}
              <div className="relative pt-6 pb-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  {slide.timeline?.map((item, idx) => {
                    const isCenter = idx === 1;
                    return (
                      <div key={idx} className="flex flex-col items-center text-center">
                        <div
                          className={`w-36 py-2.5 rounded-full font-bricolage font-bold text-lg mb-6 shadow-sm ${
                            isCenter
                              ? "bg-[#285C56] text-white"
                              : "border border-[#285C56] text-[#285C56] bg-[#EFF0EA]"
                          }`}
                        >
                          {item.period}
                        </div>
                        <h4 className="font-bricolage font-bold text-xl text-[#285C56] mb-2">
                          {item.title}
                        </h4>
                        <p className="text-xs md:text-sm text-[#2D5550] leading-relaxed max-w-xs">
                          {item.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="h-6" />
          </div>
        );

      // SLIDE 12: USE OF FUNDS
      case "funds":
        return (
          <div className="relative w-full h-full flex flex-col justify-between bg-[#EFF0EA] overflow-hidden select-none">
            <SlideHeader date="October 2026" />

            <div className="px-8 md:px-14 my-auto relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Left Donut representation matching Canva */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="relative w-64 h-64 md:w-72 md:h-72">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#377272" strokeWidth="24" strokeDasharray="119.38 238.76" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#285C56" strokeWidth="24" strokeDasharray="71.63 238.76" strokeDashoffset="-119.38" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#193E39" strokeWidth="24" strokeDasharray="47.75 238.76" strokeDashoffset="-191.01" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="font-bricolage font-extrabold text-2xl md:text-3xl text-[#285C56]">$1.5M</span>
                    <span className="text-[10px] md:text-xs text-[#3A6E68] font-medium uppercase tracking-wider">Seed Ask</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 text-xs font-medium text-[#285C56] mt-4">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#377272]" /> 50% Eng</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#285C56]" /> 30% Nodes</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#193E39]" /> 20% Legal</span>
                </div>
              </div>

              {/* Right Content */}
              <div className="md:col-span-7 flex flex-col gap-6">
                <h2 className="font-bricolage font-extrabold text-5xl md:text-7xl text-[#285C56] tracking-tight leading-none">
                  Use of Funds
                </h2>

                <div className="p-6 md:p-8 rounded-3xl border border-[#285C56]/80 bg-[#EFF0EA] flex flex-col gap-4">
                  <p className="text-[#2D5550] text-sm md:text-base leading-relaxed">
                    Our $1,500,000 USD Seed round provides 18 months of runway to deploy 25 sovereign regional nodes, scale university and consular pilots, and secure NDPC &amp; GDPR compliance certs.
                  </p>
                  <div className="p-4 rounded-2xl bg-[#285C56]/10 border border-[#285C56]/30 text-xs md:text-sm text-[#285C56]">
                    <strong>Dynamic 90:10 GovTech Split:</strong> $0.90 Platform Treasury / $0.10 Sovereign Node Host creates an incentivized decentralized network with high-margin recurring enterprise SaaS revenue.
                  </div>
                </div>
              </div>
            </div>

            <div className="h-6" />
          </div>
        );

      // SLIDE 13: OUR TEAM
      case "team":
        return (
          <div className="relative w-full h-full flex flex-col justify-between bg-[#EFF0EA] overflow-hidden select-none">
            <CanvaWave className="absolute -bottom-16 -left-16 w-80 md:w-96 text-[#285C56]" />
            <SlideHeader date="October 2026" />

            <div className="px-8 md:px-14 my-auto relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-4 flex flex-col gap-4">
                <h2 className="font-bricolage font-extrabold text-5xl md:text-7xl text-[#285C56] tracking-tight leading-[1.05]">
                  Our<br />Team
                </h2>
                <p className="text-[#2D5550] text-xs md:text-sm leading-relaxed">
                  {slide.bodyText}
                </p>
              </div>

              {/* Exact Canva Team Portrait Cards */}
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {slide.team?.map((member, idx) => (
                  <div
                    key={idx}
                    className="rounded-3xl overflow-hidden border border-[#285C56]/80 bg-[#EFF0EA] flex flex-col shadow-sm"
                  >
                    {/* Top portrait silhouette block */}
                    <div className="h-36 md:h-44 bg-gradient-to-br from-[#A5C2BC] to-[#88ABA4] flex items-center justify-center text-[#285C56] font-bricolage font-bold text-4xl">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>

                    {/* Bottom dark cypress block matching Canva */}
                    <div className="p-5 md:p-6 bg-[#193E39] text-white flex flex-col justify-between flex-1">
                      <div>
                        <h4 className="font-bricolage font-bold text-xl md:text-2xl text-white mb-1">
                          {member.name}
                        </h4>
                        <div className="text-xs md:text-sm text-emerald-300 font-medium mb-3">
                          {member.role}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                          {member.bio}
                        </p>
                      </div>

                      {member.linkedinUrl && (
                        <a
                          href={member.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white mt-4 font-medium transition-colors"
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                          <span>LinkedIn Profile</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-6" />
          </div>
        );

      // SLIDE 14: THANK YOU
      case "thank-you":
        return (
          <div className="relative w-full h-full flex flex-col justify-between bg-[#EFF0EA] overflow-hidden select-none">
            <HalftoneDots className="absolute bottom-0 left-0" />
            <CanvaWave className="absolute -top-12 -right-12 w-80 md:w-96 text-[#285C56]" />
            <SlideHeader date="October 2026" />

            <div className="px-8 md:px-14 my-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h1 className="font-bricolage font-extrabold text-7xl md:text-9xl text-[#285C56] tracking-tight leading-[0.95]">
                  Thank<br />You
                </h1>
              </div>

              <div className="p-8 md:p-10 rounded-3xl border border-[#285C56]/80 bg-[#EFF0EA] flex flex-col gap-4 w-full md:w-auto md:min-w-[340px]">
                <div className="flex items-center gap-4 text-[#285C56]">
                  <div className="w-10 h-10 rounded-full bg-[#285C56] text-white flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-sm md:text-base">invest@sabiprofile.com</span>
                </div>
                <div className="flex items-center gap-4 text-[#285C56]">
                  <div className="w-10 h-10 rounded-full bg-[#285C56] text-white flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-sm md:text-base">www.sabiprofile.com</span>
                </div>
              </div>
            </div>

            <SlideFooter />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-[#F5F7F4] flex flex-col items-center justify-between transition-colors ${
        isFullscreen ? "p-0" : "p-4 md:p-8"
      }`}
    >
      {/* Top Application Bar */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-4 px-2 select-none print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-[#285C56] hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl bg-[#285C56] flex items-center justify-center text-white font-bricolage font-extrabold text-base shadow-sm">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-bricolage font-bold text-[#285C56] text-base leading-none">
                SabiProfile
              </span>
              <span className="text-[10px] text-[#3A6E68] font-medium tracking-wide">
                Pitch Deck • Seed 2026
              </span>
            </div>
          </Link>
        </div>

        {/* View Switchers & Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode((prev) => (prev === "carousel" ? "dossier" : "carousel"))}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#285C56]/40 text-[#285C56] hover:bg-[#285C56]/10 text-xs font-medium transition-colors"
          >
            {viewMode === "carousel" ? (
              <>
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>All Slides</span>
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5" />
                <span>Carousel</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowSpeakerNotes((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-colors ${
              showSpeakerNotes
                ? "bg-[#285C56] text-white border-[#285C56]"
                : "border-[#285C56]/40 text-[#285C56] hover:bg-[#285C56]/10"
            }`}
          >
            <span>Notes</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full border border-[#285C56]/40 text-[#285C56] hover:bg-[#285C56]/10 text-xs transition-colors hidden sm:inline-flex"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#285C56] text-white hover:bg-[#193E39] text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </header>

      {/* Main Presentation Surface */}
      <main className="w-full max-w-6xl mx-auto flex-1 flex flex-col items-center justify-center my-auto">
        {viewMode === "carousel" ? (
          <div className="w-full flex flex-col items-center">
            {/* 16:9 Presentation Slide Canvas */}
            <div className="w-full aspect-[16/9] max-h-[82vh] rounded-3xl shadow-lg border border-[#285C56]/20 overflow-hidden relative bg-[#EFF0EA] flex flex-col">
              {renderSlideContent(currentSlide)}
            </div>

            {/* Slide Navigation Bar */}
            <div className="flex items-center justify-between w-full mt-6 px-4 print:hidden">
              <button
                onClick={goToPrevSlide}
                disabled={currentSlideIndex === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#285C56]/40 text-[#285C56] hover:bg-[#285C56]/10 disabled:opacity-30 disabled:pointer-events-none font-medium text-sm transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-3">
                <span className="font-bricolage font-bold text-[#285C56] text-sm">
                  {String(currentSlideIndex + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
                </span>
                <div className="hidden sm:flex items-center gap-1">
                  {PITCH_DECK_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToSlide(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentSlideIndex
                          ? "w-6 bg-[#285C56]"
                          : "w-1.5 bg-[#285C56]/20 hover:bg-[#285C56]/50"
                      }`}
                      title={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={goToNextSlide}
                disabled={currentSlideIndex === totalSlides - 1}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#285C56] text-white hover:bg-[#193E39] disabled:opacity-30 disabled:pointer-events-none font-medium text-sm transition-colors shadow-sm"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Dossier / All Slides View */
          <div className="w-full flex flex-col gap-10 py-6">
            {PITCH_DECK_SLIDES.map((slide, idx) => (
              <div key={slide.id} className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-2">
                  <span className="font-bricolage font-bold text-[#285C56] text-sm">
                    Slide {String(idx + 1).padStart(2, "0")}: {slide.headline}
                  </span>
                  <button
                    onClick={() => goToSlide(idx)}
                    className="text-xs text-[#3A6E68] hover:text-[#285C56] font-medium"
                  >
                    View in Carousel →
                  </button>
                </div>
                <div className="w-full aspect-[16/9] rounded-3xl shadow-sm border border-[#285C56]/20 overflow-hidden bg-[#EFF0EA]">
                  {renderSlideContent(slide)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Founder Speaker Notes Drawer */}
        {showSpeakerNotes && (
          <div className="w-full mt-6 p-6 rounded-3xl border border-[#285C56]/30 bg-[#EFF0EA] text-[#285C56] shadow-sm print:hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bricolage font-bold text-sm uppercase tracking-wider text-[#377272]">
                Founder Speaker Notes • Slide {currentSlideIndex + 1}
              </span>
              <button
                onClick={() => setShowSpeakerNotes(false)}
                className="text-xs text-[#3A6E68] hover:text-[#285C56]"
              >
                ✕ Close
              </button>
            </div>
            <p className="text-sm md:text-base leading-relaxed text-[#2D5550]">
              {currentSlide.speakerNotes}
            </p>
          </div>
        )}
      </main>

      {/* Printable All Slides Container (For PDF Generation via Print) */}
      <div className="hidden print:block w-full">
        {PITCH_DECK_SLIDES.map((slide) => (
          <div
            key={slide.id}
            className="w-full aspect-[16/9] bg-[#EFF0EA] overflow-hidden page-break-after-always break-after-page mb-8"
            style={{ pageBreakAfter: "always" }}
          >
            {renderSlideContent(slide)}
          </div>
        ))}
      </div>

      {/* PDF Download Instructions Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#EFF0EA] rounded-3xl border border-[#285C56]/40 p-8 max-w-md w-full shadow-2xl flex flex-col gap-6 text-[#285C56]">
            <div>
              <h3 className="font-bricolage font-bold text-2xl text-[#285C56] mb-1">
                Pitch Deck Export
              </h3>
              <p className="text-xs md:text-sm text-[#3A6E68]">
                Your official presentation PDF download has started. You can also print directly to vector landscape format.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/70 border border-[#285C56]/20 text-xs text-[#2D5550] flex flex-col gap-2">
              <div>✓ 14 Standalone 16:9 Presentation Slides</div>
              <div>✓ Direct &amp; Indirect Competitor Analysis</div>
              <div>✓ Executive Leadership Profiles (Uyouko &amp; Bernis)</div>
              <div>✓ Dynamic 90:10 GovTech Revenue Model</div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowPdfModal(false)}
                className="px-5 py-2 rounded-full border border-[#285C56]/40 text-[#285C56] hover:bg-[#285C56]/10 text-xs font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-5 py-2 rounded-full bg-[#285C56] text-white hover:bg-[#193E39] text-xs font-semibold shadow-sm transition-all inline-flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Landscape PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
