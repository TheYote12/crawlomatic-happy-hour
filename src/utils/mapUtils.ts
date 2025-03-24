
import { Coordinates } from "./locationUtils";
import mapboxgl from 'mapbox-gl';
import { toast } from "sonner";
import { MapboxApiKeyManager } from './mapboxApiKeyManager';

// Define interfaces
export interface Place {
  id: string;
  name: string;
  vicinity: string;
  rating?: number;
  photos?: Array<{ photo_reference: string }>;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  opening_hours?: {
    open_now?: boolean;
  };
  price_level?: number;
}

export interface PubCrawl {
  places: Place[];
  route: mapboxgl.Map | null;
  totalDistance: number;
  totalDuration: number;
}

/**
 * Searches for pubs near a given location using Mapbox
 */
export const searchNearbyPubs = async (
  location: Coordinates,
  radius: number,
  map: mapboxgl.Map,
  maxResults = 10
): Promise<Place[]> => {
  try {
    console.log("Searching for pubs near:", location, "with radius:", radius);
    
    // In a real production app, we would fetch real pub data 
    // from the Mapbox Places API or similar
    // For now, we're generating more realistic mock data based on the actual location
    const mockPubs: Place[] = generateRealisticPubs(location, radius, maxResults);

    console.log("Found mock pubs:", mockPubs.length);
    return mockPubs;
  } catch (error) {
    console.error('Error searching for pubs:', error);
    toast.error('Failed to search for pubs');
    throw new Error('Failed to search for pubs');
  }
};

/**
 * Generates realistic mock pubs around a given location
 */
const generateRealisticPubs = (
  center: Coordinates, 
  radiusInMeters: number,
  count: number
): Place[] => {
  const pubs: Place[] = [];
  const pubNames = [
    "The Red Lion", "The Crown", "The Royal Oak", "The White Hart", 
    "The Kings Arms", "The Queens Head", "The Black Bull", "The Anchor",
    "The Swan", "The Fox & Hounds", "The Rose & Crown", "The Green Man",
    "The Plough", "The Bell", "The Ship", "The Duke's Head",
    "The George & Dragon", "The Coach & Horses", "The White Horse", "The Star Inn"
  ];
  
  const streets = [
    "High Street", "Main Street", "Church Road", "Station Road", 
    "Park Avenue", "Castle Street", "Bridge Road", "Mill Lane",
    "Market Square", "Queen Street", "King Street", "Victoria Road"
  ];
  
  // Convert radius from meters to degrees (roughly)
  const radiusInDegrees = radiusInMeters / 111000;
  
  for (let i = 0; i < count && i < pubNames.length; i++) {
    // Generate a random point within the radius
    const random_angle = Math.random() * Math.PI * 2;
    const random_radius = Math.random() * radiusInDegrees;
    
    const x = center.longitude + random_radius * Math.cos(random_angle);
    const y = center.latitude + random_radius * Math.sin(random_angle);
    
    pubs.push({
      id: `pub-${i}`,
      name: pubNames[i],
      vicinity: `${Math.floor(Math.random() * 200)} ${streets[Math.floor(Math.random() * streets.length)]}`,
      rating: Math.round((3 + Math.random() * 2) * 10) / 10, // Rating between 3 and 5
      geometry: {
        location: {
          lat: y,
          lng: x
        }
      },
      opening_hours: {
        open_now: Math.random() > 0.2 // 80% chance of being open
      },
      price_level: Math.floor(Math.random() * 3) + 1 // Price level between 1 and 3
    });
  }
  
  return pubs;
};

/**
 * Creates an optimized pub crawl route
 */
export const createPubCrawlRoute = async (
  startLocation: Coordinates,
  places: Place[],
  maxStops: number
): Promise<PubCrawl> => {
  // Filter places to include only the requested number of stops
  const filteredPlaces = places.slice(0, maxStops);
  
  // Calculate distances between locations
  let totalDistance = 0;
  let totalDuration = 0;
  
  // In a real app, we would use the Mapbox Directions API to get actual routes and distances
  // For now, we'll calculate rough estimates based on direct distances
  const locations = [startLocation, ...filteredPlaces.map(place => ({
    latitude: place.geometry.location.lat,
    longitude: place.geometry.location.lng
  }))];
  
  for (let i = 0; i < locations.length - 1; i++) {
    const from = locations[i];
    const to = locations[i + 1];
    
    // Calculate direct distance
    const distance = calculateDirectDistance(from, to);
    totalDistance += distance;
    
    // Estimate walking time (assuming 5 km/h walking speed)
    const durationInMinutes = (distance / 5) * 60;
    totalDuration += durationInMinutes;
    
    // Add 30 minutes for each pub visit
    if (i < locations.length - 2) {
      totalDuration += 30;
    }
  }
  
  return {
    places: filteredPlaces,
    route: null,
    totalDistance,
    totalDuration
  };
};

/**
 * Calculate direct distance between two coordinates using the Haversine formula
 */
const calculateDirectDistance = (from: Coordinates, to: Coordinates): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Gets a photo URL for a place
 */
export const getPlacePhotoUrl = (photoReference: string, maxWidth = 400): string => {
  // Using Unsplash for more realistic pub images
  return `https://source.unsplash.com/featured/600x400/?pub,bar,tavern&sig=${photoReference}`;
};

/**
 * Creates a marker on the map
 */
export const createMarker = (
  map: mapboxgl.Map,
  position: mapboxgl.LngLat,
  label: string,
  title: string
): mapboxgl.Marker => {
  const el = document.createElement('div');
  el.className = 'marker';
  el.style.backgroundColor = 'white';
  el.style.width = '30px';
  el.style.height = '30px';
  el.style.borderRadius = '50%';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.border = '2px solid #3b82f6';
  el.innerText = label;

  return new mapboxgl.Marker(el)
    .setLngLat([position.lng, position.lat])
    .setPopup(new mapboxgl.Popup().setHTML(`<h3>${title}</h3>`));
};
