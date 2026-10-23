"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  User,
  Globe,
  Briefcase,
  Building2,
  Calendar,
  MapPin,
  Languages,
  Sparkles,
  Save,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Github,
  Linkedin,
  Twitter,
  ExternalLink,
  Award,
  Heart,
  Compass,
  UploadCloud,
  FileText,
  Search,
  Check,
  X,
  Clock,
  Tag,
} from "lucide-react";
import {
  UserHumanProfile,
  LanguageProficiency,
  SkillItem,
  WorkExperienceItem,
  EmploymentType,
  CefrLevel,
  SkillProficiency,
} from "@/types/profile";

const CEFR_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2", "NATIVE"];
const SKILL_PROFICIENCIES: SkillProficiency[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];
const EMPLOYMENT_TYPES: EmploymentType[] = [
  "Full-time",
  "Part-time",
  "Contract",
  "Self-employed",
  "Internship",
  "Freelance",
];

// Comprehensive Multi-Sector Skills Taxonomy
const SECTOR_SKILLS_TAXONOMY: { sector: string; skills: string[] }[] = [
  {
    sector: "Software & Web3",
    skills: [
      "TypeScript", "React", "Next.js", "Node.js", "Python", "Rust", "Go", "Solidity",
      "Smart Contracts", "Distributed Systems", "PostgreSQL", "Redis", "Docker", "Kubernetes",
      "AWS", "GraphQL", "Microservices", "CI/CD", "Linux", "System Architecture", "Zero Knowledge Proofs",
      "WebSockets", "Kafka", "Tailwind CSS", "REST API Design"
    ],
  },
  {
    sector: "AI, ML & Data",
    skills: [
      "Machine Learning", "PyTorch", "TensorFlow", "Large Language Models (LLMs)", "Prompt Engineering",
      "Retrieval-Augmented Generation (RAG)", "Data Engineering", "Pandas", "NumPy", "Computer Vision",
      "Natural Language Processing (NLP)", "Vector Databases", "Apache Spark", "Data Warehousing", "Power BI",
      "Model Fine-Tuning", "ETL Pipelines"
    ],
  },
  {
    sector: "Finance, FinTech & Strategy",
    skills: [
      "Financial Modeling", "Corporate Finance", "Risk Management", "Blockchain Auditing", "AML / KYC Compliance",
      "Financial Accounting", "Company Valuation", "Venture Capital", "Quantitative Analysis", "IFRS",
      "Treasury Management", "Algorithmic Trading", "Tax Planning"
    ],
  },
  {
    sector: "Legal, Governance & Immigration",
    skills: [
      "International Law", "GDPR & Privacy Compliance", "NDPC Regulatory Framework", "Contract Drafting",
      "Corporate Governance", "Intellectual Property (IP)", "Legal Due Diligence", "Immigration Law",
      "Arbitration & Mediation", "Regulatory Compliance"
    ],
  },
  {
    sector: "Healthcare & Life Sciences",
    skills: [
      "Clinical Research", "Healthcare Compliance", "Bioinformatics", "Pharmacology", "Medical Devices",
      "HIPAA Compliance", "Epidemiology", "Public Health", "Genomics", "Biostatistics"
    ],
  },
  {
    sector: "Engineering & Infrastructure",
    skills: [
      "Mechanical Engineering", "Civil Engineering", "Electrical Systems", "CAD / SolidWorks", "Renewable Energy",
      "Structural Engineering", "Embedded Systems", "Quality Assurance (QA)", "Project Engineering", "IoT Systems"
    ],
  },
  {
    sector: "Product, Design & Creative",
    skills: [
      "UI/UX Design", "Figma", "Design Systems", "User Research", "Product Strategy", "Agile / Scrum",
      "Wireframing & Prototyping", "Motion Graphics", "Brand Identity", "Design Thinking", "Interaction Design"
    ],
  },
  {
    sector: "Sales, Marketing & Business",
    skills: [
      "Growth Marketing", "Enterprise B2B Sales", "SEO / SEM Strategy", "Content Strategy", "Brand Management",
      "Market Research", "CRM Architecture", "Product-Led Growth", "Customer Success", "Negotiation"
    ],
  },
];

