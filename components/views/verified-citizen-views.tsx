"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, CheckCircle2, MapPin, Mic, ShieldCheck, Sparkles, TriangleAlert, UserRound, Phone, Camera } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { MultiPhotoCapture, type CapturedPhoto } from "@/components/multi-photo-capture";
import { PhoneOtpVerification } from "@/components/phone-otp-verification";
import { RequiredAiScreening } from "@/components/required-ai-screening";
import { VoiceReportingModal } from "@/components/voice-reporting-modal";
import { GPSLocationPicker } from "@/components/gps-location-picker";
import { SiteLink as Link } from "@/components/site-link";
import { buildings } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import type { AiPhotoAnalysis } from "@/types";

function PublicHeader() {
  return (
    <header className="border-b border-[#dfe6e1] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="AccessTrack home">
          <BrandLogo tagline="Access into action" />
        </Link>
        <nav className="flex items-center gap-2 text-sm font-bold">
          <Link className="hidden rounded-xl px-4 py-2.5 hover:bg-[#f2f6f3] sm:block" href="/buildings">
            Buildings
          </Link>
          <Link
            className="rounded-xl bg-[#12382d] px-4 py-2.5 text-white shadow-[0_8px_20px_rgba(18,56,45,.16)]"
            href="/login"
          >
            Demo login
          </Link>
        </nav>
      </div>
    </header>
  );
}

export const problemTypes = [
  "Wheelchair Ramp",
  "Accessible Toilet",
  "Lift",
  "Parking",
  "Entrance",
  "Handrail",
  "Tactile Path",
  "Signage",
  "Door / Corridor",
  "Other"
] as const;

