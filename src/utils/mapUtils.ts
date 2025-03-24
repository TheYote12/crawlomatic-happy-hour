
import { Coordinates } from "./locationUtils";

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
 * Searches for pubs near a given location
 */
export const searchNearbyPubs = async (
  location: Coordinates,
  radius: number,
  map: google.maps.Map,
  maxResults = 10
): Promise<Place[]> => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      console.error("Google Maps API not loaded");
      reject(new Error("Google Maps API not loaded"));
      return;
    }

    const service = new google.maps.places.PlacesService(map);
    
    const request = {
      location: new google.maps.LatLng(location.latitude, location.longitude),
      radius,
      type: "bar",
      keyword: "pub|bar|brewery|tavern",
      openNow: true,
    };

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        // Sort by rating (highest first) and take only the top maxResults
        const sortedResults = results
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, maxResults) as unknown as Place[];
        
        resolve(sortedResults);
      } else {
        console.error("Error searching for pubs:", status);
        reject(new Error(`Places search failed with status: ${status}`));
      }
    });
  });
};

/**
 * Creates an optimized pub crawl route from a list of places
 */
export const createPubCrawlRoute = async (
  startLocation: Coordinates,
  places: Place[],
  maxStops: number
): Promise<PubCrawl> => {
  // Filter places to include only the requested number of stops
  const filteredPlaces = places.slice(0, maxStops);
  
  // Create waypoints from the filtered places
  const waypoints = filteredPlaces.map(place => ({
    location: new google.maps.LatLng(
      place.geometry.location.lat,
      place.geometry.location.lng
    ),
    stopover: true
  }));
  
  // Calculate route using Directions Service
  return new Promise((resolve, reject) => {
    const directionsService = new google.maps.DirectionsService();
    
    // If no places found, return empty result
    if (filteredPlaces.length === 0) {
      resolve({
        places: [],
        route: null,
        totalDistance: 0,
        totalDuration: 0
      });
      return;
    }
    
    // Create request
    const request: google.maps.DirectionsRequest = {
      origin: new google.maps.LatLng(startLocation.latitude, startLocation.longitude),
      destination: new google.maps.LatLng(startLocation.latitude, startLocation.longitude),
      waypoints: waypoints,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.WALKING
    };
    
    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        // Calculate total distance and duration
        let totalDistance = 0;
        let totalDuration = 0;
        
        if (result.routes.length > 0 && result.routes[0].legs) {
          result.routes[0].legs.forEach(leg => {
            totalDistance += leg.distance?.value || 0;
            totalDuration += leg.duration?.value || 0;
          });
        }
        
        // Convert meters to kilometers
        totalDistance = totalDistance / 1000;
        
        // Order the places according to the optimized waypoint order
        let orderedPlaces = [];
        
        if (result.routes.length > 0 && result.routes[0].waypoint_order) {
          const waypointOrder = result.routes[0].waypoint_order;
          orderedPlaces = waypointOrder.map(index => filteredPlaces[index]);
        } else {
          orderedPlaces = filteredPlaces;
        }
        
        resolve({
          places: orderedPlaces,
          route: result,
          totalDistance,
          totalDuration: totalDuration / 60 // Convert seconds to minutes
        });
      } else {
        console.error("Directions service failed:", status);
        reject(new Error(`Directions service failed: ${status}`));
      }
    });
  });
};

/**
 * Gets a photo URL for a place
 */
export const getPlacePhotoUrl = (photoReference: string, maxWidth = 400): string => {
  // For a real app, you'd use your API key and the Places API to get actual photos
  // Since this is just a demo, we'll use a placeholder image
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=YOUR_API_KEY`;
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
