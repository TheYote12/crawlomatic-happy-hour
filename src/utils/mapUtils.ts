
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
    
    const apiKey = MapboxApiKeyManager.getApiKey();
    if (!apiKey) {
      throw new Error("Mapbox API key is not set");
    }
    
    // Calculate the bounding box for the search area
    const metersToDegreesApprox = 0.00001;
    const radiusInDegrees = radius * metersToDegreesApprox * 111;
    
    // Create the bounding box coordinates
    const bbox = [
      location.longitude - radiusInDegrees, 
      location.latitude - radiusInDegrees,
      location.longitude + radiusInDegrees, 
      location.latitude + radiusInDegrees
    ].join(',');
    
    // Define the search parameters for pubs and bars
    const searchParams = new URLSearchParams({
      access_token: apiKey,
      limit: maxResults.toString(),
      bbox: bbox,
      types: 'poi',
      proximity: `${location.longitude},${location.latitude}`,
      category: 'bar,pub'
    });
    
    // Make the API request to Mapbox
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/pub.json?${searchParams.toString()}`
    );
    
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Mapbox API response:", data);
    
    // Transform the Mapbox response to our Place interface
    const places: Place[] = data.features.map((feature: any) => {
      const id = feature.id;
      const name = feature.text || "Unnamed Pub";
      const vicinity = feature.place_name || "";
      
      // Extract coordinates
      const [longitude, latitude] = feature.center;
      
      // Create a Place object from the Mapbox feature
      return {
        id,
        name,
        vicinity,
        rating: feature.properties?.rating || (Math.random() * 2 + 3).toFixed(1),
        geometry: {
          location: {
            lat: latitude,
            lng: longitude
          }
        },
        opening_hours: {
          open_now: true // We don't have real data for this from Mapbox
        },
        price_level: feature.properties?.price_level || Math.floor(Math.random() * 3) + 1
      };
    });
    
    console.log("Found pubs:", places.length);
    return places;
  } catch (error) {
    console.error('Error searching for pubs:', error);
    toast.error('Failed to search for pubs');
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
  try {
    // Filter places to include only the requested number of stops
    const filteredPlaces = places.slice(0, maxStops);
    
    if (filteredPlaces.length === 0) {
      throw new Error("No places found for the route");
    }

    const apiKey = MapboxApiKeyManager.getApiKey();
    if (!apiKey) {
      throw new Error("Mapbox API key is not set");
    }
    
    // Create waypoints for the Directions API
    const coordinates = [
      [startLocation.longitude, startLocation.latitude],
      ...filteredPlaces.map(place => [
        place.geometry.location.lng,
        place.geometry.location.lat
      ])
    ];
    
    // Format coordinates for the API request
    const coordinatesString = coordinates.map(coord => coord.join(',')).join(';');
    
    // Make the API request to get the route
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinatesString}?` +
      `alternatives=false&geometries=geojson&overview=full&steps=false&access_token=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Mapbox Directions API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Directions API response:", data);
    
    // Calculate total distance and duration from the response
    let totalDistance = 0;
    let totalDuration = 0;
    
    if (data.routes && data.routes.length > 0) {
      totalDistance = data.routes[0].distance / 1000; // Convert to kilometers
      totalDuration = data.routes[0].duration / 60; // Convert to minutes
      
      // Add time for each pub visit (30 minutes per pub)
      totalDuration += filteredPlaces.length * 30;
    } else {
      // Fallback to direct distance calculation if no routes are returned
      totalDistance = calculateTotalDirectDistance(
        startLocation,
        filteredPlaces.map(place => ({
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng
        }))
      );
      
      // Estimate walking time (assuming 5 km/h walking speed)
      totalDuration = (totalDistance / 5) * 60;
      
      // Add time for each pub visit (30 minutes per pub)
      totalDuration += filteredPlaces.length * 30;
    }
    
    return {
      places: filteredPlaces,
      route: data.routes && data.routes.length > 0 ? data.routes[0] : null,
      totalDistance,
      totalDuration
    };
  } catch (error) {
    console.error('Error creating pub crawl route:', error);
    toast.error('Failed to create route');
    throw new Error('Failed to create route');
  }
};

/**
 * Calculate total direct distance between a series of coordinates
 */
const calculateTotalDirectDistance = (start: Coordinates, points: Coordinates[]): number => {
  let totalDistance = 0;
  let currentPoint = start;
  
  for (const point of points) {
    totalDistance += calculateDirectDistance(currentPoint, point);
    currentPoint = point;
  }
  
  return totalDistance;
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
  // Since Mapbox doesn't provide pub images, we still use Unsplash for images
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
