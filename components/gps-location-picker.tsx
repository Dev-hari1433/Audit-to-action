"use client";

import { useState, useEffect, useRef } from "react";
import {
  LocateFixed,
  MapPin,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Building2,
  Navigation,
  Compass,
  Loader2,
  Search,
  X,
  Info
} from "lucide-react";
import dynamic from "next/dynamic";
import {
  findNearestBuilding,
  reverseGeocode,
  getGoogleMapsUrl,
  formatDistance,
  searchPlaces,
  type PlaceSearchResult
} from "@/lib/geo-utils";
import type { Building } from "@/types";

// Dynamic import for Leaflet map component to prevent SSR hydration errors
const MiniLocationMap = dynamic(
  () => import("@/components/mini-location-map").then((mod) => mod.MiniLocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-48 w-full items-center justify-center rounded-xl bg-[#eaf0ec] text-xs font-bold text-[#5c6e65]">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#0b5d45]" />
        Loading interactive map preview…
      </div>
    )
  }
);

interface GPSLocationPickerProps {
  buildings: Building[];
  selectedBuildingId: string;
  onBuildingSelect: (buildingId: string) => void;
  onLocationFound: (locationText: string, lat: number, lng: number) => void;
  currentLocationText?: string;
  currentLat?: number;
  currentLng?: number;
  inputClass?: string;
}

