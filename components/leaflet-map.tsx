"use client";

import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { buildings } from "@/lib/mock-data";

export function LeafletMap() {
  return (
    <MapContainer center={[13.045, 80.238]} zoom={11} scrollWheelZoom={false} className="h-full w-full" aria-label="Map of monitored buildings in Chennai">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {buildings.map((building) => {
        const color = building.score >= 80 ? "#16805b" : building.score >= 60 ? "#d89424" : "#c94b37";
        return <CircleMarker key={building.id} center={[building.latitude, building.longitude]} radius={8} pathOptions={{ color: "white", weight: 2, fillColor: color, fillOpacity: 1 }}><Popup><strong>{building.name}</strong><br />Monitoring score: {building.score}/100</Popup></CircleMarker>;
      })}
    </MapContainer>
  );
}