const reportSchema = z.object({
  citizenName: z.string().min(2, "Your name is required"),
  buildingId: z.string().min(1, "Please choose a building or place"),
  problemType: z.string().min(1, "Please select the type of problem"),
  description: z.string().min(10, "Please describe the problem in detail (minimum 10 characters)"),
  location: z.string().min(2, "Location is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  email: z.string().email("Enter a valid email address").or(z.literal("")).optional()
});

type ReportForm = z.infer<typeof reportSchema>;

const fieldClass =
  "mt-2 w-full rounded-xl border border-[#c9d4ce] bg-white px-4 py-3.5 font-normal outline-none transition focus:border-[#0b5d45] focus:ring-4 focus:ring-[#0b5d45]/10";

export function ReportProblemView() {
  const { submitReport } = useStore();
  const [submitted, setSubmitted] = useState<{ id: string; phone: string; photoCount: number; building: string } | null>(null);
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [aiReady, setAiReady] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<AiPhotoAnalysis | undefined>(undefined);
  const [formError, setFormError] = useState("");
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      citizenName: "",
      buildingId: "bld-01",
      problemType: "Wheelchair Ramp",
      description: "",
      location: "",
      email: ""
    }
  });

  const selectedProblemType = watch("problemType");
  const selectedBuildingId = watch("buildingId");
  const citizenName = watch("citizenName");
  const descriptionValue = watch("description");

  const hasPhotos = photos.length > 0;
  const allPhotosClear = hasPhotos && photos.every((p) => p.quality === "CLEAR");
  const ready = Boolean(verifiedPhone && allPhotosClear && aiReady);

  const onSubmit = (values: ReportForm) => {
    if (!verifiedPhone) {
      setFormError("Phone verification is mandatory. Please enter and verify your mobile number with OTP.");
      return;
    }
    if (!photos.length) {
      setFormError("Proof photo is mandatory. The complaint cannot be submitted without a proof photo.");
      return;
    }
    if (photos.some((p) => p.quality !== "CLEAR")) {
      setFormError("Please remove or retake any photo marked 'Retake needed'. Photos must be clear.");
      return;
    }
    if (!aiReady) {
      setFormError("Please wait for AI preliminary photo assessment to complete.");
      return;
    }

    const report = submitReport({
      citizenName: values.citizenName,
      buildingId: values.buildingId,
      category: values.problemType,
      description: values.description,
      location: values.location,
      latitude: values.latitude,
      longitude: values.longitude,
      phone: verifiedPhone,
      email: values.email,
      photos: photos.map(({ preview: _p, qualityMessage: _q, ...photo }) => photo),
      aiSummary,
      aiAnalysis
    });

    const buildingObj = buildings.find((b) => b.id === values.buildingId);
    setSubmitted({
      id: report.id,
      phone: verifiedPhone,
      photoCount: photos.length,
      building: buildingObj?.name || "Selected Facility"
    });
  };

  const handleVoiceExtracted = (extracted: {
    buildingId?: string;
    problemType?: string;
    location?: string;
    description?: string;
    citizenName?: string;
  }) => {
    if (extracted.buildingId) setValue("buildingId", extracted.buildingId, { shouldValidate: true });
    if (extracted.problemType) setValue("problemType", extracted.problemType, { shouldValidate: true });
    if (extracted.location) setValue("location", extracted.location, { shouldValidate: true });
    if (extracted.description) setValue("description", extracted.description, { shouldValidate: true });
    if (extracted.citizenName && extracted.citizenName !== "Citizen Reporter") {
      setValue("citizenName", extracted.citizenName, { shouldValidate: true });
    }
    setVoiceModalOpen(false);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f3f6f4]">
        <PublicHeader />
        <div className="mx-auto max-w-2xl px-5 py-16">
          <section className="rounded-[2rem] border border-[#cde2d7] bg-white p-7 text-center shadow-[0_20px_60px_rgba(20,45,34,.12)] sm:p-10">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={36} />
            </span>
            <p className="mt-5 text-xs font-black uppercase tracking-wider text-[#0b5d45]">
              Complaint Submitted Successfully
            </p>
            <h1 className="mt-2 text-3xl font-black text-[#12382d]">Complaint ID:</h1>
            <p className="mt-1 text-4xl font-black tracking-tight text-[#e56532]">{submitted.id}</p>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#66736c]">
              Your verified report for <strong>{submitted.building}</strong> with {submitted.photoCount} clear photo
              {submitted.photoCount === 1 ? "" : "s"} and AI preliminary screening has been forwarded to the certified auditor review queue.
            </p>

            <div className="mt-6 grid gap-3 rounded-2xl bg-[#f1f7f4] p-4 text-left text-sm sm:grid-cols-2">
              <div>
                <strong className="block text-xs uppercase tracking-wider text-[#718078]">Verified Phone</strong>
                <span className="font-black text-[#152e25]">+91 ••••• {submitted.phone.slice(-4)} ✓</span>
              </div>
              <div>
                <strong className="block text-xs uppercase tracking-wider text-[#718078]">Current Workflow Stage</strong>
                <span className="font-black text-[#0b5d45]">1. Auditor Review Queue</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={`/citizen/reports/${submitted.id}`}
                className="rounded-xl bg-[#0b5d45] px-6 py-3.5 font-black text-white hover:bg-[#084836]"
              >
                Track Complaint Status
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(null);
                  setPhotos([]);
                  setAiReady(false);
                  setValue("description", "");
                  setValue("location", "");
                }}
                className="rounded-xl border border-[#ccd6d0] bg-white px-5 py-3.5 font-bold hover:bg-[#f3f7f5]"
              >
                Report Another Problem
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f6f4]">
      <PublicHeader />
      <div className="mx-auto grid max-w-6xl gap-7 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_360px]">
        <section>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#5e6c64] hover:text-black">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#e8f3ee] px-3 py-1.5 text-xs font-black uppercase tracking-wider text-[#0b5d45]">
              Citizen Accountability Platform
            </span>
            <span className="rounded-full bg-[#fff0e9] px-3 py-1.5 text-xs font-black uppercase tracking-wider text-[#bd481d]">
              AI Screening Mandatory
            </span>
          </div>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-[#17231d]">
            Report an Accessibility Problem
          </h1>
          <p className="mt-2 text-[#66736c]">
            Citizen reports go directly to authorized auditors and building departments with mandatory evidence and transparent tracking.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-7 space-y-6 rounded-[2rem] border border-[#dfe6e1] bg-white p-5 shadow-[0_14px_40px_rgba(20,45,34,.06)] sm:p-8"
          >
            {/* 1. Name & 2. Building */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-extrabold text-[#17231d]">
                1. Your Name <span className="text-[#c44b23]">*</span>
                <input
                  {...register("citizenName")}
                  autoComplete="name"
                  className={fieldClass}
                  placeholder="Enter your full name"
                />
                {errors.citizenName && (
                  <span className="mt-1 block text-xs font-bold text-red-700">{errors.citizenName.message}</span>
                )}
              </label>

              <label className="block text-sm font-extrabold text-[#17231d]">
                2. Building / Place <span className="text-[#c44b23]">*</span>
                <select {...register("buildingId")} className={fieldClass}>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.ownership})
                    </option>
                  ))}
                </select>
                {errors.buildingId && (
                  <span className="mt-1 block text-xs font-bold text-red-700">{errors.buildingId.message}</span>
                )}
              </label>
            </div>

            {/* 3. Problem Type */}
            <label className="block text-sm font-extrabold text-[#17231d]">
              3. Type of Problem <span className="text-[#c44b23]">*</span>
              <select {...register("problemType")} className={fieldClass}>
                {problemTypes.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
              {errors.problemType && (
                <span className="mt-1 block text-xs font-bold text-red-700">{errors.problemType.message}</span>
              )}
            </label>

            {/* 4. Description */}
            <label className="block text-sm font-extrabold text-[#17231d]">
              4. Describe the Problem <span className="text-[#c44b23]">*</span>
              <textarea
                {...register("description")}
                rows={4}
                placeholder="Example: There is no wheelchair ramp at the main entrance of Government Hospital. Wheelchair users cannot access the OPD."
                className={fieldClass}
              />
              {errors.description && (
                <span className="mt-1 block text-xs font-bold text-red-700">{errors.description.message}</span>
              )}
            </label>

            {/* Voice reporting optional button */}
            <button
              type="button"
              onClick={() => setVoiceModalOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#fff3ed] px-4 py-3.5 font-extrabold text-[#bd481d] transition hover:bg-[#ffe8dc]"
            >
              <Mic size={20} />
              🎤 Report by Voice (Multilingual AI)
            </button>

            {/* 5. Location */}
            <section className="rounded-2xl border border-[#cddbd4] bg-[#f8fbf9] p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e6f2ec] text-[#0b5d45]">
                  <MapPin size={19} />
                </span>
                <div>
                  <h3 className="font-black text-[#12382d]">
                    5. GPS &amp; Location Identification <span className="text-[#c44b23]">*</span>
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[#66736c]">
                    Fetch your GPS location automatically to identify the exact building, road, and coordinates. You can also fine-tune on the map.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <GPSLocationPicker
                  buildings={buildings}
                  selectedBuildingId={selectedBuildingId || "bld-01"}
                  onBuildingSelect={(bId) => setValue("buildingId", bId, { shouldValidate: true })}
                  onLocationFound={(locText, lat, lng) => {
                    setValue("location", locText, { shouldValidate: true });
                    setValue("latitude", lat);
                    setValue("longitude", lng);
                  }}
                  currentLocationText={watch("location")}
                  currentLat={watch("latitude")}
                  currentLng={watch("longitude")}
                  inputClass={fieldClass}
                />

                <label className="mt-4 block text-sm font-bold text-[#23352c]">
                  Detailed Entrance / Landmark Note (Editable)
                  <input
                    {...register("location")}
                    placeholder="e.g., Main entrance, East Gate, ground floor corridor…"
                    className={fieldClass}
                  />
                  {errors.location && (
                    <span className="mt-1 block text-xs font-bold text-red-700">{errors.location.message}</span>
                  )}
                </label>
              </div>
            </section>

            {/* 6. Proof Photo (MANDATORY) */}
            <div className="space-y-2">
              <MultiPhotoCapture
                photos={photos}
                onChange={(next) => {
                  setPhotos(next);
                  setAiReady(false);
                  setFormError("");
                }}
                label="6. Proof Photo (Mandatory)"
                maxPhotos={6}
              />
              {!hasPhotos && (
                <p className="text-xs font-bold text-amber-800 flex items-center gap-1 mt-1">
                  <TriangleAlert size={14} /> Photo is mandatory. The complaint cannot be submitted without a proof photo.
                </p>
              )}
            </div>

            {/* AI Photo Screening (Active) */}
            <RequiredAiScreening
              photos={photos}
              category={selectedProblemType}
              description={descriptionValue}
              onComplete={(complete, summary, analysis) => {
                setAiReady(complete);
                setAiSummary(summary);
                setAiAnalysis(analysis);
              }}
            />

            {/* 7. Phone (MANDATORY & OTP Verified) */}
            <div>
              <label className="block text-sm font-extrabold text-[#17231d] mb-2">
                7. Phone Number (Mandatory OTP Verification) <span className="text-[#c44b23]">*</span>
              </label>
              <PhoneOtpVerification
                profileName={citizenName}
                onVerified={(phone) => {
                  setVerifiedPhone(phone);
                  setFormError("");
                }}
              />
            </div>

            {/* 8. Email (Optional) */}
            <details className="rounded-xl border border-[#dfe6e1] bg-[#f8faf9] p-4">
              <summary className="cursor-pointer text-sm font-bold text-[#293d33]">
                8. Email Address (Optional)
              </summary>
              <label className="mt-3 block text-xs font-bold text-[#5a6b62]">
                Your Email (for notification updates)
                <input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  placeholder="your.email@example.com"
                  className={fieldClass}
                />
              </label>
              {errors.email && (
                <span className="mt-1 block text-xs font-bold text-red-700">{errors.email.message}</span>
              )}
            </details>

            {/* Form Error Banner */}
            {formError && (
              <p className="flex items-start gap-2 rounded-xl bg-red-50 p-3.5 text-sm font-bold text-red-800" role="alert">
                <TriangleAlert size={18} className="mt-0.5 shrink-0" />
                {formError}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!ready || isSubmitting}
              className="w-full rounded-xl bg-[#e15f2a] px-5 py-4 text-lg font-black text-white shadow-[0_10px_25px_rgba(225,95,42,.22)] transition hover:bg-[#c94f1f] disabled:bg-[#b9c1bd] disabled:shadow-none"
            >
              {ready ? "Submit Complaint" : "Complete Mandatory Photo, AI & OTP Checks to Submit"}
            </button>
          </form>
        </section>

        {/* Sidebar info */}
        <aside className="space-y-4 lg:pt-[108px]">
          <div className="rounded-2xl bg-[#12382d] p-6 text-white">
            <h2 className="font-black text-lg">Mandatory Submission Gates</h2>
            <ul className="mt-4 space-y-4 text-sm">
              {[
                [UserRound, "Your Name & Problem Details"],
                [MapPin, "Browser Geolocation / Address"],
                [Camera, "Proof Photo (Live Camera or Upload)"],
                [Sparkles, "AI Preliminary Photo Assessment"],
                [Phone, "Mobile Number Verified via OTP"]
              ].map(([Icon, text]) => {
                const ItemIcon = Icon as typeof ShieldCheck;
                return (
                  <li key={text as string} className="flex gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/10 text-white">
                      <ItemIcon size={16} />
                    </span>
                    <span className="pt-1 text-[#d2e2dc] font-bold">{text as string}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-2xl border border-[#dfe6e1] bg-white p-5 text-sm text-[#66736c]">
            <p className="font-black text-[#17231d] flex items-center gap-1.5">
              <ShieldCheck size={17} className="text-[#0b5d45]" /> Privacy Protected
            </p>
            <p className="mt-2 leading-6">
              Your verified mobile number is used strictly for SMS progress notifications and auditor validation. It is never displayed publicly.
            </p>
          </div>
        </aside>
      </div>

      {/* Multilingual Voice Modal */}
      <VoiceReportingModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onConfirm={handleVoiceExtracted}
      />
    </main>
  );
}

export function RegisterView() {
  const { login } = useStore();
  const [name, setName] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState("");

  if (created) {
    return (
      <main className="min-h-screen bg-[#f3f6f4]">
        <PublicHeader />
        <div className="mx-auto max-w-xl px-5 py-16">
          <section className="rounded-[2rem] border border-emerald-200 bg-white p-8 text-center shadow-lg">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={36} />
            </span>
            <h1 className="mt-5 text-3xl font-black text-[#12382d]">Verified Citizen Workspace Ready</h1>
            <p className="mt-2 text-[#66736c]">
              Mobile number +91 ••••• {verifiedPhone?.slice(-4)} is verified.
            </p>
            <button
              onClick={() => {
                login("CITIZEN");
                window.location.assign("/citizen/dashboard");
              }}
              className="mt-7 w-full rounded-xl bg-[#0b5d45] px-5 py-4 font-black text-white hover:bg-[#074634]"
            >
              Open Citizen Dashboard
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f6f4]">
      <PublicHeader />
      <div className="mx-auto max-w-xl px-5 py-14">
        <section className="rounded-[2rem] border border-[#dfe6e1] bg-white p-7 shadow-[0_20px_60px_rgba(20,45,34,.1)]">
          <p className="text-xs font-black uppercase tracking-wider text-[#0b5d45]">Citizen Access</p>
          <h1 className="mt-2 text-3xl font-black text-[#12382d]">Create Verified Account</h1>
          <p className="mt-2 text-sm leading-6 text-[#66736c]">
            Phone number is mandatory. OTP verification protects your complaints and accountability updates.
          </p>

          <label className="mt-6 block text-sm font-bold">
            Full Name <span className="text-[#c44b23]">*</span>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              autoComplete="name"
              className={fieldClass}
              placeholder="Your full name"
            />
          </label>

          <div className="mt-4">
            <PhoneOtpVerification profileName={name} onVerified={setVerifiedPhone} />
          </div>

          {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-800">{error}</p>}

          <button
            type="button"
            onClick={() => {
              if (name.trim().length < 2) return setError("Please enter your full name.");
              if (!verifiedPhone) return setError("Please verify your mobile number with the OTP.");
              setCreated(true);
            }}
            disabled={!verifiedPhone}
            className="mt-5 w-full rounded-xl bg-[#0b5d45] px-5 py-4 font-black text-white hover:bg-[#084836] disabled:bg-[#a9b9b1]"
          >
            Create Verified Account
          </button>

          <p className="mt-5 text-center text-sm">
            Need a staff demo?{" "}
            <Link href="/login" className="font-bold text-[#0b5d45] hover:underline">
              Open Demo Login
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
