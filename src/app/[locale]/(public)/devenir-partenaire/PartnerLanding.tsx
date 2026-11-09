"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Dog,
  Cat,
  FileText,
  Handshake,
  Info,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { actionSubmitBreederApplication } from "@/app/actions/partner";
import {
  ANIMAL_CATEGORIES,
  DEPOSIT_INDICATIONS,
  getDepositIndication,
  PARTNER_COUNTRIES,
  PARTNER_DRAFT_KEY,
  PARTNER_EXPERIENCES,
  PARTNER_STATUSES,
  PARTNERSHIP_WHATSAPP,
} from "@/data/partnership";
import type {
  AnimalCategory,
  PartnerApplication,
  PartnerExperience,
  PartnerStatus,
} from "@/types/partnership";

const STATUS_LABEL: Record<PartnerStatus, string> = {
  eleveur_pro: "statutPro",
  eleveur_indep: "statutIndep",
  eleveur_fam: "statutFam",
  dresseur: "statutDog",
  pro_felin: "statutCat",
  structure: "statutStructure",
  autre: "statutOther",
};

const EXPERIENCE_LABEL: Record<PartnerExperience, string> = {
  lt1: "experienceLt1",
  "1-3": "experience1to3",
  "3-5": "experience3to5",
  "5-10": "experience5to10",
  gt10: "experienceGt10",
};

const ANIMAL_LABEL: Record<AnimalCategory, string> = {
  dog_adult_male: "dogAdultMale",
  dog_adult_female: "dogAdultFemale",
  puppy_male: "puppyMale",
  puppy_female: "puppyFemale",
  cat_adult_male: "catMale",
  cat_adult_female: "catFemale",
  kitten_male: "kittenMale",
  kitten_female: "kittenFemale",
};

const TOTAL_STEPS = 6;

const EMPTY: PartnerApplication = {
  profile: {
    prenom: "",
    nom: "",
    elevage: "",
    email: "",
    telephone: "",
    whatsapp: "",
    website: "",
    social: "",
    statut: "eleveur_pro",
    experience: "1-3",
  },
  location: { country: "France", otherCountry: "", city: "", region: "" },
  animals: { categories: [], breeds: "", count: "", notes: "" },
  documents: {
    hasProPhotos: false,
    hasRecentPhotos: false,
    hasVideos: false,
    hasParentPhotos: false,
    hasPedigree: false,
    hasVetDocs: false,
    hasGeneticTests: false,
  },
  consent: { acceptData: false, acceptTruth: false },
};

const inputClass =
  "w-full p-3.5 rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-black/20 text-sm text-text-premium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";
const labelClass = "block text-xs font-bold text-text-premium/70 uppercase tracking-wide mb-1.5";

