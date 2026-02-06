/**
 * Location Service
 *
 * Handles GPS location capture with user permission management.
 * Implements "no-excuse" location binding for transaction audit trail.
 *
 * Features:
 * - Permission request with Bangla/English primer
 * - Silent capture when permission granted
 * - Audit logging when permission denied
 * - Reverse geocoding (optional)
 */

import { supabase, getProfile } from "./supabase";

const LOCATION_PERMISSION_KEY = 'suarakira_location_permission';
const LOCATION_PRIMER_SHOWN_KEY = 'suarakira_location_primer_shown';

export type LocationPermissionStatus = 'granted' | 'denied' | 'prompt' | 'not_requested';

export interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export interface SavedLocation {
  id: string;
  lat: number;
  lng: number;
  accuracy_meters: number;
  place_name?: string;
  city?: string;
  country?: string;
}

/**
 * Check if location primer has been shown
 */
export function hasShownLocationPrimer(): boolean {
  return localStorage.getItem(LOCATION_PRIMER_SHOWN_KEY) === 'true';
}

/**
 * Mark location primer as shown
 */
export function markLocationPrimerShown(): void {
  localStorage.setItem(LOCATION_PRIMER_SHOWN_KEY, 'true');
}

/**
 * Get current permission status from browser
 */
export async function getLocationPermissionStatus(): Promise<LocationPermissionStatus> {
  if (!('geolocation' in navigator)) {
    return 'not_requested';
  }

  // Check localStorage cache first
  const cached = localStorage.getItem(LOCATION_PERMISSION_KEY);
  if (cached === 'denied') {
    return 'denied';
  }

  // Try to query permission API (not available in all browsers)
  if ('permissions' in navigator) {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      return result.state as LocationPermissionStatus;
    } catch (e) {
      // Permission API not available, return cached or prompt
      return cached === 'granted' ? 'granted' : 'prompt';
    }
  }

  return cached === 'granted' ? 'granted' : 'prompt';
}

/**
 * Request location permission (called after primer modal)
 */
export async function requestLocationPermission(): Promise<LocationPermissionStatus> {
  if (!('geolocation' in navigator)) {
    console.warn('Geolocation not supported');
    return 'not_requested';
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      () => {
        // Permission granted
        localStorage.setItem(LOCATION_PERMISSION_KEY, 'granted');
        resolve('granted');
      },
      (error) => {
        // Permission denied or error
        console.error('Location permission denied:', error);
        localStorage.setItem(LOCATION_PERMISSION_KEY, 'denied');

        // Log denial to audit
        logLocationPermissionDenied(error.message);

        resolve('denied');
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Capture current location (silent)
 * Returns null if permission denied or error
 */
export async function captureLocation(): Promise<LocationData | null> {
  if (!('geolocation' in navigator)) {
    return null;
  }

  // Check permission status first
  const permission = await getLocationPermissionStatus();
  if (permission === 'denied') {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: LocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        resolve(location);
      },
      (error) => {
        console.warn('Failed to capture location:', error.message);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Accept cached location up to 1 minute old
      }
    );
  });
}

/**
 * Save location to database and return location ID
 */
export async function saveLocationToDatabase(
  location: LocationData
): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    const profile = await getProfile(user.id);

    const { data, error } = await supabase
      .from('locations')
      .insert({
        organization_id: profile.organization_id,
        lat: location.lat,
        lng: location.lng,
        accuracy_meters: location.accuracy,
        captured_at: new Date(location.timestamp).toISOString(),
        captured_by_user_id: user.id,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to save location:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error saving location:', error);
    return null;
  }
}

/**
 * Capture and save location in one call
 * Returns location ID or null
 */
export async function captureAndSaveLocation(): Promise<string | null> {
  const location = await captureLocation();
  if (!location) {
    return null;
  }

  return await saveLocationToDatabase(location);
}

/**
 * Get GPS missing reason based on permission status
 */
export async function getGpsMissingReason(): Promise<'PERMISSION_DENIED' | 'NO_GPS' | 'NOT_REQUESTED' | null> {
  if (!('geolocation' in navigator)) {
    return 'NO_GPS';
  }

  const permission = await getLocationPermissionStatus();

  if (permission === 'denied') {
    return 'PERMISSION_DENIED';
  }

  if (permission === 'not_requested' || permission === 'prompt') {
    return 'NOT_REQUESTED';
  }

  return null;
}

/**
 * Log location permission denial to audit
 */
async function logLocationPermissionDenied(reason: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const profile = await getProfile(user.id);

    await supabase.from('audit_log').insert({
      organization_id: profile.organization_id,
      actor_type: 'USER',
      actor_id: user.id,
      action_type: 'LOCATION_PERMISSION_DENIED',
      reason,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log location permission denial:', error);
  }
}

/**
 * Optional: Reverse geocode location to place name
 * (Requires external API like OpenStreetMap Nominatim or Google Maps)
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ place_name: string; city?: string; country?: string } | null> {
  try {
    // Using OpenStreetMap Nominatim (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'SuaraKira/2.0',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      place_name: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      city: data.address?.city || data.address?.town || data.address?.village,
      country: data.address?.country,
    };
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return null;
  }
}

/**
 * Update location with reverse geocoded data
 */
export async function updateLocationWithGeocode(locationId: string): Promise<void> {
  try {
    // Get location from database
    const { data: location, error: fetchError } = await supabase
      .from('locations')
      .select('lat, lng')
      .eq('id', locationId)
      .single();

    if (fetchError || !location) {
      console.error('Failed to fetch location:', fetchError);
      return;
    }

    // Reverse geocode
    const geocode = await reverseGeocode(location.lat, location.lng);
    if (!geocode) {
      return;
    }

    // Update location with geocoded data
    const { error: updateError } = await supabase
      .from('locations')
      .update({
        place_name: geocode.place_name,
        city: geocode.city,
        country: geocode.country,
      })
      .eq('id', locationId);

    if (updateError) {
      console.error('Failed to update location with geocode:', updateError);
    }
  } catch (error) {
    console.error('Error updating location with geocode:', error);
  }
}

/**
 * Watch location permission changes
 */
export function watchLocationPermission(
  callback: (status: LocationPermissionStatus) => void
): () => void {
  if (!('permissions' in navigator)) {
    return () => {}; // No-op cleanup
  }

  let permissionStatus: PermissionStatus | null = null;

  navigator.permissions.query({ name: 'geolocation' as PermissionName })
    .then((status) => {
      permissionStatus = status;
      callback(status.state as LocationPermissionStatus);

      status.addEventListener('change', () => {
        const newStatus = status.state as LocationPermissionStatus;
        localStorage.setItem(LOCATION_PERMISSION_KEY, newStatus);
        callback(newStatus);
      });
    })
    .catch((error) => {
      console.error('Failed to query geolocation permission:', error);
    });

  // Cleanup function
  return () => {
    if (permissionStatus) {
      permissionStatus.removeEventListener('change', () => {});
    }
  };
}

/**
 * Format location for display
 */
export function formatLocation(location: SavedLocation): string {
  if (location.place_name) {
    return location.place_name;
  }

  const lat = location.lat.toFixed(6);
  const lng = location.lng.toFixed(6);
  return `${lat}, ${lng}`;
}

/**
 * Calculate distance between two locations (in meters)
 * Using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}
