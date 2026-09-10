"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, CheckCircle2, LocateFixed, MapPin, Mic, ShieldCheck, Sparkles, TriangleAlert, UserRound } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { MultiPhotoCapture, type CapturedPhoto } from "@/components/multi-photo-capture";
import { PhoneOtpVerification } from "@/components/phone-otp-verification";
import { RequiredAiScreening } from "@/components/required-ai-screening";
import { SiteLink as Link } from "@/components/site-link";
import { buildings } from "@/lib/mock-data";
import { useStore } from "@/lib/store";

function PublicHeader() {
  return <header className="border-b border-[#dfe6e1] bg-white/95 backdrop-blur"><div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8"><Link href="/" aria-label="AccessTrack home"><BrandLogo tagline="Access into action" /></Link><nav className="flex items-center gap-2 text-sm font-bold"><Link className="hidden rounded-xl px-4 py-2.5 hover:bg-[#f2f6f3] sm:block" href="/buildings">Buildings</Link><Link className="rounded-xl bg-[#12382d] px-4 py-2.5 text-white shadow-[0_8px_20px_rgba(18,56,45,.16)]" href="/login">Demo login</Link></nav></div></header>;
}

const reportSchema = z.object({
  citizenName: z.string().min(2, "Enter your name"),
  buildingId: z.string().min(1, "Choose a building"),
  category: z.string().min(1, "Choose the problem type"),
  description: z.string().min(10, "Please add a little more detail"),
  location: z.string().min(2, "Add where you saw the barrier"),
  email: z.string().email("Enter a valid email").or(z.literal("")),
});
type ReportForm = z.infer<typeof reportSchema>;

const fieldClass = "mt-2 w-full rounded-xl border border-[#c9d4ce] bg-white px-4 py-3.5 font-normal outline-none focus:border-[#0b5d45] focus:ring-4 focus:ring-[#0b5d45]/10";

export function ReportProblemView() {
  const { submitReport } = useStore();
  const [submitted, setSubmitted] = useState<{ id: string; phone: string; photoCount: number } | null>(null);
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [aiReady, setAiReady] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [formError, setFormError] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [listening, setListening] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
    defaultValues: { citizenName: "", buildingId: "bld-01", category: "RAMP", description: "", location: "", email: "" },
  });
  const category = watch("category");
  const citizenName = watch("citizenName");
  const ready = Boolean(verifiedPhone && photos.length && photos.every((photo) => photo.quality === "CLEAR") && aiReady);

  const onSubmit = (values: ReportForm) => {
    if (!verifiedPhone) return setFormError("Verify your mobile number before submitting.");
    if (!photos.length) return setFormError("Capture at least one proof photo.");
    if (photos.some((photo) => photo.quality !== "CLEAR")) return setFormError("Remove or retake every photo marked “Retake needed”.");
    if (!aiReady) return setFormError("Wait for the required AI screening to finish.");
    const report = submitReport({
      ...values,
      phone: verifiedPhone,
      photos: photos.map(({ preview: _preview, qualityMessage: _qualityMessage, ...photo }) => photo),
      aiSummary,
    });
    setSubmitted({ id: report.id, phone: verifiedPhone, photoCount: photos.length });
  };

  const useLocation = () => {
    setLocationStatus("Requesting location…");
    if (!navigator.geolocation) {
      setLocationStatus("Location is unavailable. Enter the address or landmark manually.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setValue("location", `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)} — add a nearby entrance or landmark`, { shouldValidate: true });
        setLocationStatus("Location attached. You can correct or add a landmark below.");
      },
      () => setLocationStatus("Location permission was denied. Enter the address or landmark manually."),
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 30_000 },
    );
  };

  const startVoice = () => {
    const SpeechRecognition = (window as unknown as { webkitSpeechRecognition?: new () => { lang: string; start: () => void; onresult: (event: { results: { 0: { transcript: string } }[] }) => void; onend: () => void; onerror: () => void } }).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setFormError("Voice input is not supported by this browser. Type the problem in the description field.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    setListening(true);
    setFormError("");
    recognition.onresult = (event) => setValue("description", event.results[0][0].transcript, { shouldValidate: true });
    recognition.onend = () => setListening(false);
    recognition.onerror = () => { setListening(false); setFormError("Voice input stopped. You can continue by typing."); };
    recognition.start();
  };

  if (submitted) return <main className="min-h-screen bg-[#f3f6f4]"><PublicHeader /><div className="mx-auto max-w-2xl px-5 py-16"><section className="rounded-[2rem] border border-[#cde2d7] bg-white p-7 text-center shadow-[0_20px_60px_rgba(20,45,34,.12)] sm:p-10"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 size={34} /></span><p className="mt-5 text-xs font-black uppercase tracking-wider text-[#0b5d45]">Complaint submitted successfully</p><h1 className="mt-2 text-3xl font-black">{submitted.id}</h1><p className="mx-auto mt-3 max-w-md text-[#66736c]">Your verified report, {submitted.photoCount} clear photo{submitted.photoCount === 1 ? "" : "s"}, location and AI preliminary assessment are now in the auditor review queue.</p><div className="mt-6 grid gap-3 rounded-2xl bg-[#f1f7f4] p-4 text-left text-sm sm:grid-cols-2"><p><strong className="block text-xs uppercase tracking-wider text-[#718078]">Phone</strong><span className="font-bold">+91 ••••• {submitted.phone.slice(-4)} ✓</span></p><p><strong className="block text-xs uppercase tracking-wider text-[#718078]">Next step</strong><span className="font-bold">Auditor review</span></p></div><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href={`/citizen/reports/${submitted.id}`} className="rounded-xl bg-[#0b5d45] px-5 py-3 font-bold text-white">Track this complaint</Link><button onClick={() => { setSubmitted(null); setPhotos([]); setAiReady(false); }} className="rounded-xl border border-[#ccd6d0] px-5 py-3 font-bold">Submit another</button></div></section></div></main>;

  return (
    <main className="min-h-screen bg-[#f3f6f4]">
      <PublicHeader />
      <div className="mx-auto grid max-w-6xl gap-7 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_360px]">
        <section>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#5e6c64]"><ArrowLeft size={16} />Back</Link>
          <div className="mt-6 flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#e8f3ee] px-3 py-1.5 text-xs font-black uppercase tracking-wider text-[#0b5d45]">Verified report</span><span className="rounded-full bg-[#fff0e9] px-3 py-1.5 text-xs font-black uppercase tracking-wider text-[#bd481d]">AI screened</span></div>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Report an accessibility problem</h1>
          <p className="mt-2 text-[#66736c]">Add what happened, where it happened, and clear live photo evidence.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5 rounded-[2rem] border border-[#dfe6e1] bg-white p-5 shadow-[0_14px_40px_rgba(20,45,34,.06)] sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-extrabold">Your name <span className="text-[#c44b23]">*</span><input {...register("citizenName")} autoComplete="name" className={fieldClass} placeholder="Full name" />{errors.citizenName && <span className="mt-1 block text-xs font-bold text-red-700">{errors.citizenName.message}</span>}</label>
              <label className="block text-sm font-extrabold">Building / place <span className="text-[#c44b23]">*</span><select {...register("buildingId")} className={fieldClass}>{buildings.map((building) => <option key={building.id} value={building.id}>{building.name}</option>)}</select></label>
            </div>
            <label className="block text-sm font-extrabold">Type of problem <span className="text-[#c44b23]">*</span><select {...register("category")} className={fieldClass}><option value="RAMP">Wheelchair ramp / entrance</option><option value="TOILETS">Accessible toilet</option><option value="PATHWAY">Lift / corridor / tactile path</option><option value="PARKING">Accessible parking</option><option value="SIGNAGE">Signage / communication</option><option value="OTHER">Other accessibility barrier</option></select></label>
            <label className="block text-sm font-extrabold">Describe the problem <span className="text-[#c44b23]">*</span><textarea {...register("description")} rows={4} placeholder="Example: There are three steps at the main entrance and no wheelchair ramp." className={fieldClass} />{errors.description && <span className="mt-1 block text-xs font-bold text-red-700">{errors.description.message}</span>}</label>
            <button type="button" onClick={startVoice} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#fff3ed] px-4 py-3.5 font-extrabold text-[#bd481d] hover:bg-[#ffe8dc]"><Mic size={20} />{listening ? "Listening…" : "Report by voice"}</button>
            <section className="rounded-2xl border border-[#cddbd4] bg-[#f8fbf9] p-4 sm:p-5"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e6f2ec] text-[#0b5d45]"><MapPin size={19} /></span><div><h3 className="font-black">Report location <span className="text-[#c44b23]">*</span></h3><p className="mt-1 text-sm leading-6 text-[#66736c]">Allow location access so we can identify where the accessibility problem was reported.</p></div></div><button type="button" onClick={useLocation} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#b9c9c1] bg-white px-4 py-3.5 font-black text-[#0b5d45]"><LocateFixed size={18} />Use my location</button>{locationStatus && <p className="mt-2 text-xs font-bold text-[#5e6c64]" role="status">{locationStatus}</p>}<label className="mt-3 block text-sm font-bold">Address, entrance or landmark<input {...register("location")} placeholder="Main entrance, ground floor, parking area…" className={fieldClass} />{errors.location && <span className="mt-1 block text-xs font-bold text-red-700">{errors.location.message}</span>}</label></section>
            <MultiPhotoCapture photos={photos} onChange={(next) => { setPhotos(next); setAiReady(false); setFormError(""); }} label="Proof photos" />
            <RequiredAiScreening photos={photos} category={category} onComplete={(complete, summary) => { setAiReady(complete); setAiSummary(summary); }} />
            <PhoneOtpVerification profileName={citizenName} onVerified={(phone) => { setVerifiedPhone(phone); setFormError(""); }} />
            <details className="rounded-xl bg-[#f4f6f4] p-4"><summary className="cursor-pointer text-sm font-bold">Add email (optional)</summary><label className="mt-3 block text-xs font-bold">Email<input {...register("email")} type="email" autoComplete="email" className={fieldClass} /></label>{errors.email && <span className="mt-1 block text-xs font-bold text-red-700">{errors.email.message}</span>}</details>
            {formError && <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-bold text-red-800" role="alert"><TriangleAlert size={16} className="mt-0.5 shrink-0" />{formError}</p>}
            <button type="submit" disabled={!ready || isSubmitting} className="w-full rounded-xl bg-[#e15f2a] px-5 py-4 text-lg font-black text-white shadow-[0_10px_25px_rgba(225,95,42,.22)] hover:bg-[#c94f1f] disabled:bg-[#b9c1bd] disabled:shadow-none">{ready ? "Submit verified complaint" : "Complete photo, AI and OTP checks"}</button>
          </form>
        </section>
        <aside className="space-y-4 lg:pt-[108px]"><div className="rounded-2xl bg-[#12382d] p-6 text-white"><h2 className="font-black">Required before submission</h2><ul className="mt-4 space-y-4 text-sm">{[[UserRound,"Your name and problem details"],[MapPin,"Location or manually entered landmark"],[Sparkles,"Clear photos and AI preliminary screening"],[ShieldCheck,"Mobile number verified by OTP"]].map(([Icon,text]) => { const ItemIcon = Icon as typeof ShieldCheck; return <li key={text as string} className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/10"><ItemIcon size={16} /></span><span className="pt-1.5 text-[#d2e2dc]">{text as string}</span></li>; })}</ul></div><div className="rounded-2xl border border-[#dfe6e1] bg-white p-5 text-sm text-[#66736c]"><p className="font-black text-[#17231d]">Privacy protected</p><p className="mt-2 leading-6">Your phone number is used for verification and private progress updates. It is never shown on public building pages.</p></div></aside>
      </div>
    </main>
  );
}

export function RegisterView() {
  const { login } = useStore();
  const [name, setName] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState("");
  if (created) return <main className="min-h-screen bg-[#f3f6f4]"><PublicHeader /><div className="mx-auto max-w-xl px-5 py-16"><section className="rounded-[2rem] border border-emerald-200 bg-white p-8 text-center shadow-lg"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 size={34} /></span><h1 className="mt-5 text-3xl font-black">Your verified citizen workspace is ready</h1><p className="mt-2 text-[#66736c]">Mobile number +91 ••••• {verifiedPhone?.slice(-4)} is verified.</p><button onClick={() => { login("CITIZEN"); window.location.assign("/citizen/dashboard"); }} className="mt-7 w-full rounded-xl bg-[#0b5d45] px-5 py-4 font-black text-white">Open citizen dashboard</button></section></div></main>;
  return <main className="min-h-screen bg-[#f3f6f4]"><PublicHeader /><div className="mx-auto max-w-xl px-5 py-14"><section className="rounded-[2rem] border border-[#dfe6e1] bg-white p-7 shadow-[0_20px_60px_rgba(20,45,34,.1)]"><p className="text-xs font-black uppercase tracking-wider text-[#0b5d45]">Citizen access</p><h1 className="mt-2 text-3xl font-black">Create a verified account</h1><p className="mt-2 text-sm leading-6 text-[#66736c]">Your phone number is mandatory. OTP verification protects your reports and progress updates.</p><label className="mt-6 block text-sm font-bold">Full name <span className="text-[#c44b23]">*</span><input value={name} onChange={(event) => { setName(event.target.value); setError(""); }} autoComplete="name" className={fieldClass} placeholder="Your full name" /></label><div className="mt-4"><PhoneOtpVerification profileName={name} onVerified={setVerifiedPhone} /></div>{error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-800">{error}</p>}<button type="button" onClick={() => { if (name.trim().length < 2) return setError("Enter your full name."); if (!verifiedPhone) return setError("Verify your mobile number with the OTP."); setCreated(true); }} disabled={!verifiedPhone} className="mt-5 w-full rounded-xl bg-[#0b5d45] px-5 py-4 font-black text-white disabled:bg-[#a9b9b1]">Create verified account</button><p className="mt-5 text-center text-sm">Need a staff demo? <Link href="/login" className="font-bold text-[#0b5d45]">Open demo login</Link></p></section></div></main>;
}
