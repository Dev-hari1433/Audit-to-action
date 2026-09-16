"use client";

import { useEffect } from "react";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ExternalLink, Navigation } from "lucide-react";
import { useStore } from "@/lib/store";
import { buildings as fallbackBuildings } from "@/lib/mock-data";
import { SiteLink as Link } from "@/components/site-link";

interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  targetBuildingId?: string;
}

const targetIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapRecenter({ lat, lng, zoom }: { lat: number; lng: number; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom ?? 14, { animate: true });
  }, [lat, lng, zoom, map]);
  return null;
}

export function LeafletMap({ center = [13.045, 80.238], zoom = 11, targetBuildingId }: LeafletMapProps) {
  const { buildings: storeBuildings } = useStore();
  const buildings = storeBuildings && storeBuildings.length ? storeBuildings : fallbackBuildings;

  const targetBuilding = targetBuildingId ? buildings.find((b) => b.id === targetBuildingId) : undefined;
  const effectiveCenter: [number, number] = targetBuilding
    ? [targetBuilding.latitude, targetBuilding.longitude]
    : center;

  return (
    <MapContainer
      center={effectiveCenter}
      zoom={targetBuilding ? 15 : zoom}
      scrollWheelZoom={false}
      className="h-full w-full"
      aria-label="Map of monitored buildings in Chennai"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {targetBuilding && (
        <MapRecenter lat={targetBuilding.latitude} lng={targetBuilding.longitude} zoom={15} />
      )}

      {buildings.map((building) => {
        if (!building.latitude || !building.longitude) return null;

        const isTarget = targetBuildingId === building.id;
        const color = building.score >= 80 ? "#16805b" : building.score >= 60 ? "#d89424" : "#c94b37";
        const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${building.latitude},${building.longitude}`;
        const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${building.latitude},${building.longitude}`;

        return (
          <CircleMarker
            key={building.id}
            center={[building.latitude, building.longitude]}
            radius={isTarget ? 12 : 8}
            pathOptions={{
              color: isTarget ? "#12382d" : "white",
              weight: isTarget ? 3 : 2,
              fillColor: color,
              fillOpacity: 1
            }}
          >
            <Popup>
              <div className="text-xs p-1">
                <strong className="text-sm font-black text-[#142821]">{building.name}</strong>
                <p className="mt-0.5 text-[11px] text-[#55695f]">{building.address}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className="inline-block rounded-md px-1.5 py-0.5 text-[10px] font-black text-white"
                    style={{ backgroundColor: color }}
                  >
                    Score: {building.score}/100
                  </span>
                  <span className="text-[10px] text-[#6b7d74] font-medium">{building.type}</span>
                </div>

                <div className="mt-2.5 flex flex-col gap-1 border-t border-[#e2ece6] pt-2">
                  <a
                    href={gmapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-[#0b5d45] hover:underline"
                  >
                    Open in Google Maps <ExternalLink size={11} />
                  </a>
                  <a
                    href={dirUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-[#e15f2a] hover:underline"
                  >
                    Get Directions <Navigation size={11} />
                  </a>
                  <Link
                    href={`/buildings/${building.id}`}
                    className="inline-block font-bold text-[#142821] hover:underline mt-0.5"
                  >
                    View Public Profile →
                  </Link>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {targetBuilding && (
        <Marker position={[targetBuilding.latitude, targetBuilding.longitude]} icon={targetIcon} />
      )}
    </MapContainer>
  );
}
