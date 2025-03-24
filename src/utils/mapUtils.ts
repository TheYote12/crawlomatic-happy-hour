
import { Coordinates } from "./locationUtils";
import { toast } from "sonner";
import { GoogleMapsApiKeyManager } from './googleMapsApiKeyManager';

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
 * Searches for pubs near a given location using Google Places API
 */
export const searchNearbyPubs = async (
  location: Coordinates,
  radius: number,
  map: google.maps.Map,
  maxResults = 10
): Promise<Place[]> => {
  try {
    console.log("Searching for pubs near:", location, "with radius:", radius);
    
    const apiKey = GoogleMapsApiKeyManager.getApiKey();
    if (!apiKey) {
      throw new Error("Google Maps API key is not set");
    }

    // Check if Places API is accessible through the Google Maps JavaScript API
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error("Places API library is not loaded correctly");
      throw new Error("Places API is not available. Make sure it's enabled in your Google Cloud Console.");
    }
    
    return new Promise((resolve, reject) => {
      const placesService = new google.maps.places.PlacesService(map);
      
      // Log the request details for debugging
      console.log("Places API request:", {
        location: new google.maps.LatLng(location.latitude, location.longitude),
        radius,
        type: 'bar',
        keyword: 'pub'
      });
      
      const request = {
        location: new google.maps.LatLng(location.latitude, location.longitude),
        radius,
        type: 'bar',
        keyword: 'pub'
      };
      
      placesService.nearbySearch(request, (results, status) => {
        console.log("Places API response status:", status);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          console.log("Places API results:", results);
          
          const places: Place[] = results.slice(0, maxResults).map(place => ({
            id: place.place_id || Math.random().toString(36).substring(2, 9),
            name: place.name || "Unnamed Pub",
            vicinity: place.vicinity || "",
            rating: place.rating,
            photos: place.photos?.map(photo => ({ 
              photo_reference: photo.getUrl?.() || "" 
            })),
            geometry: {
              location: {
                lat: place.geometry?.location?.lat() || location.latitude,
                lng: place.geometry?.location?.lng() || location.longitude
              }
            },
            opening_hours: {
              open_now: place.opening_hours?.isOpen?.() || undefined
            },
            price_level: place.price_level
          }));
          
          resolve(places);
        } else {
          console.error("Places API error:", status);
          
          // More detailed error information based on status
          let errorMessage = `Places API error: ${status}.`;
          
          if (status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
            errorMessage += " Your API key may not have the Places API enabled.";
          } else if (status === google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR) {
            errorMessage += " This could be a temporary server error.";
          } else if (status === google.maps.places.PlacesServiceStatus.INVALID_REQUEST) {
            errorMessage += " The request was invalid.";
          } else if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
            errorMessage += " You have exceeded your daily request quota.";
          } else if (status === google.maps.places.PlacesServiceStatus.NOT_FOUND) {
            errorMessage += " The place was not found.";
          } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            errorMessage += " No pubs were found within the specified radius.";
          }
          
          // Add guidance for API activation
          if (status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED || 
              status === google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR) {
            errorMessage += " You need to enable the Places API in your Google Cloud Console: https://console.cloud.google.com/apis/library/places-backend.googleapis.com";
          }
          
          reject(new Error(errorMessage));
        }
      });
    });
  } catch (error) {
    console.error('Error searching for pubs:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to search for pubs');
    throw error;
  }
};

/**
 * Creates an optimized pub crawl route using Google Directions API
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

    const apiKey = GoogleMapsApiKeyManager.getApiKey();
    if (!apiKey) {
      throw new Error("Google Maps API key is not set");
    }
    
    // Create DirectionsService
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.maps) {
        reject(new Error("Google Maps not loaded"));
        return;
      }
      
      const directionsService = new google.maps.DirectionsService();
      
      // Create waypoints for the Directions API
      const waypoints = filteredPlaces.slice(1, -1).map(place => ({
        location: new google.maps.LatLng(
          place.geometry.location.lat,
          place.geometry.location.lng
        ),
        stopover: true
      }));
      
      const request: google.maps.DirectionsRequest = {
        origin: new google.maps.LatLng(startLocation.latitude, startLocation.longitude),
        destination: filteredPlaces.length > 0 
          ? new google.maps.LatLng(
              filteredPlaces[filteredPlaces.length - 1].geometry.location.lat,
              filteredPlaces[filteredPlaces.length - 1].geometry.location.lng
            )
          : new google.maps.LatLng(startLocation.latitude, startLocation.longitude),
        waypoints,
        travelMode: google.maps.TravelMode.WALKING,
        optimizeWaypoints: true
      };
      
      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          console.log("Directions API response:", result);
          
          // Calculate total distance and duration
          let totalDistance = 0;
          let totalDuration = 0;
          
          result.routes[0].legs.forEach(leg => {
            if (leg.distance && leg.duration) {
              totalDistance += leg.distance.value / 1000; // Convert to kilometers
              totalDuration += leg.duration.value / 60; // Convert to minutes
            }
          });
          
          // Add time for each pub visit (30 minutes per pub)
          totalDuration += filteredPlaces.length * 30;
          
          resolve({
            places: filteredPlaces,
            route: result,
            totalDistance,
            totalDuration
          });
        } else {
          console.error("Directions service failed:", status);
          
          if (status === google.maps.DirectionsStatus.REQUEST_DENIED) {
            // Display toast warning about the Directions API
            toast.warning("Directions API not enabled", {
              description: "Route mapping requires the Directions API. Enable it in Google Cloud Console.",
              duration: 8000,
            });
          }
          
          // Fallback to direct distance calculation if no routes
          const totalDistance = calculateTotalDirectDistance(
            startLocation,
            filteredPlaces.map(place => ({
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng
            }))
          );
          
          // Estimate walking time (assuming 5 km/h walking speed)
          const totalDuration = (totalDistance / 5) * 60 + filteredPlaces.length * 30;
          
          resolve({
            places: filteredPlaces,
            route: null,
            totalDistance,
            totalDuration
          });
        }
      });
    });
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
  const apiKey = GoogleMapsApiKeyManager.getApiKey();
  
  if (apiKey && photoReference) {
    // Use the Places Photos API
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${apiKey}`;
  }
  
  // Fallback to generic pub image
  return `https://source.unsplash.com/featured/600x400/?pub,bar,tavern&sig=${photoReference}`;
};

/**
 * Creates a marker on the map
 */
export const createMarker = (
  map: google.maps.Map,
  position: google.maps.LatLng,
  label: string,
  title: string
): google.maps.Marker => {
  return new google.maps.Marker({
    position,
    map,
    label,
    title,
    animation: google.maps.Animation.DROP
  });
};
