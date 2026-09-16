import type { Building } from "@/types";

/**
 * Calculates the Haversine distance in meters between two lat/lng points.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Finds the nearest building in the dataset based on GPS coordinates.
 */
export function findNearestBuilding(
  lat: number,
  lng: number,
  buildings: Building[]
): { building: Building; distanceMeters: number } | null {
  if (!buildings.length) return null;

  let nearest = buildings[0];
  let minDistance = Infinity;

  for (const b of buildings) {
    if (b.latitude && b.longitude) {
      const distance = calculateDistanceMeters(lat, lng, b.latitude, b.longitude);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = b;
      }
    }
  }

  return { building: nearest, distanceMeters: minDistance };
}

export interface PlaceSearchResult {
  displayName: string;
  lat: number;
  lng: number;
}

/**
 * Search places, streets, landmarks across OpenStreetMap
 */
export async function searchPlaces(query: string): Promise<PlaceSearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query.trim()
      )}&limit=5&addressdetails=1`,
      {
        signal: controller.signal,
        headers: { "Accept-Language": "en" }
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = (await res.json()) as Array<{
        display_name: string;
        lat: string;
        lon: string;
      }>;
      return data.map((item) => ({
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      }));
    }
  } catch {
    // Graceful fallback
  }

  return [];
}

/**
 * Reverse geocodes coordinates to a human-readable street address using OpenStreetMap Nominatim.
 * Falls back gracefully if offline or rate limited.
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{
  displayName: string;
  road?: string;
  suburb?: string;
  city?: string;
  state?: string;
  postcode?: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          "Accept-Language": "en"
        }
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const parts = [
        addr.building || addr.amenity || addr.leisure || addr.tourism,
        addr.road || addr.pedestrian || addr.footway,
        addr.suburb || addr.neighbourhood || addr.quarter,
        addr.city || addr.town || addr.village || addr.county,
        addr.state,
        addr.postcode
      ].filter(Boolean);

      return {
        displayName: parts.join(", ") || data.display_name || `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`,
        road: addr.road,
        suburb: addr.suburb || addr.neighbourhood,
        city: addr.city || addr.town || addr.village,
        state: addr.state,
        postcode: addr.postcode
      };
    }
  } catch {
    // Fallback if offline or network failure
  }

  return {
    displayName: `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`
  };
}

/**
 * Returns a direct Google Maps search link for verified coordinates.
 */
export function getGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

/**
 * Formats distance in meters or kilometers for accessible human reading.
 */
export function formatDistance(distanceMeters: number): string {
  if (distanceMeters < 1000) {
    return `${distanceMeters}m`;
  }
  return `${(distanceMeters / 1000).toFixed(1)}km`;
}
