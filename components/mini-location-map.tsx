"use client";

import { useEffect } from "react";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Building } from "@/types";

interface MiniLocationMapProps {
  userLat: number;
  userLng: number;
  targetBuilding?: Building;
  allBuildings?: Building[];
  onSelectLocation?: (lat: number, lng: number) => void;
}

// Fix default leaflet icons in React client
const userIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15, { animate: true });
  }, [lat, lng, map]);
  return null;
}

function ClickHandler({ onSelect }: { onSelect?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onSelect) {
        onSelect(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

export function MiniLocationMap({
  userLat,
  userLng,
  targetBuilding,
  allBuildings = [],
  onSelectLocation
}: MiniLocationMapProps) {
  return (
    <MapContainer
      center={[userLat, userLng]}
      zoom={15}
      scrollWheelZoom={false}
      className="h-full w-full cursor-crosshair"
      aria-label="Interactive mini location map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapRecenter lat={userLat} lng={userLng} />
      <ClickHandler onSelect={onSelectLocation} />

      {/* Pulsing accuracy ring */}
      <CircleMarker
        center={[userLat, userLng]}
        radius={22}
        pathOptions={{
          color: "#0b5d45",
          weight: 2,
          fillColor: "#34d399",
          fillOpacity: 0.25
        }}
      />

      {/* User GPS Pin */}
      <Marker position={[userLat, userLng]} icon={userIcon}>
        <Popup>
          <div className="text-xs">
            <strong className="text-[#0b5d45]">Your GPS Location</strong>
            <br />
            Lat: {userLat.toFixed(5)}, Lng: {userLng.toFixed(5)}
            <br />
            <span className="text-[10px] text-gray-600">Click anywhere on the map to adjust.</span>
          </div>
        </Popup>
      </Marker>

      {/* Nearby monitored buildings */}
      {allBuildings.map((b) => {
        if (!b.latitude || !b.longitude) return null;
        const isTarget = targetBuilding?.id === b.id;
        const color = isTarget ? "#e15f2a" : "#16805b";

        return (
          <CircleMarker
            key={b.id}
            center={[b.latitude, b.longitude]}
            radius={isTarget ? 10 : 6}
            pathOptions={{
              color: isTarget ? "#ffffff" : "#ffffff",
              weight: isTarget ? 3 : 1.5,
              fillColor: color,
              fillOpacity: 1
            }}
          >
            <Popup>
              <div className="text-xs">
                <strong>{b.name}</strong>
                {isTarget && <span className="ml-1 rounded bg-[#e15f2a] px-1 text-[9px] text-white">Nearest</span>}
                <br />
                {b.type} · Score: {b.score}/100
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
