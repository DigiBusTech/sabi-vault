"use client";

import React, { useState } from "react";
import {
  Shield,
  Key,
  Database,
  Copy,
  Check,
  Wifi,
  Battery,
  ScanFace,
  Cloud,
} from "lucide-react";
import {
  LockAnimated,
  CheckCircle2Animated,
  SparklesAnimated,
  FileCheckAnimated,
  WalletAnimated,
  GraduationCapAnimated,
  BriefcaseAnimated,
  AwardAnimated,
  Globe2Animated,
} from "@/components/ui/animated-icons";
import { VaultCategory } from "@/types/vault";

export type DeviceFinish = "space-black" | "silver" | "emerald";

interface IPhone14MockupProps {
  finish?: DeviceFinish;
  scale?: number;
  initialTab?: "vault" | "mint" | "cloud" | "ledger";
  onKeyMinted?: (key: string) => void;
}

export function IPhone14Mockup({
  finish = "space-black",
  scale = 1,
  initialTab = "vault",
  onKeyMinted,
}: IPhone14MockupProps) {
  // Mobile Internal Navigation
  const [activeTab, setActiveTab] = useState<"vault" | "mint" | "cloud" | "ledger">(initialTab);
  const [deviceColor, setDeviceColor] = useState<DeviceFinish>(finish);
  const [isDynamicIslandExpanded, setIsDynamicIslandExpanded] = useState<boolean>(false);
  const [islandState, setIslandState] = useState<"idle" | "syncing" | "minted" | "faceid">("idle");

  // Category selection inside phone
  const [selectedCategory, setSelectedCategory] = useState<VaultCategory>("academics");

  // Scoped Key Minting State
  const [selectedScopes, setSelectedScopes] = useState<VaultCategory[]>(["academics", "finance"]);
  const [ttlDays, setTtlDays] = useState<number>(14);
  const [recipient, setRecipient] = useState<string>("Canadian High Commission");
  const [mintedKey, setMintedKey] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // 6 Verified Domains using strict 3-color palette
  const categories: {
    id: VaultCategory;
    label: string;
    icon: any;
    count: number;
    highlight: string;
    tier: string;
  }[] = [
    {
      id: "academics",
      label: "Academics",
      icon: GraduationCapAnimated,
      count: 2,
      highlight: "BSc Computer Engineering (First Class)",
      tier: "Tier 2 Notarized",
    },
    {
      id: "finance",
      label: "Finance",
      icon: WalletAnimated,
      count: 2,
      highlight: "Zenith Bank ₦8.75M Liquid Balance",
      tier: "Tier 1 Hashed",
    },
    {
      id: "experience",
      label: "Experience",
      icon: BriefcaseAnimated,
      count: 3,
      highlight: "Senior Systems Engineer • Paystack/Stripe",
      tier: "Tier 1 Hashed",
    },
    {
      id: "certifications",
      label: "Certifications",
      icon: FileCheckAnimated,
      count: 4,
      highlight: "AWS Certified Solutions Architect Pro",
      tier: "Tier 2 Notarized",
    },
    {
      id: "portfolio",
      label: "Portfolio",
      icon: Globe2Animated,
      count: 2,
      highlight: "Verified GitHub & Core Architecture repos",
      tier: "Tier 1 Hashed",
    },
    {
      id: "achievements",
      label: "Achievements",
      icon: AwardAnimated,
      count: 1,
      highlight: "ECOWAS FinTech Innovation Award 2026",
      tier: "Tier 2 Notarized",
    },
  ];

  // Handle Simulated Mobile Key Minting
  const handleMintScopedKey = () => {
    setIsMinting(true);
    setIslandState("faceid");
    setIsDynamicIslandExpanded(true);

    setTimeout(() => {
      const randomKey = `sb_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      setMintedKey(randomKey);
      setIsMinting(false);
      setIslandState("minted");
      if (onKeyMinted) {
        onKeyMinted(randomKey);
      }

      setTimeout(() => {
        setIsDynamicIslandExpanded(false);
        setIslandState("idle");
      }, 4000);
    }, 1400);
  };

  const handleCopy = () => {
    if (mintedKey) {
      navigator.clipboard.writeText(mintedKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center select-none font-sans" style={{ transform: `scale(${scale})` }}>
      {/* 3-Color Device Chassis Color Selector */}
      <div className="flex items-center gap-2 mb-4 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-xs font-montserrat">
        <span className="text-slate-500 font-medium mr-1">Chassis:</span>
        <button
          onClick={() => setDeviceColor("space-black")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all ${
            deviceColor === "space-black"
              ? "bg-[#0f172a] text-white border-[#0f172a]"
              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#0f172a]" />
          <span>Space Black</span>
        </button>
        <button
          onClick={() => setDeviceColor("silver")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all ${
            deviceColor === "silver"
              ? "bg-[#0f172a] text-white border-[#0f172a]"
              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400" />
          <span>Pure Silver</span>
        </button>
        <button
          onClick={() => setDeviceColor("emerald")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all ${
            deviceColor === "emerald"
              ? "bg-[#059669] text-white border-[#059669]"
              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
          <span>Sabi Emerald</span>
        </button>
      </div>

      {/* iPhone 14 Pro Physical Chassis Outer Container */}
      <div className={`iphone-chassis device-${deviceColor} w-[370px] h-[755px] p-[10px] relative`}>
        {/* Physical Edge Buttons */}
        <div className="iphone-button-silent iphone-btn" />
        <div className="iphone-button-vol-up iphone-btn" />
        <div className="iphone-button-vol-down iphone-btn" />
        <div className="iphone-button-power iphone-btn" />

        {/* Inner OLED Display Area */}
        <div className="iphone-screen-bezel w-full h-full bg-[#0f172a] text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Specular Glare */}
          <div
            className="absolute inset-0 pointer-events-none z-40 opacity-25"
            style={{
              background:
                "linear-gradient(125deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 30%, transparent 45%)",
            }}
          />

          {/* iOS Status Bar & Dynamic Island */}
          <div className="pt-3 px-6 flex justify-between items-center text-[12px] font-semibold text-white z-30 font-montserrat">
            <span>9:41</span>

            {/* Apple Dynamic Island */}
            <div
              onClick={() => setIsDynamicIslandExpanded(!isDynamicIslandExpanded)}
              className={`bg-black cursor-pointer text-white flex items-center justify-between transition-all duration-300 ease-out z-50 border border-white/10 ${
                isDynamicIslandExpanded
                  ? "w-[300px] h-[58px] rounded-[24px] px-4 py-2 shadow-2xl"
                  : "w-[110px] h-[30px] rounded-full px-3 py-1 shadow-lg"
              }`}
            >
              {isDynamicIslandExpanded ? (
                <div className="w-full flex items-center justify-between font-montserrat">
                  {islandState === "faceid" ? (
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 bg-[#059669]/20 rounded-xl text-[#059669] animate-pulse">
                        <ScanFace size={18} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[11px] font-bold text-white font-poppins">Biometric Attestation</p>
                        <p className="text-[9px] text-[#059669]">Minting Scoped Key...</p>
                      </div>
                    </div>
                  ) : islandState === "minted" ? (
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 bg-[#059669]/20 rounded-xl text-[#059669]">
                        <Check size={18} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[11px] font-bold text-white font-poppins">Key Anchored on Base L2</p>
                        <p className="text-[9px] text-slate-400">{ttlDays} Days TTL • Scoped</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 bg-[#059669]/20 rounded-xl text-[#059669] animate-pulse">
                        <Database size={18} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[11px] font-bold text-white font-poppins">Sovereign Node Sync</p>
                        <p className="text-[9px] text-[#059669]">14 Verified Hashes Intact</p>
                      </div>
                    </div>
                  )}
                  <span className="w-2 h-2 rounded-full bg-[#059669] animate-ping" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1e293b]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                  </div>
                  <span className="text-[10px] text-slate-300 font-poppins font-bold tracking-tight">Sabi</span>
                </>
              )}
            </div>

            {/* Status Icons */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-montserrat">5G</span>
              <Wifi size={13} strokeWidth={2.4} />
              <Battery size={15} strokeWidth={2.4} className="text-[#059669] fill-[#059669]" />
            </div>
          </div>

          {/* Main Mobile Screen Content */}
          <div className="flex-1 overflow-y-auto px-4 py-2 no-scrollbar z-20">
            {/* VIEW 1: CITIZEN SOVEREIGN VAULT */}
            {activeTab === "vault" && (
              <div className="space-y-3.5 pb-4">
                {/* 3-Color High-Contrast Sovereign ID Card */}
                <div className="bg-[#059669] rounded-2xl p-4 text-white relative shadow-lg overflow-hidden border border-[#10b981]">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <Shield size={18} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-poppins font-bold text-sm tracking-tight leading-none text-white">
                          Chinwe Okafor
                        </h3>
                        <p className="text-[10px] text-white/80 mt-0.5 font-montserrat">Sovereign Citizen ID</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-white text-[#059669] text-[9px] font-bold rounded-full font-montserrat shadow-sm">
                      NDPC Verified
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] bg-[#047857] p-2 rounded-xl border border-white/10 font-montserrat">
                    <div>
                      <p className="text-white/70">Node Host</p>
                      <p className="font-semibold text-white truncate">ng-west-africa-01</p>
                    </div>
                    <div>
                      <p className="text-white/70">Ledger</p>
                      <p className="font-semibold text-white">Base Sepolia L2</p>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[9px] font-mono text-white/90">
                    <span className="truncate w-44">0x4b22...bf8a (SHA-256)</span>
                    <span className="text-white flex items-center gap-1 font-semibold">
                      <CheckCircle2Animated size={10} /> Tamper-Free
                    </span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-2 font-montserrat">
                  <button
                    onClick={() => setActiveTab("mint")}
                    className="p-2.5 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl text-left flex items-center gap-2.5 transition-all"
                  >
                    <div className="p-1.5 bg-[#059669] rounded-lg text-white">
                      <Key size={14} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white font-poppins">Mint Scoped Key</p>
                      <p className="text-[9px] text-slate-300">Selective sharing</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("cloud")}
                    className="p-2.5 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl text-left flex items-center gap-2.5 transition-all"
                  >
                    <div className="p-1.5 bg-white text-[#0f172a] rounded-lg">
                      <Cloud size={14} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white font-poppins">Cloud Sync</p>
                      <p className="text-[9px] text-slate-300">Zero raw storage</p>
                    </div>
                  </button>
                </div>

                {/* 6 Category Vault Cards */}
                <div>
                  <div className="flex justify-between items-center mb-2 px-1 font-montserrat">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider font-poppins">
                      Vault Categories (6)
                    </span>
                    <span className="text-[10px] text-[#059669] font-bold">14 Active Records</span>
                  </div>

                  <div className="space-y-2">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-white text-[#0f172a] border-[#059669] shadow-md"
                              : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`p-2 rounded-lg ${
                                  isSelected ? "bg-[#059669] text-white" : "bg-white/10 text-[#059669]"
                                }`}
                              >
                                <Icon size={14} />
                              </div>
                              <div>
                                <h4
                                  className={`text-[12px] font-semibold font-poppins ${
                                    isSelected ? "text-[#0f172a]" : "text-white"
                                  }`}
                                >
                                  {cat.label}
                                </h4>
                                <p
                                  className={`text-[10px] truncate max-w-[170px] font-montserrat ${
                                    isSelected ? "text-slate-600" : "text-slate-300"
                                  }`}
                                >
                                  {cat.highlight}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded font-montserrat ${
                                  isSelected
                                    ? "bg-[#059669] text-white"
                                    : "bg-white/10 text-slate-300 border border-white/10"
                                }`}
                              >
                                {cat.tier}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: MINT PROGRAMMABLE SCOPED KEY */}
            {activeTab === "mint" && (
              <div className="space-y-3.5 pb-4 font-montserrat">
                <div className="bg-white text-[#0f172a] border border-slate-200 rounded-2xl p-3.5 text-center shadow-md">
                  <div className="w-10 h-10 rounded-full bg-[#059669] text-white flex items-center justify-center mx-auto mb-2">
                    <Key size={18} />
                  </div>
                  <h3 className="text-sm font-bold font-poppins text-[#0f172a]">Create Scoped Key</h3>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    Never send PDFs. Grant selective, cryptographic access that auto-expires.
                  </p>
                </div>

                {/* Recipient binding */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider block mb-1 font-poppins">
                    Requesting Organization
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#059669]"
                    placeholder="e.g. Canadian High Commission"
                  />
                </div>

                {/* Category Selection */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider block mb-2 font-poppins">
                    Granted Vault Categories
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["academics", "finance", "experience", "certifications", "portfolio", "achievements"] as VaultCategory[]).map(
                      (cat) => {
                        const isChecked = selectedScopes.includes(cat);
                        return (
                          <button
                            key={cat}
                            onClick={() => {
                              setSelectedScopes((prev) =>
                                isChecked ? prev.filter((s) => s !== cat) : [...prev, cat]
                              );
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium border text-left flex items-center justify-between transition-all ${
                              isChecked
                                ? "bg-[#059669] border-[#059669] text-white font-semibold"
                                : "bg-black/30 border-white/10 text-slate-300"
                            }`}
                          >
                            <span className="capitalize">{cat}</span>
                            {isChecked && <Check size={11} />}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* TTL Slider */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="flex justify-between items-center mb-1 text-[10px]">
                    <span className="text-slate-300 uppercase tracking-wider font-semibold font-poppins">
                      Expiration (TTL)
                    </span>
                    <span className="font-bold text-[#059669]">{ttlDays} Days</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={ttlDays}
                    onChange={(e) => setTtlDays(Number(e.target.value))}
                    className="w-full accent-[#059669]"
                  />
                </div>

                {/* Mint Action Button */}
                <button
                  onClick={handleMintScopedKey}
                  disabled={isMinting || selectedScopes.length === 0}
                  className="w-full py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-poppins"
                >
                  <ScanFace size={16} />
                  {isMinting ? "Attesting Biometrics..." : "Mint with Face ID"}
                </button>

                {/* Result Display */}
                {mintedKey && (
                  <div className="bg-white text-[#0f172a] border border-[#059669] rounded-xl p-3 text-center space-y-2 shadow-lg">
                    <p className="text-[10px] text-[#059669] font-bold font-poppins">
                      Scoped Key Active & Registered On-Chain
                    </p>
                    <div className="p-2 bg-slate-100 rounded-lg border border-slate-200 font-mono text-[10px] text-[#0f172a] break-all select-all flex items-center justify-between gap-1">
                      <span className="truncate">{mintedKey}</span>
                      <button onClick={handleCopy} className="p-1 hover:text-[#059669]">
                        {copiedKey ? <Check size={13} className="text-[#059669]" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 3: CLOUD SYNC & PRIVACY */}
            {activeTab === "cloud" && (
              <div className="space-y-3.5 pb-4 font-montserrat">
                <div className="bg-white text-[#0f172a] border border-slate-200 rounded-2xl p-3.5 text-center shadow-md">
                  <div className="w-10 h-10 rounded-full bg-[#059669] text-white flex items-center justify-center mx-auto mb-2">
                    <Cloud size={18} />
                  </div>
                  <h3 className="text-sm font-bold font-poppins text-[#0f172a]">Zero Raw Centralization</h3>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    Your physical PDFs remain in your private Google Drive. We parse in memory, hash via SHA-256, and retain zero files.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="p-3 bg-white/10 border border-[#059669] rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#059669] flex items-center justify-center text-white font-bold text-xs font-poppins">
                        G
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white font-poppins">Google Drive</p>
                        <p className="text-[9px] text-[#059669] flex items-center gap-1 font-semibold">
                          <CheckCircle2Animated size={9} /> Connected (OAuth 2.0)
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-300">12 Files Synced</span>
                  </div>

                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between opacity-60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-xs font-poppins">
                        D
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white font-poppins">Dropbox</p>
                        <p className="text-[9px] text-slate-400">Ready to link</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">Standby</span>
                  </div>
                </div>

                <div className="bg-[#059669]/15 border border-[#059669]/40 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-[#059669] font-bold text-[11px] mb-1 font-poppins">
                    <Database size={13} />
                    <span>Regional Sovereign Node</span>
                  </div>
                  <p className="text-[10px] text-slate-200 leading-relaxed font-montserrat">
                    Extracted JSON data strictly resides on <strong>ng-west-africa-01</strong> in compliance with Nigeria NDPC & ECOWAS sovereign data residency directives.
                  </p>
                </div>
              </div>
            )}

            {/* VIEW 4: BLOCKCHAIN LEDGER */}
            {activeTab === "ledger" && (
              <div className="space-y-3 pb-4 font-montserrat">
                <div className="bg-white text-[#0f172a] border border-slate-200 rounded-2xl p-3 text-center shadow-md">
                  <div className="w-9 h-9 rounded-full bg-[#059669] text-white flex items-center justify-center mx-auto mb-1.5">
                    <Shield size={16} />
                  </div>
                  <h3 className="text-xs font-bold font-poppins text-[#0f172a]">Immutable Ledger Proofs</h3>
                  <p className="text-[9px] text-slate-600">Base Sepolia L2 (Block #18,924,102)</p>
                </div>

                <div className="space-y-1.5 text-[10px]">
                  <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex justify-between items-center text-white font-semibold mb-1 font-poppins">
                      <span>BSc Degree Anchor</span>
                      <span className="text-[#059669] text-[9px] font-bold">Verified On-Chain</span>
                    </div>
                    <p className="font-mono text-[9px] text-slate-300 truncate">
                      TX: 0x89f4b321a97d9120eef9234857b60e408d6c7b9a5e8e3d09a25b1285741f021c
                    </p>
                  </div>

                  <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex justify-between items-center text-white font-semibold mb-1 font-poppins">
                      <span>Zenith Bank Proof of Funds</span>
                      <span className="text-[#059669] text-[9px] font-bold">Tier 1 Hashed</span>
                    </div>
                    <p className="font-mono text-[9px] text-slate-300 truncate">
                      SHA: 4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a
                    </p>
                  </div>

                  <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex justify-between items-center text-white font-semibold mb-1 font-poppins">
                      <span>60/40 GovTech Revenue Split</span>
                      <span className="text-white text-[9px] font-bold">Smart Contract</span>
                    </div>
                    <p className="text-[9px] text-slate-300">
                      Executed: <code>SabiRevenueSplitter.sol</code>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom iOS Navigation Bar */}
          <div className="bg-black/90 border-t border-white/10 px-6 py-2.5 flex justify-between items-center text-[10px] z-30 font-montserrat">
            <button
              onClick={() => setActiveTab("vault")}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === "vault" ? "text-[#059669] font-bold scale-105" : "text-slate-400 hover:text-white"
              }`}
            >
              <Shield size={16} />
              <span>Vault</span>
            </button>

            <button
              onClick={() => setActiveTab("mint")}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === "mint" ? "text-[#059669] font-bold scale-105" : "text-slate-400 hover:text-white"
              }`}
            >
              <Key size={16} />
              <span>Mint Key</span>
            </button>

            <button
              onClick={() => setActiveTab("cloud")}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === "cloud" ? "text-[#059669] font-bold scale-105" : "text-slate-400 hover:text-white"
              }`}
            >
              <Cloud size={16} />
              <span>Cloud</span>
            </button>

            <button
              onClick={() => setActiveTab("ledger")}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === "ledger" ? "text-[#059669] font-bold scale-105" : "text-slate-400 hover:text-white"
              }`}
            >
              <Database size={16} />
              <span>Proofs</span>
            </button>
          </div>

          {/* iOS Home Indicator Bar */}
          <div className="w-full flex justify-center pb-1.5 pt-0.5 bg-black z-30">
            <div className="w-32 h-1 bg-white/40 rounded-full hover:bg-white transition-all cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
}
