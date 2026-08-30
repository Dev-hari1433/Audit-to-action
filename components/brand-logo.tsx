import { Accessibility, Check } from "lucide-react";

interface BrandLogoProps {
  inverse?: boolean;
  compact?: boolean;
  tagline?: string;
  className?: string;
}

export function BrandLogo({ inverse = false, compact = false, tagline, className = "" }: BrandLogoProps) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-3 ${className}`} aria-label="AccessTrack">
      <span className={`brand-mark ${inverse ? "brand-mark-inverse" : ""}`} aria-hidden="true">
        <Accessibility size={compact ? 21 : 24} strokeWidth={2.35} />
        <span className="brand-mark-check"><Check size={9} strokeWidth={3.5} /></span>
      </span>
      {!compact && (
        <span className="min-w-0 leading-none">
          <span className={`block text-[15px] font-black tracking-[-.035em] ${inverse ? "text-white" : "text-[#123229]"}`}>
            ACCESS<span className="text-[#e56532]">TRACK</span>
          </span>
          {tagline && <span className={`mt-1 block text-[9px] font-bold uppercase tracking-[.16em] ${inverse ? "text-[#a9cbbf]" : "text-[#718078]"}`}>{tagline}</span>}
        </span>
      )}
    </span>
  );
}