export default function PartnerLanding() {
  const t = useTranslations("Partner");
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PartnerApplication>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  // Restore locally saved draft (per-browser convenience only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PARTNER_DRAFT_KEY);
      if (raw) setData({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(PARTNER_DRAFT_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, [data, hydrated]);

  const resolvedCountry =
    data.location.country === "__other" ? data.location.otherCountry || t("form.otherCountry") : data.location.country;

  const depositIndication = useMemo(() => {
    const raw = getDepositIndication(data.location.country);
    if (raw === "toConfirm") return t("deposit.toConfirm");
    if (raw === "customStudy") return t("deposit.customStudy");
    return raw;
  }, [data.location.country, t]);

  const set = <K extends keyof PartnerApplication>(section: K, patch: Partial<PartnerApplication[K]>) =>
    setData((d) => ({ ...d, [section]: { ...d[section], ...patch } }));

  const toggleCategory = (cat: AnimalCategory) =>
    setData((d) => ({
      ...d,
      animals: {
        ...d.animals,
        categories: d.animals.categories.includes(cat)
          ? d.animals.categories.filter((c) => c !== cat)
          : [...d.animals.categories, cat],
      },
    }));

  const validateStep = (s: number): string | null => {
    if (s === 1) {
      const p = data.profile;
      if (!p.prenom || !p.nom || !p.elevage || !p.email || !p.telephone) return t("form.required");
    }
    if (s === 2) {
      if (!data.location.city) return t("form.required");
      if (data.location.country === "__other" && !data.location.otherCountry) return t("form.required");
    }
    if (s === 3) {
      if (data.animals.categories.length === 0) return t("form.animalsRequired");
    }
    if (s === 5) {
      if (!data.consent.acceptData || !data.consent.acceptTruth) return t("form.termsRequired");
    }
    return null;
  };

  const next = () => {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };
  const prev = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const buildWhatsAppMessage = () => {
    const p = data.profile;
    const cats = data.animals.categories.map((c) => t(`animals.${ANIMAL_LABEL[c]}`)).join(", ");
    const lines = [
      t("form.whatsappIntro"),
      "",
      `*${t("form.recapName")}*: ${p.prenom} ${p.nom}`,
      `*${t("form.recapElevage")}*: ${p.elevage}`,
      `*${t("form.email")}*: ${p.email}`,
      `*${t("form.telephone")}*: ${p.telephone}`,
      `*${t("form.recapLocation")}*: ${resolvedCountry}${data.location.city ? `, ${data.location.city}` : ""}`,
      `*${t("form.recapStatut")}*: ${t(`form.${STATUS_LABEL[p.statut]}`)}`,
      `*${t("form.recapAnimals")}*: ${cats || t("form.recapNone")}`,
      `*${t("form.recapBreeds")}*: ${data.animals.breeds || t("form.recapNone")}`,
      `*${t("form.recapCount")}*: ${data.animals.count || t("form.recapNone")}`,
      "",
      t("form.whatsappOutro"),
    ];
    return encodeURIComponent(lines.join("\n"));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep(5);
    if (err) {
      setError(err);
      setStep(5);
      return;
    }
    actionSubmitBreederApplication({
      name: `${data.profile.prenom} ${data.profile.nom}`.trim() || data.profile.elevage || "Breeder Applicant",
      email: data.profile.email,
      phone: data.profile.telephone,
      whatsapp: data.profile.whatsapp,
      kennelName: data.profile.elevage,
      city: data.location.city,
      country: data.location.country,
      statusType: data.profile.statut,
      experienceYears: data.profile.experience,
      notes: data.animals.notes,
      rawPayload: JSON.stringify(data),
    }).catch(console.error);

    window.open(`https://wa.me/${PARTNERSHIP_WHATSAPP}?text=${buildWhatsAppMessage()}`, "_blank", "noopener");
  };

  const benefits = ["visibility", "presentation", "audience", "support", "matching", "transparency"] as const;
  const whoItems = [1, 2, 3, 4, 5, 6];
  const processSteps = [1, 2, 3, 4, 5];
  const complianceItems = [1, 2, 3, 4, 5, 6];
  const docItems = [1, 2, 3, 4, 5, 6, 7];
  const depositFactors = [1, 2, 3, 4, 5];
  const faqItems = [1, 2, 3, 4, 5, 6, 7, 8];
  const depositCountries = Object.keys(DEPOSIT_INDICATIONS).filter((c) => c !== "__default").slice(0, 6);

  const stepMeta = [
    { icon: User, label: t("form.step1") },
    { icon: MapPin, label: t("form.step2") },
    { icon: Dog, label: t("form.step3") },
    { icon: FileText, label: t("form.step4") },
    { icon: ShieldCheck, label: t("form.step5") },
    { icon: MessageSquare, label: t("form.step6") },
  ];

  const whatsappContact = `https://wa.me/${PARTNERSHIP_WHATSAPP}`;

  return (
    <div className="bg-bg-premium">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-black/[0.04] dark:border-white/[0.04]">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-extrabold uppercase tracking-widest">
            <Sparkles className="h-4 w-4" />
            {t("hero.badge")}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black font-heading text-text-premium tracking-tight leading-tight">
            {t("hero.title")}
          </h1>
          <p className="text-base sm:text-lg text-text-premium/75 leading-relaxed max-w-2xl mx-auto">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href="#candidature"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary hover:bg-primary-hover text-white font-extrabold text-sm shadow-lg transition-all hover:scale-[1.02]"
            >
              {t("hero.cta")}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={whatsappContact}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg transition-all hover:scale-[1.02]"
            >
              <MessageSquare className="h-4 w-4" />
              {t("hero.cta2")}
            </a>
          </div>
          <p className="text-xs text-text-premium/50 max-w-xl mx-auto pt-2">{t("hero.reassurance")}</p>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl font-black font-heading text-text-premium">{t("benefits.title")}</h2>
          <p className="text-sm text-text-premium/70">{t("benefits.subtitle")}</p>
          <div className="h-1 w-16 bg-primary mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <div
              key={b}
              className="p-6 rounded-2xl bg-white dark:bg-black/20 border border-black/[0.05] dark:border-white/[0.06] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
            >
              <CheckCircle2 className="h-7 w-7 text-primary mb-4" />
              <h3 className="text-base font-extrabold font-heading text-text-premium mb-1.5">
                {t(`benefits.${b}Title`)}
              </h3>
              <p className="text-sm text-text-premium/65 leading-relaxed">{t(`benefits.${b}Desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who + Which animals */}
      <section className="bg-white dark:bg-black/20 border-y border-black/[0.05] dark:border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-14">
          <div className="space-y-5">
            <h2 className="text-2xl font-black font-heading text-text-premium">{t("who.title")}</h2>
            <ul className="space-y-3">
              {whoItems.map((i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-text-premium/75">
                  <Handshake className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  {t(`who.item${i}`)}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-5">
            <h2 className="text-2xl font-black font-heading text-text-premium">{t("animals.title")}</h2>
            <p className="text-sm text-text-premium/65">{t("animals.subtitle")}</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Dog, key: "dogs" },
                { icon: Dog, key: "puppies" },
                { icon: Cat, key: "cats" },
                { icon: Cat, key: "kittens" },
              ].map(({ icon: Icon, key }) => (
                <div
                  key={key}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-bg-premium"
                >
                  <Icon className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-extrabold text-text-premium">{t(`animals.${key}`)}</p>
                    <p className="text-[11px] text-text-premium/55">
                      {t("animals.male")} · {t("animals.female")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black font-heading text-text-premium">{t("process.title")}</h2>
          <div className="h-1 w-16 bg-primary mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
          {processSteps.map((n) => (
            <div key={n} className="flex flex-col items-center text-center space-y-3">
              <div className="relative">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-black text-primary">
                  {`0${n}`}
                </div>
              </div>
              <h3 className="text-sm font-extrabold text-text-premium">{t(`process.step${n}Title`)}</h3>
              <p className="text-xs text-text-premium/60 leading-relaxed">{t(`process.step${n}Desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section id="candidature" className="bg-white dark:bg-black/20 border-y border-black/[0.05] dark:border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-3xl font-black font-heading text-text-premium">{t("form.title")}</h2>
            <p className="text-sm text-text-premium/65">{t("form.subtitle")}</p>
          </div>

          {/* Progress */}
          <div className="mb-10">
            <div className="flex justify-between items-center relative">
              <div className="absolute left-0 top-5 w-full h-1 bg-black/5 dark:bg-white/10 -z-10 rounded-full" />
              <div
                className="absolute left-0 top-5 h-1 bg-primary -z-10 rounded-full transition-all duration-500"
                style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
              />
              {stepMeta.map((s, i) => {
                const Icon = s.icon;
                const active = step >= i + 1;
                return (
                  <div key={i} className={`flex flex-col items-center gap-2 ${active ? "opacity-100" : "opacity-40"}`}>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        active
                          ? "bg-primary border-primary text-white"
                          : "bg-bg-premium border-black/15 dark:border-white/20 text-text-premium"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold hidden sm:block text-text-premium/70">{s.label}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-center text-xs font-bold text-text-premium/50 mt-4">
              {t("form.stepOf", { current: step, total: TOTAL_STEPS })}
            </p>
          </div>

          <form
            onSubmit={submit}
            className="bg-bg-premium p-6 sm:p-9 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-6"
          >
            {/* Step 1 — profile */}
            {step === 1 && (
              <div className="space-y-5">
                <h3 className="text-xl font-black font-heading text-text-premium">{t("form.profileTitle")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>{t("form.prenom")} *</label>
                    <input
                      className={inputClass}
                      value={data.profile.prenom}
                      onChange={(e) => set("profile", { prenom: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t("form.nom")} *</label>
                    <input
                      className={inputClass}
                      value={data.profile.nom}
                      onChange={(e) => set("profile", { nom: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>{t("form.elevage")} *</label>
                    <input
                      className={inputClass}
                      value={data.profile.elevage}
                      onChange={(e) => set("profile", { elevage: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t("form.email")} *</label>
                    <input
                      type="email"
                      className={inputClass}
                      value={data.profile.email}
                      onChange={(e) => set("profile", { email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t("form.telephone")} *</label>
                    <input
                      className={inputClass}
                      value={data.profile.telephone}
                      onChange={(e) => set("profile", { telephone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      {t("form.whatsapp")} <span className="lowercase font-normal">({t("form.optional")})</span>
                    </label>
                    <input
                      className={inputClass}
                      value={data.profile.whatsapp}
                      onChange={(e) => set("profile", { whatsapp: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      {t("form.website")} <span className="lowercase font-normal">({t("form.optional")})</span>
                    </label>
                    <input
                      className={inputClass}
                      value={data.profile.website}
                      onChange={(e) => set("profile", { website: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>
                      {t("form.social")} <span className="lowercase font-normal">({t("form.optional")})</span>
                    </label>
                    <input
                      className={inputClass}
                      value={data.profile.social}
                      onChange={(e) => set("profile", { social: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t("form.statut")}</label>
                    <select
                      className={inputClass}
                      value={data.profile.statut}
                      onChange={(e) => set("profile", { statut: e.target.value as PartnerStatus })}
                    >
                      {PARTNER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {t(`form.${STATUS_LABEL[s]}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t("form.experience")}</label>
                    <select
                      className={inputClass}
                      value={data.profile.experience}
                      onChange={(e) => set("profile", { experience: e.target.value as PartnerExperience })}
                    >
                      {PARTNER_EXPERIENCES.map((x) => (
                        <option key={x} value={x}>
                          {t(`form.${EXPERIENCE_LABEL[x]}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — location */}
            {step === 2 && (
              <div className="space-y-5">
                <h3 className="text-xl font-black font-heading text-text-premium">{t("form.locationTitle")}</h3>
                <div>
                  <label className={labelClass}>{t("form.country")} *</label>
                  <select
                    className={inputClass}
                    value={data.location.country}
                    onChange={(e) => set("location", { country: e.target.value })}
                  >
                    {PARTNER_COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c === "__other" ? t("form.otherCountry") : c}
                      </option>
                    ))}
                  </select>
                </div>
                {data.location.country === "__other" && (
                  <div>
                    <label className={labelClass}>{t("form.otherCountry")} *</label>
                    <input
                      className={inputClass}
                      placeholder={t("form.otherCountryPlaceholder")}
                      value={data.location.otherCountry}
                      onChange={(e) => set("location", { otherCountry: e.target.value })}
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>{t("form.city")} *</label>
                    <input
                      className={inputClass}
                      value={data.location.city}
                      onChange={(e) => set("location", { city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      {t("form.region")} <span className="lowercase font-normal">({t("form.optional")})</span>
                    </label>
                    <input
                      className={inputClass}
                      value={data.location.region}
                      onChange={(e) => set("location", { region: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — animals */}
            {step === 3 && (
              <div className="space-y-5">
                <h3 className="text-xl font-black font-heading text-text-premium">{t("form.animalsTitle")}</h3>
                <p className="text-sm text-text-premium/65">{t("form.animalsDesc")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ANIMAL_CATEGORIES.map((cat) => {
                    const checked = data.animals.categories.includes(cat);
                    return (
                      <label
                        key={cat}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                          checked
                            ? "border-primary bg-primary/5"
                            : "border-black/10 dark:border-white/15 hover:border-primary/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-primary"
                          checked={checked}
                          onChange={() => toggleCategory(cat)}
                        />
                        <span className="text-sm text-text-premium">{t(`animals.${ANIMAL_LABEL[cat]}`)}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>{t("form.breeds")}</label>
                    <input
                      className={inputClass}
                      placeholder={t("form.breedsPlaceholder")}
                      value={data.animals.breeds}
                      onChange={(e) => set("animals", { breeds: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t("form.animalCount")}</label>
                    <input
                      className={inputClass}
                      inputMode="numeric"
                      value={data.animals.count}
                      onChange={(e) => set("animals", { count: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>
                    {t("form.animalNotes")} <span className="lowercase font-normal">({t("form.optional")})</span>
                  </label>
                  <textarea
                    className={`${inputClass} min-h-24`}
                    placeholder={t("form.animalNotesPlaceholder")}
                    value={data.animals.notes}
                    onChange={(e) => set("animals", { notes: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Step 4 — documents */}
            {step === 4 && (
              <div className="space-y-5">
                <h3 className="text-xl font-black font-heading text-text-premium">{t("form.documentsTitle")}</h3>
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-sm text-text-premium/80 flex items-start gap-2">
                  <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
                  {t("documents.note")}
                </div>
                <div className="space-y-3">
                  {(
                    [
                      "hasProPhotos",
                      "hasRecentPhotos",
                      "hasVideos",
                      "hasParentPhotos",
                      "hasPedigree",
                      "hasVetDocs",
                      "hasGeneticTests",
                    ] as const
                  ).map((key) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 p-3.5 rounded-xl border border-black/10 dark:border-white/15 cursor-pointer hover:border-primary/40 transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-primary"
                        checked={data.documents[key]}
                        onChange={(e) => set("documents", { [key]: e.target.checked })}
                      />
                      <span className="text-sm text-text-premium">{t(`form.${key}`)}</span>
                    </label>
                  ))}
                </div>
                <div className="flex items-start gap-2 text-sm text-text-premium/70">
                  <MessageSquare className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                  <p>{t("form.uploadNote")}</p>
                </div>
              </div>
            )}

            {/* Step 5 — conditions */}
            {step === 5 && (
              <div className="space-y-5">
                <h3 className="text-xl font-black font-heading text-text-premium">{t("form.conditionsTitle")}</h3>

                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                  <h4 className="font-extrabold text-text-premium">{t("deposit.title")}</h4>
                  <p className="text-sm text-text-premium/70">{t("deposit.disclaimer")}</p>
                  <div className="flex items-center justify-between mt-3 rounded-xl bg-white dark:bg-black/25 px-4 py-3 text-sm font-bold">
                    <span className="text-text-premium/70">{resolvedCountry}</span>
                    <span className="text-primary">{depositIndication}</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                  <h4 className="font-extrabold text-text-premium flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-amber-600" />
                    {t("warning.title")}
                  </h4>
                  <p className="text-sm text-text-premium/70">{t("warning.body")}</p>
                </div>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-black/10 dark:border-white/15 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-primary mt-0.5"
                    checked={data.consent.acceptData}
                    onChange={(e) => set("consent", { acceptData: e.target.checked })}
                  />
                  <span className="text-sm text-text-premium/80">
                    {t("form.acceptData")}{" "}
                    <Link href="/politique-de-confidentialite" className="text-primary underline">
                      {t("form.privacyLink")}
                    </Link>
                  </span>
                </label>
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-black/10 dark:border-white/15 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-primary mt-0.5"
                    checked={data.consent.acceptTruth}
                    onChange={(e) => set("consent", { acceptTruth: e.target.checked })}
                  />
                  <span className="text-sm text-text-premium/80">{t("form.acceptTruth")}</span>
                </label>
              </div>
            )}

            {/* Step 6 — recap + send */}
            {step === 6 && (
              <div className="space-y-5">
                <h3 className="text-xl font-black font-heading text-text-premium">{t("form.whatsappTitle")}</h3>
                <p className="text-sm text-text-premium/70">{t("form.whatsappBody")}</p>

                <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-black/25 divide-y divide-black/[0.05] dark:divide-white/[0.06]">
                  {[
                    { label: t("form.recapName"), value: `${data.profile.prenom} ${data.profile.nom}` },
                    { label: t("form.recapElevage"), value: data.profile.elevage },
                    { label: t("form.recapLocation"), value: `${resolvedCountry}${data.location.city ? `, ${data.location.city}` : ""}` },
                    { label: t("form.recapStatut"), value: t(`form.${STATUS_LABEL[data.profile.statut]}`) },
                    {
                      label: t("form.recapAnimals"),
                      value:
                        data.animals.categories.map((c) => t(`animals.${ANIMAL_LABEL[c]}`)).join(", ") ||
                        t("form.recapNone"),
                    },
                    { label: t("form.recapBreeds"), value: data.animals.breeds || t("form.recapNone") },
                    { label: t("form.recapCount"), value: data.animals.count || t("form.recapNone") },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between gap-4 px-4 py-3 text-sm">
                      <span className="text-text-premium/55 font-semibold shrink-0">{row.label}</span>
                      <span className="text-text-premium text-right">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm font-bold text-red-600 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-black/[0.06] dark:border-white/[0.08]">
              <button
                type="button"
                onClick={prev}
                className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-text-premium/70 hover:text-primary transition-colors ${
                  step === 1 ? "invisible" : ""
                }`}
              >
                <ArrowLeft className="h-4 w-4" />
                {t("form.prev")}
              </button>
              {step < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-extrabold transition-colors"
                >
                  {t("form.next")}
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold shadow-lg transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  {t("form.submit")}
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Deposit detail */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-6">
        <h2 className="text-2xl font-black font-heading text-text-premium">{t("deposit.title")}</h2>
        <p className="text-sm text-text-premium/70 leading-relaxed">{t("deposit.intro")}</p>
        <p className="text-sm font-bold text-text-premium">{t("deposit.factorsTitle")}</p>
        <ul className="space-y-2">
          {depositFactors.map((i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-text-premium/70">
              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              {t(`deposit.factor${i}`)}
            </li>
          ))}
        </ul>
        <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] overflow-hidden">
          <p className="px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-text-premium/55 bg-black/[0.02] dark:bg-white/[0.03]">
            {t("deposit.byCountryTitle")}
          </p>
          <div className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
            {depositCountries.map((c) => (
              <div key={c} className="flex justify-between px-4 py-2.5 text-sm">
                <span className="text-text-premium/75">{c}</span>
                <span className="text-primary font-semibold">{t("deposit.toConfirm")}</span>
              </div>
            ))}
            <div className="flex justify-between px-4 py-2.5 text-sm">
              <span className="text-text-premium/75">{t("form.otherCountry")}</span>
              <span className="text-primary font-semibold">{t("deposit.customStudy")}</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-text-premium/55">{t("deposit.disclaimer")}</p>
      </section>

      {/* Compliance + documents */}
      <section className="bg-white dark:bg-black/20 border-y border-black/[0.05] dark:border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-14">
          <div className="space-y-5">
            <h2 className="text-2xl font-black font-heading text-text-premium">{t("compliance.title")}</h2>
            <p className="text-sm text-text-premium/70">{t("compliance.intro")}</p>
            <ul className="space-y-3">
              {complianceItems.map((i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-text-premium/75">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  {t(`compliance.item${i}`)}
                </li>
              ))}
            </ul>
            <p className="text-xs text-text-premium/55 border-l-2 border-amber-400 pl-3">{t("compliance.prohibited")}</p>
          </div>
          <div className="space-y-5">
            <h2 className="text-2xl font-black font-heading text-text-premium">{t("documents.title")}</h2>
            <p className="text-sm text-text-premium/70">{t("documents.intro")}</p>
            <ul className="space-y-3">
              {docItems.map((i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-text-premium/75">
                  <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  {t(`documents.list${i}`)}
                </li>
              ))}
            </ul>
            <p className="text-xs text-text-premium/55">{t("documents.note")}</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black font-heading text-text-premium">{t("faq.title")}</h2>
          <div className="h-1 w-16 bg-primary mx-auto rounded-full" />
        </div>
        <div className="space-y-4">
          {faqItems.map((i) => (
            <details
              key={i}
              className="group p-5 rounded-2xl border border-black/[0.05] dark:border-white/[0.06] bg-white dark:bg-black/20 open:border-primary/20"
            >
              <summary className="flex items-start gap-3 list-none font-extrabold text-sm text-text-premium group-open:text-primary cursor-pointer">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                {t(`faq.q${i}`)}
              </summary>
              <p className="text-sm text-text-premium/70 leading-relaxed pl-8 mt-3">{t(`faq.a${i}`)}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary p-10 sm:p-14 text-center text-white shadow-2xl shadow-primary/20 space-y-5">
          <Award className="h-8 w-8 mx-auto text-white/80" />
          <h2 className="text-2xl sm:text-3xl font-black font-heading">{t("hero.title")}</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#candidature"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-primary font-extrabold text-sm shadow-lg hover:scale-[1.02] transition-transform"
            >
              {t("hero.cta")}
            </a>
            <a
              href={whatsappContact}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-extrabold text-sm transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              {t("hero.cta2")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
