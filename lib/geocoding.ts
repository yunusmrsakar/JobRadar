interface GeocodingResult {
  lat: number;
  lon: number;
  displayName: string;
}

export async function geocodeLocation(location: string): Promise<GeocodingResult | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1&countrycodes=de`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'JobAggregator/1.0' },
  });

  if (!res.ok) return null;

  const data = await res.json();
  if (!data.length) return null;

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}

export async function searchLocations(query: string): Promise<{ name: string; lat: number; lon: number }[]> {
  if (!query || query.length < 2) return [];

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=de&addressdetails=1`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'JobAggregator/1.0' },
  });

  if (!res.ok) return [];

  const data = await res.json();
  return data.map((item: { display_name: string; lat: string; lon: string }) => ({
    name: item.display_name.split(',').slice(0, 2).join(','),
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
  }));
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