// Categorized Hobbies & Extra-Curricular Taxonomy
const HOBBIES_TAXONOMY: { category: string; hobbies: string[] }[] = [
  {
    category: "Sports & Fitness",
    hobbies: ["Marathon Running", "Football / Soccer", "Basketball", "Swimming", "Tennis", "Cycling", "Weightlifting", "Yoga & Mindfulness", "Hiking & Mountaineering", "Martial Arts"],
  },
  {
    category: "Arts & Creativity",
    hobbies: ["Photography", "Painting & Sketching", "Creative Writing", "Digital Illustration", "Woodworking & Pottery", "Filmmaking & Editing", "Architecture & Interior Design"],
  },
  {
    category: "Tech & Open Source",
    hobbies: ["Open Source Contributing", "Hardware Hacking", "Robotics & Microcontrollers", "Game Development", "3D Printing", "Competitive Programming"],
  },
  {
    category: "Community & Impact",
    hobbies: ["Youth Mentorship", "Community Volunteering", "Environmental Conservation", "Public Speaking", "Nonprofit Leadership"],
  },
  {
    category: "Music & Audio",
    hobbies: ["Afrobeat Drumming", "Acoustic / Electric Guitar", "Piano & Keyboards", "Music Production & Mixing", "Vocal Performance", "Vinyl Record Collecting"],
  },
  {
    category: "Culture & Exploration",
    hobbies: ["Solo Travel & Backpacking", "Culinary Arts & Baking", "Foreign Language Learning", "Chess & Strategic Games", "History & Philosophy"],
  },
];

