"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Globe,
  Briefcase,
  Languages,
  Sparkles,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Github,
  Linkedin,
  Twitter,
  ExternalLink,
  Award,
  Heart,
  Compass,
} from "lucide-react";
import { UserHumanProfile, LanguageProficiency, SkillItem, CefrLevel, SkillProficiency } from "@/types/profile";

const CEFR_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2", "NATIVE"];
const SKILL_PROFICIENCIES: SkillProficiency[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];

export function HumanProfileEditor() {
  const [profile, setProfile] = useState<UserHumanProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // New item draft states
  const [newHobby, setNewHobby] = useState<string>("");
  const [newTargetRole, setNewTargetRole] = useState<string>("");
  const [newTargetCountry, setNewTargetCountry] = useState<string>("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/v1/user/profile");
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();
      setProfile(data.profile);
    } catch (err: any) {
      setError(err.message || "Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    try {
      setSaving(true);
      setError(null);
      setSaveSuccess(false);
      const res = await fetch("/api/v1/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      const data = await res.json();
      setProfile(data.profile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Language management
  const addLanguage = () => {
    if (!profile) return;
    const newLang: LanguageProficiency = {
      id: `lang_${Date.now()}`,
      language: "German",
      level: "B1",
      isNative: false,
    };
    setProfile({ ...profile, languages: [...profile.languages, newLang] });
  };

  const updateLanguage = (id: string, updates: Partial<LanguageProficiency>) => {
    if (!profile) return;
    setProfile({
      ...profile,
      languages: profile.languages.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    });
  };

  const removeLanguage = (id: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      languages: profile.languages.filter((l) => l.id !== id),
    });
  };

  // Skill management
  const addSkill = () => {
    if (!profile) return;
    const newSk: SkillItem = {
      id: `sk_${Date.now()}`,
      name: "Distributed Consensus",
      category: "Architecture",
      proficiency: "ADVANCED",
      yearsOfExperience: 3,
    };
    setProfile({ ...profile, skills: [...profile.skills, newSk] });
  };

  const updateSkill = (id: string, updates: Partial<SkillItem>) => {
    if (!profile) return;
    setProfile({
      ...profile,
      skills: profile.skills.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    });
  };

  const removeSkill = (id: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s.id !== id),
    });
  };

  // Hobbies management
  const addHobbyItem = () => {
    if (!profile || !newHobby.trim()) return;
    setProfile({ ...profile, hobbies: [...profile.hobbies, newHobby.trim()] });
    setNewHobby("");
  };

  const removeHobbyItem = (index: number) => {
    if (!profile) return;
    setProfile({
      ...profile,
      hobbies: profile.hobbies.filter((_, i) => i !== index),
    });
  };

  // Target roles management
  const addTargetRoleItem = () => {
    if (!profile || !newTargetRole.trim()) return;
    setProfile({ ...profile, targetRoles: [...profile.targetRoles, newTargetRole.trim()] });
    setNewTargetRole("");
  };

  const removeTargetRoleItem = (index: number) => {
    if (!profile) return;
    setProfile({
      ...profile,
      targetRoles: profile.targetRoles.filter((_, i) => i !== index),
    });
  };

  // Target countries management
  const addTargetCountryItem = () => {
    if (!profile || !newTargetCountry.trim()) return;
    setProfile({ ...profile, targetCountries: [...profile.targetCountries, newTargetCountry.trim()] });
    setNewTargetCountry("");
  };

  const removeTargetCountryItem = (index: number) => {
    if (!profile) return;
    setProfile({
      ...profile,
      targetCountries: profile.targetCountries.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="space-y-4 py-8">
        <div className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
        <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        <AlertTriangle className="mx-auto h-6 w-6 text-red-500 mb-2" />
        <p className="font-semibold">{error || "Could not load human profile"}</p>
        <button
          onClick={fetchProfile}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header bar with Save button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Human Identity & Holistic Profile</h2>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
              Zero-CV Ready
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Define your verified human persona, languages, skills, and cultural context. Grounding data mapped automatically during enterprise queries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 animate-fade-in">
              <CheckCircle2 className="h-4 w-4" /> Profile Synced
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving Changes..." : "Save Profile"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Grid: 2 columns */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column (8 cols): Personal Info, Languages, Skills */}
        <div className="space-y-8 lg:col-span-8">
          {/* Card: Core Personal Identity */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              <User className="h-4 w-4 text-emerald-600" /> Core Human Identity
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-slate-700">Full Legal Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Professional Headline</label>
                <input
                  type="text"
                  value={profile.headline}
                  onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                  placeholder="e.g. Principal Distributed Systems Architect"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">City of Residence</label>
                <input
                  type="text"
                  value={profile.residenceCity}
                  onChange={(e) => setProfile({ ...profile, residenceCity: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Country of Residence / Sovereignty</label>
                <input
                  type="text"
                  value={profile.residenceCountry}
                  onChange={(e) => setProfile({ ...profile, residenceCountry: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Professional Biography & Human Mission</label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Describe your background, passions, and core worldview..."
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Card: CEFR Language Scale */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Languages className="h-4 w-4 text-emerald-600" /> CEFR Language Scale (Immigration & Academic Standard)
                </h3>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Standardized from A1 (Beginner) to C2 (Mastery) or Native.
                </p>
              </div>
              <button
                type="button"
                onClick={addLanguage}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" /> Add Language
              </button>
            </div>

            <div className="space-y-3">
              {profile.languages.map((lang) => (
                <div
                  key={lang.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={lang.language}
                      onChange={(e) => updateLanguage(lang.id, { language: e.target.value })}
                      placeholder="Language (e.g. German, French)"
                      className="w-36 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />

                    <select
                      value={lang.level}
                      onChange={(e) => updateLanguage(lang.id, { level: e.target.value as CefrLevel })}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-emerald-700 focus:border-emerald-500 focus:outline-none"
                    >
                      {CEFR_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          Level {lvl}
                        </option>
                      ))}
                    </select>

                    <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lang.isNative}
                        onChange={(e) => updateLanguage(lang.id, { isNative: e.target.checked })}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      Native
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={lang.verifiedCredentialRef || ""}
                      onChange={(e) => updateLanguage(lang.id, { verifiedCredentialRef: e.target.value })}
                      placeholder="Attestation (e.g. IELTS 8.0, Goethe B2)"
                      className="w-48 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-600 focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeLanguage(lang.id)}
                      className="p-1 text-slate-400 hover:text-red-500"
                      title="Remove language"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Skills Matrix */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Award className="h-4 w-4 text-emerald-600" /> Evaluated Skills Matrix & Mastery Tiers
                </h3>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Categorized skills evaluated with verified tenure and proficiency depth.
                </p>
              </div>
              <button
                type="button"
                onClick={addSkill}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" /> Add Skill
              </button>
            </div>

            <div className="space-y-3">
              {profile.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="grid grid-cols-1 gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:grid-cols-12 sm:items-center"
                >
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                      placeholder="Skill name"
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={skill.category}
                      onChange={(e) => updateSkill(skill.id, { category: e.target.value })}
                      placeholder="Domain/Category"
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <select
                      value={skill.proficiency}
                      onChange={(e) => updateSkill(skill.id, { proficiency: e.target.value as SkillProficiency })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-bold text-slate-800 focus:border-emerald-500 focus:outline-none"
                    >
                      {SKILL_PROFICIENCIES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      value={skill.yearsOfExperience}
                      onChange={(e) => updateSkill(skill.id, { yearsOfExperience: Number(e.target.value) })}
                      className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 text-center focus:border-emerald-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 font-semibold">yrs</span>
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeSkill(skill.id)}
                      className="p-1 text-slate-400 hover:text-red-500"
                      title="Remove skill"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Social Links, Cultural Hobbies, Target Career & Immigration */}
        <div className="space-y-8 lg:col-span-4">
          {/* Card: Social & Verification Links */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              <Globe className="h-4 w-4 text-emerald-600" /> Digital Footprint & Profiles
            </h3>

            <div className="space-y-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Linkedin className="h-3.5 w-3.5 text-blue-600" /> LinkedIn
                </label>
                <input
                  type="url"
                  value={profile.socialLinks.linkedin || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, linkedin: e.target.value },
                    })
                  }
                  placeholder="https://linkedin.com/in/username"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Github className="h-3.5 w-3.5 text-slate-900" /> GitHub
                </label>
                <input
                  type="url"
                  value={profile.socialLinks.github || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, github: e.target.value },
                    })
                  }
                  placeholder="https://github.com/username"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Twitter className="h-3.5 w-3.5 text-sky-500" /> X (Twitter)
                </label>
                <input
                  type="url"
                  value={profile.socialLinks.twitter || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, twitter: e.target.value },
                    })
                  }
                  placeholder="https://x.com/handle"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <ExternalLink className="h-3.5 w-3.5 text-emerald-600" /> Personal Portfolio / Blog
                </label>
                <input
                  type="url"
                  value={profile.socialLinks.portfolio || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, portfolio: e.target.value },
                    })
                  }
                  placeholder="https://yourdomain.com"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card: Cultural Hobbies & Extra-Curriculars */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              <Heart className="h-4 w-4 text-rose-500" /> Cultural Hobbies & Community
            </h3>
            <p className="text-[11px] text-slate-500">
              Crucial for universities, scholarships (Chevening), and holistic visa evaluations.
            </p>

            <div className="flex flex-wrap gap-2">
              {profile.hobbies.map((hobby, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  {hobby}
                  <button
                    type="button"
                    onClick={() => removeHobbyItem(idx)}
                    className="hover:text-red-500 text-slate-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newHobby}
                onChange={(e) => setNewHobby(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addHobbyItem()}
                placeholder="e.g. Marathon Running, Afrobeat drumming"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={addHobbyItem}
                className="shrink-0 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                Add
              </button>
            </div>
          </div>

          {/* Card: Target Careers & Relocation Goals */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              <Compass className="h-4 w-4 text-emerald-600" /> Target Roles & Destination Countries
            </h3>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Target Roles & Titles</label>
              <div className="flex flex-wrap gap-1.5 mt-1.5 mb-2">
                {profile.targetRoles.map((role, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-200"
                  >
                    {role}
                    <button
                      type="button"
                      onClick={() => removeTargetRoleItem(idx)}
                      className="hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTargetRole}
                  onChange={(e) => setNewTargetRole(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTargetRoleItem()}
                  placeholder="e.g. Staff Infrastructure Engineer"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2.5 py-1 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addTargetRoleItem}
                  className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  +
                </button>
              </div>
            </div>

            <div className="pt-2">
              <label className="text-[11px] font-bold text-slate-700">Target Relocation Countries</label>
              <div className="flex flex-wrap gap-1.5 mt-1.5 mb-2">
                {profile.targetCountries.map((c, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-800 ring-1 ring-sky-200"
                  >
                    {c}
                    <button
                      type="button"
                      onClick={() => removeTargetCountryItem(idx)}
                      className="hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTargetCountry}
                  onChange={(e) => setNewTargetCountry(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTargetCountryItem()}
                  placeholder="e.g. Germany, Canada, UK"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2.5 py-1 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addTargetCountryItem}
                  className="rounded-lg bg-sky-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-sky-700"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

