import { Store, PinnedLocation } from '../types';
import { INITIAL_STORES } from '../data/mockDeals';

export const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyA2O5ax56zXhTYueI2xWjKv_tpDiqdorNE';

let apiLoadPromise: Promise<void> | null = null;

export function loadGoogleMapsScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as any).google && (window as any).google.maps) {
    return Promise.resolve();
  }
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', (err) => reject(err));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => {
      console.warn('Failed to load Google Maps script directly, will fallback smoothly:', err);
      reject(err);
    };
    document.head.appendChild(script);
  });

  return apiLoadPromise;
}

export function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  if (typeof window !== 'undefined' && (window as any).google?.maps?.geometry?.spherical) {
    const p1 = new (window as any).google.maps.LatLng(lat1, lng1);
    const p2 = new (window as any).google.maps.LatLng(lat2, lng2);
    const meters = (window as any).google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
    return Math.round((meters / 1000) * 10) / 10;
  }
  // Haversine fallback
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function calculateWalkTimeMinutes(distanceKm: number): number {
  // Average walking speed: 4.8 km/h => ~12.5 min per km
  return Math.max(1, Math.round(distanceKm * 12.5));
}

export async function reverseGeocodeLocation(lat: number, lng: number): Promise<{ name: string; address: string }> {
  try {
    await loadGoogleMapsScript();
    if ((window as any).google?.maps?.Geocoder) {
      const geocoder = new (window as any).google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response.results && response.results.length > 0) {
        const best = response.results[0];
        // Look for sublocality, route, or neighborhood
        let name = '';
        for (const comp of best.address_components) {
          if (comp.types.includes('sublocality') || comp.types.includes('neighborhood') || comp.types.includes('point_of_interest')) {
            name = comp.long_name;
            break;
          }
        }
        if (!name) {
          name = best.formatted_address.split(',')[0] || 'Pinned Location';
        }
        return {
          name: name,
          address: best.formatted_address,
        };
      }
    }
  } catch (e) {
    console.warn('Geocoding error:', e);
  }
  return {
    name: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    address: `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`,
  };
}

