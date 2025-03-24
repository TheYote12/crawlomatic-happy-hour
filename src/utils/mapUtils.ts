import { Coordinates } from "./locationUtils";
import mapboxgl from 'mapbox-gl';

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
  route: google.maps.DirectionsResult | null;
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
  // For demo purposes, returning mock data
  // In a real app, you would use Mapbox's geocoding API to search for pubs
  const mockPubs: Place[] = [
    {
      id: '1',
      name: 'The Red Lion',
      vicinity: '123 Main St',
      rating: 4.5,
      geometry: {
        location: {
          lat: location.latitude + 0.001,
          lng: location.longitude + 0.001
        }
      }
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
      }
    }
  ];

  return mockPubs;
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
  
  // For demo purposes, returning mock data
  // In a real app, you would use Mapbox's directions API
  return {
    places: filteredPlaces,
    route: null,
    totalDistance: 2.5,
    totalDuration: 30
  };
};

/**
 * Gets a photo URL for a place
 */
export const getPlacePhotoUrl = (photoReference: string, maxWidth = 400): string => {
  // For a real app, you'd use your API key and the Places API to get actual photos
  // Since this is just a demo, we'll use a placeholder image
  return `https://via.placeholder.com/${maxWidth}x${maxWidth}?text=Photo+Not+Available`;
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
