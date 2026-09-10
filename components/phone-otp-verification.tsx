"use client";

import { useState } from "react";
import { CheckCircle2, KeyRound, LoaderCircle, LockKeyhole, Phone, RotateCcw } from "lucide-react";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface PhoneOtpVerificationProps {
  onVerified: (phone: string | null) => void;
  profileName?: string;
}

const demoOtp = "246810";

function normalizedIndianPhone(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : null;
}

function maskedPhone(phone: string) {
  return `${phone.slice(0, 3)} ••••• ${phone.slice(-4)}`;
}

export function PhoneOtpVerification({ onVerified, profileName }: PhoneOtpVerificationProps) {
  const configured = isSupabaseConfigured();
  const [phone, setPhone] = useState("");
  const [normalized, setNormalized] = useState("");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState<"PHONE" | "OTP" | "VERIFIED">("PHONE");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const sendOtp = async () => {
    const nextPhone = normalizedIndianPhone(phone);
    if (!nextPhone) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (configured) {
        const client = createSupabaseBrowserClient();
        if (!client) throw new Error("Phone verification is not configured.");
        const { error: authError } = await client.auth.signInWithOtp({
          phone: nextPhone,
          options: profileName ? { data: { name: profileName } } : undefined,
        });
        if (authError) throw authError;
      }
      setNormalized(nextPhone);
      setStage("OTP");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "We could not send the OTP. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (configured) {
        const client = createSupabaseBrowserClient();
        if (!client) throw new Error("Phone verification is not configured.");
        const { data, error: authError } = await client.auth.verifyOtp({ phone: normalized, token: otp, type: "sms" });
        if (authError) throw authError;
        if (!data.session) throw new Error("The OTP could not be verified. Request a new code.");
      } else if (otp !== demoOtp) {
        throw new Error("That demo OTP is incorrect. Use 246810.");
      }
      setStage("VERIFIED");
      onVerified(normalized);
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "The OTP could not be verified.");
    } finally {
      setBusy(false);
    }
  };

  const changeNumber = () => {
    setStage("PHONE");
    setOtp("");
    setError("");
    onVerified(null);
  };

  if (stage === "VERIFIED") return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4" aria-live="polite">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-700 text-white"><CheckCircle2 size={20} /></span>
        <div className="min-w-0 flex-1"><p className="font-black text-emerald-950">Phone verified</p><p className="mt-1 text-sm text-emerald-800">{maskedPhone(normalized)} can receive report updates.</p></div>
        <button type="button" onClick={changeNumber} className="rounded-lg px-2 py-1 text-xs font-black text-emerald-800 hover:bg-emerald-100">Change</button>
      </div>
    </section>
  );

  return (
    <section className="rounded-2xl border border-[#cddbd4] bg-[#f8fbf9] p-4 sm:p-5" aria-labelledby="phone-verification-title">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e6f2ec] text-[#0b5d45]"><LockKeyhole size={19} /></span>
        <div><h3 id="phone-verification-title" className="font-black">Phone OTP verification <span className="text-[#c44b23]">*</span></h3><p className="mt-1 text-sm leading-6 text-[#66736c]">A verified mobile number is required before submission.</p></div>
      </div>

      {stage === "PHONE" ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label className="flex min-h-14 flex-1 items-center rounded-xl border border-[#bdccc4] bg-white focus-within:border-[#0b5d45] focus-within:ring-4 focus-within:ring-[#0b5d45]/10">
            <span className="flex items-center gap-2 border-r border-[#dfe6e1] px-3 font-black text-[#0b5d45]"><Phone size={17} />+91</span>
            <span className="sr-only">10-digit mobile number</span>
            <input value={phone} onChange={(event) => { setPhone(event.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }} type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="98765 43210" className="min-w-0 flex-1 bg-transparent px-3 py-3 font-bold outline-none" />
          </label>
          <button type="button" onClick={() => void sendOtp()} disabled={busy} className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#0b5d45] px-5 py-3 font-black text-white disabled:opacity-60">{busy ? <LoaderCircle className="animate-spin" size={18} /> : <KeyRound size={18} />}Send OTP</button>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-sm font-bold text-[#536159]">Code sent to {maskedPhone(normalized)}</p>
          {!configured && <p className="mt-2 rounded-xl border border-[#f0d4c6] bg-[#fff5ef] px-3 py-2 text-sm font-black text-[#a44120]">Demo verification code: {demoOtp}</p>}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <label className="flex min-h-14 flex-1 items-center gap-3 rounded-xl border border-[#bdccc4] bg-white px-4 focus-within:border-[#0b5d45] focus-within:ring-4 focus-within:ring-[#0b5d45]/10">
              <KeyRound size={18} className="text-[#0b5d45]" /><span className="sr-only">6-digit OTP</span>
              <input value={otp} onChange={(event) => { setOtp(event.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }} inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit OTP" className="w-full bg-transparent py-3 text-lg font-black tracking-[.22em] outline-none" />
            </label>
            <button type="button" onClick={() => void verifyOtp()} disabled={busy} className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#e56532] px-5 py-3 font-black text-white disabled:opacity-60">{busy ? <LoaderCircle className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}Verify</button>
          </div>
          <div className="mt-2 flex gap-4 text-xs font-bold"><button type="button" onClick={() => void sendOtp()} disabled={busy} className="flex items-center gap-1 text-[#0b5d45]"><RotateCcw size={13} />Resend OTP</button><button type="button" onClick={changeNumber} className="text-[#66736c]">Use another number</button></div>
        </div>
      )}
      {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-800" role="alert">{error}</p>}
      <p className="mt-3 text-xs leading-5 text-[#6b7870]">{configured ? "OTP is sent securely by the configured SMS provider." : "Secure demo mode is active. Connect Supabase and an SMS provider to send real codes."}</p>
    </section>
  );
}