export async function searchRealNearbyStores(
  centerLat: number,
  centerLng: number,
  radiusMeters: number = 2000,
  areaName?: string
): Promise<Store[]> {
  try {
    await loadGoogleMapsScript();
    if ((window as any).google?.maps?.places?.PlacesService) {
      const dummyDiv = document.createElement('div');
      const service = new (window as any).google.maps.places.PlacesService(dummyDiv);

      const request: any = {
        location: new (window as any).google.maps.LatLng(centerLat, centerLng),
        radius: radiusMeters,
        keyword: '7-Eleven OR Lotus OR Big C OR Tops OR supermarket OR convenience store',
      };

      const results = await new Promise<any[]>((resolve) => {
        service.nearbySearch(request, (places: any[], status: any) => {
          if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && places && places.length > 0) {
            resolve(places);
          } else {
            resolve([]);
          }
        });
      });

      if (results.length > 0) {
        return results.slice(0, 10).map((place, idx) => {
          const pLat = place.geometry?.location?.lat() ?? centerLat;
          const pLng = place.geometry?.location?.lng() ?? centerLng;
          const dist = calculateDistanceKm(centerLat, centerLng, pLat, pLng);
          const walkTime = calculateWalkTimeMinutes(dist);

          const nameLower = (place.name || '').toLowerCase();
          let brand: Store['brand'] = 'Other';
          if (nameLower.includes('7-eleven') || nameLower.includes('7 eleven') || nameLower.includes('เซเว่น')) {
            brand = '7-Eleven';
          } else if (nameLower.includes('lotus') || nameLower.includes('โลตัส')) {
            brand = 'Lotus';
          } else if (nameLower.includes('big c') || nameLower.includes('บิ๊กซี')) {
            brand = 'BigC';
          } else if (nameLower.includes('tops') || nameLower.includes('ท็อปส์')) {
            brand = 'Tops';
          } else if (nameLower.includes('gourmet') || nameLower.includes('paragon') || nameLower.includes('central')) {
            brand = 'Gourmet';
          }

          let photoUrl = '';
          if (place.photos && place.photos.length > 0) {
            try {
              photoUrl = place.photos[0].getUrl({ maxWidth: 400, maxHeight: 300 });
            } catch {
              photoUrl = '';
            }
          }
          if (!photoUrl) {
            // Pick appropriate fallback photo
            const fallback = INITIAL_STORES[idx % INITIAL_STORES.length];
            photoUrl = fallback.photoUrl || '';
          }

          const isOpen = place.opening_hours?.isOpen ? place.opening_hours.isOpen() : true;

          return {
            id: place.place_id || `gmp-${idx}`,
            name: place.name || 'Nearby Store',
            brand: brand,
            address: place.vicinity || place.formatted_address || `${areaName || 'Pinned Area'}`,
            vicinity: place.vicinity || place.name,
            lat: pLat,
            lng: pLng,
            distanceKm: dist,
            walkTimeMin: walkTime,
            rating: place.rating || 4.7,
            reviewCount: place.user_ratings_total || Math.floor(120 + Math.random() * 400),
            isOpen: isOpen,
            openHoursText: isOpen ? (brand === '7-Eleven' ? 'Open 24 Hours' : 'Open until 10 PM') : 'Closed now',
            activeDealsCount: Math.floor(18 + Math.random() * 45),
            photoUrl: photoUrl,
            isFollowing: idx < 2,
            isRealGmp: true,
            placeId: place.place_id,
          };
        });
      }
    }
  } catch (err) {
    console.warn('Real Google Places nearby search unavailable or throttled, using neighborhood stores:', err);
  }

  // Calculate real distances & realistic names for stores anchored to this specific neighborhood
  const shortArea = (areaName || 'Local').split(',')[0].trim();

  const neighborhoodStoreTemplates: { name: string; brand: Store['brand']; photoIdx: number }[] = [
    { name: `7-Eleven • ${shortArea} Main`, brand: '7-Eleven', photoIdx: 0 },
    { name: `Lotus's Go Fresh • ${shortArea}`, brand: 'Lotus', photoIdx: 1 },
    { name: `Big C Extra • ${shortArea}`, brand: 'BigC', photoIdx: 2 },
    { name: `Tops Daily • ${shortArea}`, brand: 'Tops', photoIdx: 3 },
    { name: `7-Eleven • ${shortArea} Station`, brand: '7-Eleven', photoIdx: 4 },
  ];

  return neighborhoodStoreTemplates.map((t, idx) => {
    // Project realistic dispersed coordinates near the center point (150m to 850m)
    const latOffset = (idx % 2 === 0 ? 1 : -1) * (0.0015 + idx * 0.0014);
    const lngOffset = (idx % 3 === 0 ? 1 : -1) * (0.0018 + idx * 0.0012);
    const lat = Math.round((centerLat + latOffset) * 100000) / 100000;
    const lng = Math.round((centerLng + lngOffset) * 100000) / 100000;
    const dist = calculateDistanceKm(centerLat, centerLng, lat, lng);
    const walk = calculateWalkTimeMinutes(dist);
    const fallbackPhoto = INITIAL_STORES[t.photoIdx % INITIAL_STORES.length].photoUrl;

    return {
      id: `store-${t.brand.toLowerCase()}-${shortArea.toLowerCase().replace(/[^a-z0-9]/g, '')}-${idx}`,
      name: t.name,
      brand: t.brand,
      address: `${shortArea}, Near Pinned Coordinates`,
      vicinity: `${shortArea}`,
      lat,
      lng,
      distanceKm: dist,
      walkTimeMin: walk,
      rating: 4.6 + (idx % 3) * 0.1,
      reviewCount: 140 + idx * 85,
      isOpen: true,
      openHoursText: t.brand === '7-Eleven' ? 'Open 24 Hours' : 'Open until 10 PM',
      activeDealsCount: 22 + idx * 11,
      photoUrl: fallbackPhoto,
      isFollowing: idx < 2,
      isRealGmp: false,
    };
  });
}