export function GPSLocationPicker({
  buildings,
  selectedBuildingId,
  onBuildingSelect,
  onLocationFound,
  currentLocationText = "",
  currentLat,
  currentLng
}: GPSLocationPickerProps) {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [detectedAddress, setDetectedAddress] = useState<string>("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val.trim() || val.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
      const results = await searchPlaces(val);
      setSearchResults(results);
      setIsSearching(false);
      setShowDropdown(results.length > 0);
    }, 350);
  };

  const nearestInfo = currentLat && currentLng ? findNearestBuilding(currentLat, currentLng, buildings) : null;
  // Only auto-associate if within 3 km
  const isNearPilotBuilding = nearestInfo && nearestInfo.distanceMeters <= 3000;

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      setStatusMessage("Geolocation is not supported by your browser. Please search your place or enter manually.");
      return;
    }

    setLoading(true);
    setStatusMessage("Acquiring high-precision GPS coordinates from your device…");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);

        setAccuracy(acc);
        setStatusMessage("Identifying exact street address…");

        // 1. Calculate nearest building
        const match = findNearestBuilding(lat, lng, buildings);
        const isNearby = match && match.distanceMeters <= 3000;

        if (isNearby) {
          onBuildingSelect(match.building.id);
        }

        // 2. Reverse geocode with OpenStreetMap Nominatim
        const geo = await reverseGeocode(lat, lng);
        setDetectedAddress(geo.displayName);

        // 3. Format location summary
        const buildingPrefix = isNearby ? `${match.building.name} — ` : "";
        const locationSummary = `${buildingPrefix}${geo.displayName}`;

        onLocationFound(locationSummary, lat, lng);

        if (isNearby) {
          setStatusMessage(
            `GPS pinpointed with ±${acc}m accuracy! Matched nearby pilot facility: ${match.building.name} (~${formatDistance(match.distanceMeters)} away).`
          );
        } else {
          setStatusMessage(
            `GPS pinpointed with ±${acc}m accuracy! Address resolved. (Note: No monitored pilot facility within 3km).`
          );
        }
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setStatusMessage("Location permission denied. Please allow browser location access, or use the search bar below.");
        } else if (err.code === err.TIMEOUT) {
          setStatusMessage("GPS timed out. On desktop/Wi-Fi, please type your location in the search bar below.");
        } else {
          setStatusMessage("Unable to fetch GPS. You can search your college, hospital, or locality below.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0 // Force fresh reading, never return stale cache
      }
    );
  };

  const handleSelectSearchResult = (place: PlaceSearchResult) => {
    setAccuracy(null);
    setSearchQuery(place.displayName);
    setShowDropdown(false);
    setDetectedAddress(place.displayName);

    const match = findNearestBuilding(place.lat, place.lng, buildings);
    const isNearby = match && match.distanceMeters <= 3000;

    if (isNearby) {
      onBuildingSelect(match.building.id);
    }

    const buildingPrefix = isNearby ? `${match.building.name} — ` : "";
    const locationSummary = `${buildingPrefix}${place.displayName}`;

    onLocationFound(locationSummary, place.lat, place.lng);
    setStatusMessage(
      isNearby
        ? `Location selected: ${place.displayName}. Nearby pilot facility: ${match.building.name}.`
        : `Location selected: ${place.displayName}.`
    );
  };

  const handleMapPinSelect = async (lat: number, lng: number) => {
    setAccuracy(null);

    const match = findNearestBuilding(lat, lng, buildings);
    const isNearby = match && match.distanceMeters <= 3000;

    if (isNearby) {
      onBuildingSelect(match.building.id);
    }

    const geo = await reverseGeocode(lat, lng);
    setDetectedAddress(geo.displayName);

    const buildingPrefix = isNearby ? `${match.building.name} — ` : "";
    const locationSummary = `${buildingPrefix}${geo.displayName}`;

    onLocationFound(locationSummary, lat, lng);
    setStatusMessage("Pin repositioned! Address and coordinates updated.");
  };

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);

  return (
    <div className="space-y-3">
      {/* Search Place / Building Bar */}
      <div ref={searchContainerRef} className="relative">
        <label className="mb-1 block text-xs font-bold text-[#23352c]">
          Search Any Place, Street, College, or Landmark (OpenStreetMap Search)
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setShowDropdown(true);
            }}
            placeholder="e.g., IIT Madras, Apollo Hospital, Anna Nagar, T. Nagar, Central Station…"
            className="w-full rounded-xl border border-[#cbdad2] bg-white px-9 py-2.5 text-xs font-semibold text-[#142821] placeholder-[#7d9186] shadow-2xs focus:border-[#0b5d45] focus:outline-hidden focus:ring-1 focus:ring-[#0b5d45]"
          />
          <Search size={16} className="absolute left-3 top-3 text-[#5c6e65]" />
          {isSearching && (
            <Loader2 size={16} className="absolute right-3 top-3 animate-spin text-[#0b5d45]" />
          )}
          {!isSearching && searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setShowDropdown(false);
              }}
              className="absolute right-3 top-3 text-[#5c6e65] hover:text-black"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Dropdown Suggestions */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-[#c5d8ce] bg-white py-1 shadow-lg">
            {searchResults.map((place, idx) => (
              <button
                key={`${place.lat}-${place.lng}-${idx}`}
                type="button"
                onClick={() => handleSelectSearchResult(place)}
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-xs transition hover:bg-[#f0f7f3]"
              >
                <MapPin size={14} className="mt-0.5 shrink-0 text-[#0b5d45]" />
                <span className="flex-1 font-medium text-[#1b342a]">{place.displayName}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* GPS Trigger Button & Google Maps Action */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleFetchLocation}
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#12382d] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#0b2820] disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin text-emerald-300" />
          ) : (
            <LocateFixed size={18} className="text-[#34d399]" />
          )}
          {loading ? "Acquiring Fresh GPS Coordinates…" : "Detect Device GPS Location (Fresh Scan)"}
        </button>

        {currentLat && currentLng && (
          <a
            href={getGoogleMapsUrl(currentLat, currentLng)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#cbdad2] bg-white px-4 py-3 text-xs font-black text-[#1b3f33] transition hover:bg-[#f3f7f5]"
          >
            <Compass size={16} className="text-[#0b5d45]" />
            View in Google Maps <ExternalLink size={13} />
          </a>
        )}
      </div>

      {/* Desktop / Network GPS Guidance Note */}
      <div className="flex items-start gap-2 rounded-lg border border-[#e1eae5] bg-[#f9fbf9] p-2.5 text-[11px] text-[#55695f]">
        <Info size={14} className="mt-0.5 shrink-0 text-[#0b5d45]" />
        <span>
          <strong>Desktop / Laptop Notice:</strong> Desktop PCs identify GPS via Wi-Fi/ISP router location which may deviate from your street. If inaccurate, simply type your exact building/area in the search box above or click on the map to pinpoint.
        </span>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`flex items-start gap-2 rounded-xl p-3 text-xs font-bold ${
            statusMessage.includes("pinpointed") || statusMessage.includes("selected") || statusMessage.includes("repositioned")
              ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
              : statusMessage.includes("denied") || statusMessage.includes("Unable") || statusMessage.includes("timed out")
              ? "border border-amber-200 bg-amber-50 text-amber-900"
              : "border border-[#cfe0d7] bg-[#f0f6f3] text-[#1c3c31]"
          }`}
        >
          {statusMessage.includes("pinpointed") || statusMessage.includes("selected") || statusMessage.includes("repositioned") ? (
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle size={16} className="shrink-0 text-amber-600" />
          )}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Detected Location Card & Nearest Facility Indicator */}
      {currentLat && currentLng && (
        <div className="rounded-xl border border-[#c4ded1] bg-[#f3f9f5] p-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d7ebe1] pb-2.5">
            <div className="flex items-center gap-1.5 font-black text-[#0c3629]">
              <Navigation size={14} className="text-[#0b5d45]" />
              <span>
                Coordinates: {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
              </span>
              {accuracy !== null && (
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-[#557064] border border-[#d2e4db]">
                  ±{accuracy}m accuracy
                </span>
              )}
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-extrabold text-emerald-800">
              Location Verified
            </span>
          </div>

          {/* Auto-identified facility banner (only if within 3km) */}
          {isNearPilotBuilding && nearestInfo && (
            <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-[#a7d8c0] bg-white p-3 shadow-xs">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#0b5d45] text-white">
                <Building2 size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#0b5d45]">
                    Nearby Pilot Facility (~{formatDistance(nearestInfo.distanceMeters)} away)
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700">Auto-Linked</span>
                </div>
                <p className="mt-0.5 font-black text-sm text-[#142821]">{nearestInfo.building.name}</p>
                <p className="text-[11px] text-[#5b6e65]">{nearestInfo.building.address}</p>
              </div>
            </div>
          )}

          {detectedAddress && (
            <div className="mt-2.5 text-[11px] text-[#4b6056]">
              <strong className="text-[#1a382d]">Resolved Address:</strong> {detectedAddress}
            </div>
          )}

          {currentLocationText && currentLocationText !== detectedAddress && (
            <div className="mt-1 text-[11px] text-[#5b6e65]">
              <strong className="text-[#1a382d]">Report Location:</strong> {currentLocationText}
            </div>
          )}
        </div>
      )}

      {/* Interactive Map Preview with Pin Placement */}
      {currentLat && currentLng && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#5a6e64]">
            <span className="flex items-center gap-1">
              <MapPin size={13} className="text-[#0b5d45]" />
              Interactive Map Pin (Click anywhere to reposition pin)
            </span>
            <span className="text-[11px] text-[#71857c]">OpenStreetMap &bull; Live Tiles</span>
          </div>
          <div className="h-52 overflow-hidden rounded-xl border border-[#cadad1] shadow-xs">
            <MiniLocationMap
              userLat={currentLat}
              userLng={currentLng}
              targetBuilding={isNearPilotBuilding ? selectedBuilding : undefined}
              allBuildings={buildings}
              onSelectLocation={handleMapPinSelect}
            />
          </div>
        </div>
      )}
    </div>
  );
}
