import { Suspense } from "react";
import { RouteView } from "@/components/route-view";

export default function CatchAllPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#f3f6f4] font-bold text-[#0b5d45]">Loading AccessTrack…</main>}><RouteView /></Suspense>;
}
