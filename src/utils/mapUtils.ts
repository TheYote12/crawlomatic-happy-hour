
import { Coordinates } from "./locationUtils";
import mapboxgl from 'mapbox-gl';
import { toast } from "sonner";

// Set the Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiY2FybG9iZXJyeSIsImEiOiJjbThuY2djbXkxMTJoMm1xMDh2Nmc5NnY1In0.wreOu8QmXIRVUOTLgAZe4A';

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
    // For demo purposes, we'll use a more realistic set of mock pubs
    // In a real app, you would use Mapbox's geocoding API to search for pubs
    const mockPubs: Place[] = [
      {
        id: '1',
        name: 'The Red Lion',
        vicinity: '123 Main St',
        rating: 4.5,
        geometry: {
          location: {
            lat: location.latitude + 0.002,
            lng: location.longitude + 0.002
          }
        },
        opening_hours: {
          open_now: true
        },
        price_level: 2
      },
      {
        id: '2',
        name: 'The Crown',
        vicinity: '456 High St',
        rating: 4.2,
        geometry: {
          location: {
            lat: location.latitude - 0.001,
            lng: location.longitude - 0.001
          }
        },
        opening_hours: {
          open_now: true
        },
        price_level: 1
      },
      {
        id: '3',
        name: 'The Anchor',
        vicinity: '789 River Rd',
        rating: 4.7,
        geometry: {
          location: {
            lat: location.latitude + 0.001,
            lng: location.longitude - 0.002
          }
        },
        price_level: 3
      },
      {
        id: '4',
        name: 'The Fox & Hound',
        vicinity: '101 Forest Lane',
        rating: 4.0,
        geometry: {
          location: {
            lat: location.latitude - 0.002,
            lng: location.longitude + 0.001
          }
        },
        opening_hours: {
          open_now: false
        },
        price_level: 2
      },
      {
        id: '5',
        name: 'The King\'s Arms',
        vicinity: '202 Castle St',
        rating: 4.3,
        geometry: {
          location: {
            lat: location.latitude + 0.003,
            lng: location.longitude - 0.001
          }
        },
        opening_hours: {
          open_now: true
        },
        price_level: 2
      }
    ];

    // For realism, we'll slice according to maxResults
    return mockPubs.slice(0, maxResults);
  } catch (error) {
    console.error('Error searching for pubs:', error);
    throw new Error('Failed to search for pubs');
  }
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
  
  // Calculate a rough distance and duration based on the number of pubs
  // In a real app, you would use Mapbox's directions API
  const totalDistance = filteredPlaces.length * 0.5; // roughly 0.5km between pubs
  const totalDuration = filteredPlaces.length * 10; // roughly 10 minutes between pubs
  
  return {
    places: filteredPlaces,
    route: null,
    totalDistance,
    totalDuration
  };
};

/**
 * Gets a photo URL for a place
 */
export const getPlacePhotoUrl = (photoReference: string, maxWidth = 400): string => {
  // Using Unsplash for more realistic pub images
  return `https://source.unsplash.com/random/400x200/?pub,bar&sig=${photoReference}`;
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
