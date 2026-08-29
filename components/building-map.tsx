"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/leaflet-map").then((module) => module.LeafletMap), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm font-bold text-[#607067]">Loading Chennai map…</div>,
});

export function BuildingMap() {
  return <div className="h-[340px] overflow-hidden rounded-2xl border border-[#dfe6e1] bg-[#eaf0ec]"><LeafletMap /></div>;
}
