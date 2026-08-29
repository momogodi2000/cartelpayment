"use client";

import React, { useState } from "react";
import { CheckCircle2, MessageSquare, ArrowRight, ArrowLeft, Upload, FileCheck, Info } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { getWhatsAppLink } from "@/data/site";
import Image from "next/image";

export default function DevenirPartenairePage() {
  const { language } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    elevage: "",
    type: "eleveur",
    pays: "France",
    ville: "",
    telephone: "",
    email: "",
    experience: "1-3",
    nbChiens: "",
    races: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const message = `Bonjour, je souhaite soumettre une demande de partenariat sur CaniPrestige.\n\n` +
      `👤 Nom : ${formData.prenom} ${formData.nom}\n` +
      `🏢 Élevage : ${formData.elevage} (${formData.type})\n` +
      `🌍 Localisation : ${formData.ville}, ${formData.pays}\n` +
      `🐕 Races élevées : ${formData.races}\n` +
      `📊 Expérience : ${formData.experience} ans\n\n` +
      `Je souhaite poursuivre la procédure de vérification et transmettre les documents nécessaires (pièce d'identité, justificatif professionnel, carnets de santé UE).`;
      
    window.open(getWhatsAppLink(message), "_blank");
  };

  const isFr = language === "fr";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-extrabold uppercase tracking-widest">
          <FileCheck className="h-4 w-4" />
          {isFr ? "Espace Professionnels" : "Professionals Area"}
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-heading text-text-premium tracking-tight">
          {isFr ? "Devenir Partenaire CaniPrestige" : "Become a CaniPrestige Partner"}
        </h1>
        <p className="text-text-premium/70 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          {isFr 
            ? "Rejoignez le réseau d'excellence européen. Proposez vos chiens et chiots de race sur notre plateforme après vérification stricte."
            : "Join the European network of excellence. Offer your purebred dogs and puppies on our platform after strict verification."}
        </p>
      </div>

      <div className="bg-white dark:bg-bg-premium border border-black/[0.05] dark:border-white/[0.05] rounded-3xl p-8 sm:p-12 shadow-sm">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-neutral-100 dark:bg-white/5 z-0" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary z-0 transition-all duration-500"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
          
          {[1, 2, 3].map((num) => (
            <div key={num} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                step >= num ? "bg-primary text-white shadow-md" : "bg-neutral-100 text-neutral-400 dark:bg-white/10 dark:text-white/40"
              }`}>
                {step > num ? <CheckCircle2 className="h-5 w-5" /> : num}
              </div>
              <span className={`text-xs font-bold absolute -bottom-6 whitespace-nowrap ${
                step >= num ? "text-primary" : "text-neutral-400 dark:text-white/40"
              }`}>
                {num === 1 ? (isFr ? "Informations" : "Information") : num === 2 ? (isFr ? "Activité" : "Activity") : (isFr ? "Validation" : "Validation")}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 mt-16">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-black font-heading text-text-premium mb-6">
                {isFr ? "Informations du Partenaire" : "Partner Information"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-premium">{isFr ? "Prénom" : "First Name"} *</label>
                  <input required name="prenom" value={formData.prenom} onChange={handleChange} className="w-full p-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-premium">{isFr ? "Nom" : "Last Name"} *</label>
                  <input required name="nom" value={formData.nom} onChange={handleChange} className="w-full p-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-premium">{isFr ? "Nom de l'élevage / Entreprise" : "Breeding Name / Company"} *</label>
                  <input required name="elevage" value={formData.elevage} onChange={handleChange} className="w-full p-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-premium">{isFr ? "Type de professionnel" : "Professional Type"}</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full p-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent appearance-none">
                    <option value="eleveur">{isFr ? "Éleveur" : "Breeder"}</option>
                    <option value="dresseur">{isFr ? "Dresseur / Éducateur" : "Trainer / Educator"}</option>
                    <option value="autre">{isFr ? "Autre professionnel" : "Other professional"}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-black font-heading text-text-premium mb-6">
                {isFr ? "Activité & Localisation" : "Activity & Location"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-premium">{isFr ? "Pays" : "Country"} *</label>
                  <select name="pays" value={formData.pays} onChange={handleChange} className="w-full p-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent appearance-none">
                    <option value="France">France</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Suisse">Suisse</option>
                    <option value="Allemagne">Allemagne</option>
                    <option value="Pays-Bas">Pays-Bas</option>
                    <option value="Espagne">Espagne</option>
                    <option value="Italie">Italie</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-premium">{isFr ? "Ville" : "City"} *</label>
                  <input required name="ville" value={formData.ville} onChange={handleChange} className="w-full p-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-bold text-text-premium">{isFr ? "Races élevées" : "Breeds raised"} *</label>
                  <input required name="races" value={formData.races} onChange={handleChange} placeholder={isFr ? "Ex: Golden Retriever, Berger Allemand..." : "Ex: Golden Retriever, German Shepherd..."} className="w-full p-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-premium">{isFr ? "Années d'expérience" : "Years of experience"}</label>
                  <select name="experience" value={formData.experience} onChange={handleChange} className="w-full p-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent appearance-none">
                    <option value="1-3">1-3 ans</option>
                    <option value="3-5">3-5 ans</option>
                    <option value="5-10">5-10 ans</option>
                    <option value="10+">+ 10 ans</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-black font-heading text-text-premium mb-6">
                {isFr ? "Documents Requis & Validation" : "Required Documents & Validation"}
              </h2>
              
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-text-premium/80 leading-relaxed">
                    {isFr 
                      ? "En cliquant sur Valider, vous serez redirigé vers WhatsApp pour finaliser votre dossier directement avec notre équipe. Vous devrez nous transmettre les éléments suivants via la messagerie sécurisée :"
                      : "By clicking Validate, you will be redirected to WhatsApp to finalize your application directly with our team. You will need to send us the following via secure messaging:"}
                  </p>
                </div>
                
                <ul className="pl-12 space-y-2 text-sm font-bold text-text-premium">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {isFr ? "Pièce d'identité en cours de validité" : "Valid ID"}</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {isFr ? "Justificatif d'activité professionnelle" : "Proof of professional activity"}</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {isFr ? "Carnet de vaccination / Passeport UE des chiens" : "Dog vaccination records / EU Passport"}</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {isFr ? "Documents de Pedigree (LOF, VDH...)" : "Pedigree documents (LOF, VDH...)"}</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-8 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              onClick={handlePrev}
              className={`px-6 py-3 font-bold text-sm transition-opacity flex items-center gap-2 ${step === 1 ? "opacity-0 pointer-events-none" : "opacity-100 text-text-premium/60 hover:text-text-premium"}`}
            >
              <ArrowLeft className="h-4 w-4" />
              {isFr ? "Retour" : "Back"}
            </button>
            
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3 rounded-xl bg-text-premium text-white font-extrabold text-sm hover:scale-[1.02] transition-all flex items-center gap-2 shadow-lg"
              >
                {isFr ? "Étape Suivante" : "Next Step"}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm hover:scale-[1.02] transition-all flex items-center gap-2 shadow-lg"
              >
                <MessageSquare className="h-4 w-4" />
                {isFr ? "Valider & Ouvrir WhatsApp" : "Submit & Open WhatsApp"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