export function HumanProfileEditor() {
  const [profile, setProfile] = useState<UserHumanProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Work Experience modal state
  const [showExpModal, setShowExpModal] = useState<boolean>(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expCompany, setExpCompany] = useState<string>("");
  const [expTitle, setExpTitle] = useState<string>("");
  const [expType, setExpType] = useState<EmploymentType>("Full-time");
  const [expLocation, setExpLocation] = useState<string>("");
  const [expStartDate, setExpStartDate] = useState<string>("");
  const [expEndDate, setExpEndDate] = useState<string>("");
  const [expIsCurrent, setExpIsCurrent] = useState<boolean>(false);
  const [expDescription, setExpDescription] = useState<string>("");
  const [expSkillsUsed, setExpSkillsUsed] = useState<string>("");

  // Skills input & autocomplete state
  const [skillSearch, setSkillSearch] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("All");
  const [showSkillDropdown, setShowSkillDropdown] = useState<boolean>(false);

  // Hobbies input & autocomplete state
  const [hobbySearch, setHobbySearch] = useState<string>("");
  const [selectedHobbyCat, setSelectedHobbyCat] = useState<string>("All");
  const [showHobbyDropdown, setShowHobbyDropdown] = useState<boolean>(false);

  // Target goals state
  const [newTargetRole, setNewTargetRole] = useState<string>("");
  const [newTargetCountry, setNewTargetCountry] = useState<string>("");

  // CV / LinkedIn PDF Import Modal State
  const [showCvModal, setShowCvModal] = useState<boolean>(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvExtracting, setCvExtracting] = useState<boolean>(false);
  const [cvExtractedPreview, setCvExtractedPreview] = useState<any | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // --- Work Experience Handlers ---
  const openAddExpModal = () => {
    setEditingExpId(null);
    setExpCompany("");
    setExpTitle("");
    setExpType("Full-time");
    setExpLocation("");
    setExpStartDate("");
    setExpEndDate("");
    setExpIsCurrent(false);
    setExpDescription("");
    setExpSkillsUsed("");
    setShowExpModal(true);
  };

  const openEditExpModal = (exp: WorkExperienceItem) => {
    setEditingExpId(exp.id);
    setExpCompany(exp.company);
    setExpTitle(exp.title);
    setExpType(exp.employmentType);
    setExpLocation(exp.location || "");
    setExpStartDate(exp.startDate);
    setExpEndDate(exp.endDate || "");
    setExpIsCurrent(exp.isCurrent);
    setExpDescription(exp.description);
    setExpSkillsUsed(exp.skillsUsed.join(", "));
    setShowExpModal(true);
  };

  const handleSaveExperience = () => {
    if (!profile || !expCompany.trim() || !expTitle.trim()) return;

    const skillsArray = expSkillsUsed
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const newOrUpdatedExp: WorkExperienceItem = {
      id: editingExpId || `exp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      company: expCompany.trim(),
      title: expTitle.trim(),
      employmentType: expType,
      location: expLocation.trim() || undefined,
      startDate: expStartDate.trim() || "2022",
      endDate: expIsCurrent ? undefined : expEndDate.trim() || undefined,
      isCurrent: expIsCurrent,
      description: expDescription.trim(),
      skillsUsed: skillsArray,
    };

    const existingExps = profile.workExperiences || [];
    const updated = editingExpId
      ? existingExps.map((e) => (e.id === editingExpId ? newOrUpdatedExp : e))
      : [newOrUpdatedExp, ...existingExps];

    setProfile({ ...profile, workExperiences: updated });
    setShowExpModal(false);
  };

  const handleDeleteExperience = (id: string, company: string) => {
    if (!profile) return;
    if (!confirm(`Remove experience at ${company}?`)) return;
    setProfile({
      ...profile,
      workExperiences: (profile.workExperiences || []).filter((e) => e.id !== id),
    });
  };

  // --- Skills Autocomplete & Taxonomy Handlers ---
  const allTaxonomySkills = useMemo(() => {
    const map = new Map<string, string>();
    for (const sec of SECTOR_SKILLS_TAXONOMY) {
      for (const sk of sec.skills) {
        if (!map.has(sk.toLowerCase())) {
          map.set(sk.toLowerCase(), sec.sector);
        }
      }
    }
    return map;
  }, []);

  const filteredTaxonomySkills = useMemo(() => {
    const search = skillSearch.trim().toLowerCase();
    const existingSkillNames = new Set((profile?.skills || []).map((s) => s.name.toLowerCase()));

    const results: { name: string; sector: string }[] = [];
    for (const sec of SECTOR_SKILLS_TAXONOMY) {
      if (selectedSector !== "All" && sec.sector !== selectedSector) continue;
      for (const sk of sec.skills) {
        if (existingSkillNames.has(sk.toLowerCase())) continue;
        if (!search || sk.toLowerCase().includes(search) || sec.sector.toLowerCase().includes(search)) {
          results.push({ name: sk, sector: sec.sector });
        }
      }
    }
    return results.slice(0, 24);
  }, [skillSearch, selectedSector, profile?.skills]);

  const handleAddSkillFromTaxonomy = (name: string, category: string) => {
    if (!profile) return;
    const exists = profile.skills.some((s) => s.name.toLowerCase() === name.toLowerCase());
    if (exists) return;

    const newSk: SkillItem = {
      id: `sk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name,
      category: category || "General",
      proficiency: "INTERMEDIATE",
      yearsOfExperience: 3,
    };
    setProfile({ ...profile, skills: [...profile.skills, newSk] });
    setSkillSearch("");
    setShowSkillDropdown(false);
  };

  const handleAddCustomSkill = () => {
    if (!profile || !skillSearch.trim()) return;
    const name = skillSearch.trim();
    const category = selectedSector !== "All" ? selectedSector : "Specialized Domain";
    handleAddSkillFromTaxonomy(name, category);
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

  // --- Hobbies Autocomplete & Taxonomy Handlers ---
  const filteredTaxonomyHobbies = useMemo(() => {
    const search = hobbySearch.trim().toLowerCase();
    const existingHobbies = new Set((profile?.hobbies || []).map((h) => h.toLowerCase()));

    const results: { name: string; category: string }[] = [];
    for (const cat of HOBBIES_TAXONOMY) {
      if (selectedHobbyCat !== "All" && cat.category !== selectedHobbyCat) continue;
      for (const h of cat.hobbies) {
        if (existingHobbies.has(h.toLowerCase())) continue;
        if (!search || h.toLowerCase().includes(search)) {
          results.push({ name: h, category: cat.category });
        }
      }
    }
    return results.slice(0, 18);
  }, [hobbySearch, selectedHobbyCat, profile?.hobbies]);

  const handleAddHobby = (hobbyName: string) => {
    if (!profile || !hobbyName.trim()) return;
    const clean = hobbyName.trim();
    if (profile.hobbies.some((h) => h.toLowerCase() === clean.toLowerCase())) return;

    setProfile({ ...profile, hobbies: [...profile.hobbies, clean] });
    setHobbySearch("");
    setShowHobbyDropdown(false);
  };

  const removeHobbyItem = (index: number) => {
    if (!profile) return;
    setProfile({
      ...profile,
      hobbies: profile.hobbies.filter((_, i) => i !== index),
    });
  };

  // --- Language Management ---
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

  // --- Target Roles & Countries ---
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

  // --- CV / LinkedIn PDF Parsing ---
  const handleCvFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setCvFile(files[0]);
      setCvError(null);
      setCvExtractedPreview(null);
    }
  };

  const handleRunCvExtraction = async () => {
    if (!cvFile) return;
    try {
      setCvExtracting(true);
      setCvError(null);

      const formData = new FormData();
      formData.append("file", cvFile);

      const res = await fetch("/api/v1/user/profile/extract-cv", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to parse CV");
      }

      setCvExtractedPreview(data.data);
    } catch (err: any) {
      setCvError(err.message || "Failed to analyze CV/LinkedIn PDF document.");
    } finally {
      setCvExtracting(false);
    }
  };

  const handleApplyExtractedCvData = () => {
    if (!profile || !cvExtractedPreview) return;

    const p = cvExtractedPreview;
    const mergedProfile: UserHumanProfile = {
      ...profile,
      fullName: p.fullName || profile.fullName,
      headline: p.headline || profile.headline,
      bio: p.bio || profile.bio,
      residenceCity: p.residenceCity || profile.residenceCity,
      residenceCountry: p.residenceCountry || profile.residenceCountry,
      nationality: p.nationality || profile.nationality,
      socialLinks: {
        ...profile.socialLinks,
        ...(p.socialLinks?.linkedin ? { linkedin: p.socialLinks.linkedin } : {}),
        ...(p.socialLinks?.github ? { github: p.socialLinks.github } : {}),
        ...(p.socialLinks?.twitter ? { twitter: p.socialLinks.twitter } : {}),
        ...(p.socialLinks?.portfolio ? { portfolio: p.socialLinks.portfolio } : {}),
      },
      workExperiences: [
        ...(p.workExperiences || []),
        ...(profile.workExperiences || []).filter(
          (oldExp) =>
            !p.workExperiences?.some(
              (newExp: any) =>
                newExp.company.toLowerCase() === oldExp.company.toLowerCase() &&
                newExp.title.toLowerCase() === oldExp.title.toLowerCase()
            )
        ),
      ],
      skills: [
        ...(p.skills || []),
        ...profile.skills.filter(
          (oldSk) => !p.skills?.some((newSk: any) => newSk.name.toLowerCase() === oldSk.name.toLowerCase())
        ),
      ],
      languages: [
        ...(p.languages || []),
        ...profile.languages.filter(
          (oldLang) =>
            !p.languages?.some((newLang: any) => newLang.language.toLowerCase() === oldLang.language.toLowerCase())
        ),
      ],
      hobbies: Array.from(new Set([...profile.hobbies, ...(p.hobbies || [])])),
      targetRoles: Array.from(new Set([...profile.targetRoles, ...(p.targetRoles || [])])),
      targetCountries: Array.from(new Set([...profile.targetCountries, ...(p.targetCountries || [])])),
    };

    setProfile(mergedProfile);
    setShowCvModal(false);
    setCvFile(null);
    setCvExtractedPreview(null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
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
      {/* Header bar with Save and CV Import buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Human Identity & Holistic Profile</h2>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
              Zero-CV Ready
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Define your verified human persona, employment history, skills taxonomy, and cultural context. Grounding data mapped automatically during enterprise queries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 animate-fade-in">
              <CheckCircle2 className="h-4 w-4" /> Profile Synced
            </span>
          )}

          {/* 1-Click CV / LinkedIn PDF Auto-Fill Button */}
          <button
            onClick={() => setShowCvModal(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-800 shadow-xs hover:bg-slate-100 active:scale-95 transition-all"
          >
            <Sparkles className="h-4 w-4 text-emerald-600" /> Auto-fill from CV / LinkedIn PDF
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-60"
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
        {/* Left Column (8 cols): Personal Info, Work Experience, Skills, Languages */}
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

          {/* Card: LinkedIn-Style Work Experience */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Briefcase className="h-4 w-4 text-emerald-600" /> Professional Work Experience ({profile.workExperiences?.length || 0})
                </h3>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Structured career history formatted to LinkedIn and enterprise recruitment standards.
                </p>
              </div>
              <button
                type="button"
                onClick={openAddExpModal}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-95"
              >
                <Plus className="h-3.5 w-3.5 text-emerald-600" /> Add Position
              </button>
            </div>

            <div className="space-y-4">
              {(!profile.workExperiences || profile.workExperiences.length === 0) ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                  <Briefcase className="mx-auto h-7 w-7 text-slate-300" />
                  <p className="mt-2 text-xs font-semibold text-slate-600">No work experiences listed</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Add your career history manually or auto-extract it directly from your CV / LinkedIn PDF.
                  </p>
                  <button
                    type="button"
                    onClick={openAddExpModal}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add First Experience
                  </button>
                </div>
              ) : (
                profile.workExperiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="group relative rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:border-slate-200 hover:bg-white space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{exp.title}</h4>
                          <span className="rounded bg-white px-1.5 py-0.5 text-[9px] font-bold text-slate-600 border border-slate-200 uppercase">
                            {exp.employmentType}
                          </span>
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                          <span className="font-semibold text-slate-800 flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-slate-400" /> {exp.company}
                          </span>
                          {exp.location && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <MapPin className="h-3 w-3 text-slate-400" /> {exp.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-slate-500">
                            <Calendar className="h-3 w-3 text-slate-400" /> {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate || "Present"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditExpModal(exp)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          title="Edit Position"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExperience(exp.id, exp.company)}
                          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete Position"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {exp.description && (
                      <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed pt-1">
                        {exp.description}
                      </p>
                    )}

                    {exp.skillsUsed && exp.skillsUsed.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1.5">
                        {exp.skillsUsed.map((sk, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card: Multi-Sector Skills Matrix & Autocomplete */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Award className="h-4 w-4 text-emerald-600" /> Multi-Sector Skills Taxonomy & Mastery ({profile.skills.length})
                </h3>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Search across Software, AI, FinTech, Legal, Healthcare, and Engineering. Custom skills supported.
                </p>
              </div>
            </div>

            {/* Sector Selector & Autocomplete Search */}
            <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-200/80 space-y-2.5">
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedSector("All")}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                    selectedSector === "All"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  All Sectors
                </button>
                {SECTOR_SKILLS_TAXONOMY.map((sec) => (
                  <button
                    key={sec.sector}
                    type="button"
                    onClick={() => setSelectedSector(sec.sector)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                      selectedSector === sec.sector
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {sec.sector}
                  </button>
                ))}
              </div>

              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={skillSearch}
                      onChange={(e) => {
                        setSkillSearch(e.target.value);
                        setShowSkillDropdown(true);
                      }}
                      onFocus={() => setShowSkillDropdown(true)}
                      placeholder="Type skill name across any industry (e.g. Solidity, RAG, Financial Modeling, GDPR, CAD)..."
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  {skillSearch.trim() && (
                    <button
                      type="button"
                      onClick={handleAddCustomSkill}
                      className="shrink-0 inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add as Skill
                    </button>
                  )}
                </div>

                {/* Suggestions Dropdown */}
                {showSkillDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-20 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                    <div className="flex items-center justify-between pb-1 px-1 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase">
                      <span>Suggested Skills ({filteredTaxonomySkills.length})</span>
                      <button
                        onClick={() => setShowSkillDropdown(false)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        Close
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1 pt-1.5 sm:grid-cols-3">
                      {filteredTaxonomySkills.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddSkillFromTaxonomy(item.name, item.sector)}
                          className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-800 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
                        >
                          <span className="truncate">{item.name}</span>
                          <span className="text-[9px] text-slate-400 ml-1 shrink-0">{item.sector.split("&")[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Configured Skills Matrix List */}
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
        </div>

        {/* Right Column (4 cols): Social Links, Categorized Hobbies, Target Career & Destination Countries */}
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

          {/* Card: Categorized Hobbies Taxonomy */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              <Heart className="h-4 w-4 text-rose-500" /> Categorized Hobbies & Community
            </h3>
            <p className="text-[11px] text-slate-500">
              Crucial for universities, scholarships (Chevening), and holistic visa evaluations.
            </p>

            {/* Selected Hobbies Tags */}
            <div className="flex flex-wrap gap-1.5 min-h-6">
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

            {/* Categorized Hobbies Selector & Autocomplete */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedHobbyCat("All")}
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    selectedHobbyCat === "All" ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  All
                </button>
                {HOBBIES_TAXONOMY.map((c) => (
                  <button
                    key={c.category}
                    type="button"
                    onClick={() => setSelectedHobbyCat(c.category)}
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      selectedHobbyCat === c.category ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {c.category.split("&")[0]}
                  </button>
                ))}
              </div>

              <div className="relative">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={hobbySearch}
                    onChange={(e) => {
                      setHobbySearch(e.target.value);
                      setShowHobbyDropdown(true);
                    }}
                    onFocus={() => setShowHobbyDropdown(true)}
                    placeholder="Search hobbies or type custom..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                  {hobbySearch.trim() && (
                    <button
                      type="button"
                      onClick={() => handleAddHobby(hobbySearch)}
                      className="shrink-0 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                    >
                      Add
                    </button>
                  )}
                </div>

                {showHobbyDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-20 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                    <div className="flex items-center justify-between pb-1 px-1 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase">
                      <span>Suggested Hobbies</span>
                      <button onClick={() => setShowHobbyDropdown(false)} className="text-slate-400 hover:text-slate-700">
                        Close
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {filteredTaxonomyHobbies.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddHobby(item.name)}
                          className="rounded-lg bg-slate-50 px-2 py-1 text-xs font-medium text-slate-800 hover:bg-rose-50 hover:text-rose-900 transition-colors"
                        >
                          + {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card: Target Careers & Relocation Goals (Two-way Synced with Target Advisor) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              <Compass className="h-4 w-4 text-emerald-600" /> Target Roles & Destination Countries
            </h3>
            <p className="text-[11px] text-slate-500">
              Two-way synchronized with the AI Sovereign Target Advisor and regional immigration radar.
            </p>

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
                  placeholder="e.g. Senior Software Engineer"
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
                  placeholder="e.g. Albania, Germany, Canada, UK"
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

      {/* Add / Edit Experience Modal */}
      {showExpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingExpId ? "Edit Work Experience" : "Add Work Experience"}
              </h3>
              <button
                type="button"
                onClick={() => setShowExpModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Company / Organization *</label>
                <input
                  type="text"
                  value={expCompany}
                  onChange={(e) => setExpCompany(e.target.value)}
                  placeholder="e.g. Google, SabiProfile, Freelance Client"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Job Title / Role *</label>
                <input
                  type="text"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="e.g. Lead Distributed Systems Engineer"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Employment Type</label>
                  <select
                    value={expType}
                    onChange={(e) => setExpType(e.target.value as EmploymentType)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
                  >
                    {EMPLOYMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Location</label>
                  <input
                    type="text"
                    value={expLocation}
                    onChange={(e) => setExpLocation(e.target.value)}
                    placeholder="e.g. Remote / Berlin, Germany"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Start Date</label>
                  <input
                    type="text"
                    value={expStartDate}
                    onChange={(e) => setExpStartDate(e.target.value)}
                    placeholder="e.g. 2022-01 or 2022"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">End Date</label>
                  <input
                    type="text"
                    disabled={expIsCurrent}
                    value={expIsCurrent ? "" : expEndDate}
                    onChange={(e) => setExpEndDate(e.target.value)}
                    placeholder={expIsCurrent ? "Present" : "e.g. 2024-06 or Present"}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={expIsCurrent}
                    onChange={(e) => {
                      setExpIsCurrent(e.target.checked);
                      if (e.target.checked) setExpEndDate("");
                    }}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  I currently work in this role
                </label>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Role Description & Key Accomplishments</label>
                <textarea
                  rows={3}
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  placeholder="Describe your architectural responsibilities, leadership, or quantitative metrics achieved..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Skills Used (comma-separated)</label>
                <input
                  type="text"
                  value={expSkillsUsed}
                  onChange={(e) => setExpSkillsUsed(e.target.value)}
                  placeholder="e.g. TypeScript, Next.js, Smart Contracts, Distributed Systems"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowExpModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!expCompany.trim() || !expTitle.trim()}
                onClick={handleSaveExperience}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {editingExpId ? "Update Position" : "Add Position"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1-Click CV & LinkedIn PDF Import Modal */}
      {showCvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  1-Click CV & LinkedIn Profile Auto-Fill
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCvModal(false);
                  setCvFile(null);
                  setCvExtractedPreview(null);
                  setCvError(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Upload your CV / Resume or official <strong>LinkedIn Profile PDF</strong> (exported via LinkedIn &gt; More &gt; Save to PDF). Sovereign Multimodal Vision AI extracts your complete work history, skills taxonomy, and languages ephemerally.
            </p>

            {/* Zero-Centralization Security Notice */}
            <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-3 text-[11px] text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>
                <strong>Zero Raw Centralization Invariant:</strong> The physical file is parsed in-memory and immediately zeroed with <code>buffer.fill(0)</code>. It is never stored on SabiProfile servers.
              </span>
            </div>

            {/* File Dropzone */}
            {!cvExtractedPreview && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center hover:border-emerald-500 hover:bg-emerald-50/30 transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf,image/png,image/jpeg"
                  onChange={handleCvFileSelected}
                  className="hidden"
                />
                <UploadCloud className="mx-auto h-10 w-10 text-emerald-600 mb-2" />
                {cvFile ? (
                  <div>
                    <span className="text-xs font-bold text-slate-900">{cvFile.name}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {(cvFile.size / 1024).toFixed(1)} KB — Ready to parse
                    </span>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Click to choose or drop your CV or LinkedIn PDF
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Supports PDF, PNG, JPG scans (Max 15MB)
                    </p>
                  </div>
                )}
              </div>
            )}

            {cvError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {cvError}
              </div>
            )}

            {/* Extracted Preview */}
            {cvExtractedPreview && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Data Extracted Successfully
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    Confidence: {(cvExtractedPreview.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Full Name</span>
                    <span className="font-semibold text-slate-800">{cvExtractedPreview.fullName || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Headline</span>
                    <span className="font-semibold text-slate-800 truncate block">{cvExtractedPreview.headline || "—"}</span>
                  </div>
                </div>

                <div className="text-xs border-t border-slate-200 pt-2 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Extraction Summary</span>
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-700">
                    <span className="rounded bg-white px-2 py-0.5 border border-slate-200">
                      💼 {cvExtractedPreview.workExperiences?.length || 0} Work Experiences
                    </span>
                    <span className="rounded bg-white px-2 py-0.5 border border-slate-200">
                      ⚡ {cvExtractedPreview.skills?.length || 0} Evaluated Skills
                    </span>
                    <span className="rounded bg-white px-2 py-0.5 border border-slate-200">
                      🌐 {cvExtractedPreview.languages?.length || 0} Languages
                    </span>
                    <span className="rounded bg-white px-2 py-0.5 border border-slate-200">
                      ❤️ {cvExtractedPreview.hobbies?.length || 0} Hobbies & Interests
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowCvModal(false);
                  setCvFile(null);
                  setCvExtractedPreview(null);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              {!cvExtractedPreview ? (
                <button
                  type="button"
                  disabled={!cvFile || cvExtracting}
                  onClick={handleRunCvExtraction}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Sparkles className={`h-4 w-4 ${cvExtracting ? "animate-spin" : ""}`} />
                  {cvExtracting ? "Analyzing Document..." : "Analyze & Extract"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyExtractedCvData}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  <Check className="h-4 w-4" /> Apply to Profile Form
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
