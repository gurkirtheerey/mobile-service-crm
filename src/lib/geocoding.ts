// Geocoding utilities for address to coordinate conversion

interface GeocodingResult {
  lat: number;
  lng: number;
  formattedAddress?: string;
}

// Mock geocoding for development/testing
// In production, this would use Google Maps Geocoding API
const MOCK_GEOCODING: Record<string, GeocodingResult> = {
  // Sacramento area addresses for testing
  'sacramento, ca': { lat: 38.5816, lng: -121.4944 },
  'roseville, ca': { lat: 38.7521, lng: -121.2880 },
  'elk grove, ca': { lat: 38.4088, lng: -121.3716 },
  'folsom, ca': { lat: 38.6780, lng: -121.1761 },
  'west sacramento, ca': { lat: 38.5804, lng: -121.5302 },
  'davis, ca': { lat: 38.5449, lng: -121.7405 },
  'woodland, ca': { lat: 38.6785, lng: -121.7733 },
  'rancho cordova, ca': { lat: 38.5891, lng: -121.3027 },
  'citrus heights, ca': { lat: 38.7071, lng: -121.2811 },
  'carmichael, ca': { lat: 38.6252, lng: -121.3283 },
};

// Calculate a deterministic offset based on street address
function getAddressOffset(street: string): { latOffset: number; lngOffset: number } {
  let hash = 0;
  for (let i = 0; i < street.length; i++) {
    const char = street.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  // Generate small offsets (within ~1 mile)
  const latOffset = ((hash % 100) / 100) * 0.02 - 0.01;
  const lngOffset = (((hash >> 8) % 100) / 100) * 0.02 - 0.01;

  return { latOffset, lngOffset };
}

export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  // Check if Google Maps API key is available
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (apiKey && apiKey !== 'your-google-maps-api-key') {
    try {
      return await geocodeWithGoogle(address, apiKey);
    } catch (error) {
      console.error('Google Geocoding failed, falling back to mock:', error);
    }
  }

  // Fall back to mock geocoding
  return mockGeocode(address);
}

async function geocodeWithGoogle(address: string, apiKey: string): Promise<GeocodingResult> {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK' || !data.results || data.results.length === 0) {
    throw new Error(`Geocoding failed: ${data.status}`);
  }

  const result = data.results[0];
  return {
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    formattedAddress: result.formatted_address,
  };
}

function mockGeocode(address: string): GeocodingResult {
  const normalizedAddress = address.toLowerCase().trim();

  // Extract city and state from address
  const parts = normalizedAddress.split(',').map(p => p.trim());

  // Try to find a matching city
  for (const [key, coords] of Object.entries(MOCK_GEOCODING)) {
    if (normalizedAddress.includes(key)) {
      // Add offset based on street address for variety
      const offset = getAddressOffset(parts[0] || address);
      return {
        lat: coords.lat + offset.latOffset,
        lng: coords.lng + offset.lngOffset,
        formattedAddress: address,
      };
    }
  }

  // Default to Sacramento downtown with offset
  const offset = getAddressOffset(address);
  return {
    lat: 38.5816 + offset.latOffset,
    lng: -121.4944 + offset.lngOffset,
    formattedAddress: address,
  };
}

// Calculate distance between two points (in miles)
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get estimated drive time between two points (in minutes)
// Rough estimate: average 25 mph in urban areas
export function estimateDriveTime(distanceMiles: number): number {
  const averageSpeedMph = 25;
  return Math.round((distanceMiles / averageSpeedMph) * 60);
}

// Optimize route order for a list of appointments
export function optimizeRoute(
  appointments: Array<{ id: string; lat: number; lng: number }>
): string[] {
  if (appointments.length <= 2) {
    return appointments.map(a => a.id);
  }

  // Simple nearest neighbor algorithm
  const result: string[] = [];
  const remaining = [...appointments];

  // Start with the first appointment (could be optimized to start from office location)
  let current = remaining.shift()!;
  result.push(current.id);

  while (remaining.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const distance = calculateDistance(
        current.lat,
        current.lng,
        remaining[i].lat,
        remaining[i].lng
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    current = remaining.splice(nearestIndex, 1)[0];
    result.push(current.id);
  }

  return result;
}
