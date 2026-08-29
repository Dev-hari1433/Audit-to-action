import Link from "next/link";
import { ArrowUpRight, Building2, MapPin } from "lucide-react";
import { ScoreCard } from "@/components/score-card";
import type { Building } from "@/types";

export function BuildingCard({ building }: { building: Building }) {
  return (
    <Link href={`/buildings/${building.id}`} className="group grid rounded-2xl border border-[#dfe6e1] bg-white p-5 shadow-[0_8px_26px_rgba(20,45,34,.035)] hover:-translate-y-0.5 hover:border-[#0b5d45]/35">
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-xl bg-[#eaf4ef] p-3 text-[#0b5d45]"><Building2 size={22} /></span>
        <ArrowUpRight className="text-[#91a098] group-hover:text-[#0b5d45]" size={20} />
      </div>
      <h3 className="mt-5 text-lg font-black">{building.name}</h3>
      <p className="mt-1 text-sm text-[#66736c]">{building.type} · {building.ownership}</p>
      <p className="mt-3 flex items-center gap-2 text-sm text-[#66736c]"><MapPin size={15} />{building.city}</p>
      <div className="mt-5"><ScoreCard score={building.score} compact /></div>
    </Link>
  );
}
