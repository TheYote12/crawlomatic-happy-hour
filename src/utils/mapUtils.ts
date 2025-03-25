
import { Coordinates } from './locationUtils';
import { GoogleMapsApiKeyManager } from './googleMapsApiKeyManager';

export interface Place {
  place_id: string;
  name: string;
  vicinity?: string;
  formatted_address?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: { 
    photo_reference: string;
    width: number;
    height: number;
    html_attributions: string[];
  }[];
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
  website?: string;
  formatted_phone_number?: string;
  types?: string[];
  plus_code?: {
    compound_code: string;
    global_code: string;
  };
}

export interface Route {
  points: google.maps.LatLngLiteral[];
  distance: number; // in meters
  duration: number; // in minutes
}

export interface PubCrawl {
  places: Place[];
  route: Route;
  totalDistance: number; // in meters
  totalDuration: number; // in minutes
  isCustom?: boolean;
}

// Main function to search for nearby pubs
export const searchNearbyPubs = async (
  location: Coordinates,
  radius: number,
  map: google.maps.Map,
  limit: number = 10,
  keyword: string = 'pub'
): Promise<Place[]> => {
  console.log(`Searching for pubs near ${location.latitude},${location.longitude} with radius ${radius}m`);
  
  // Verify we have a valid API key
  if (!GoogleMapsApiKeyManager.isKeyValid()) {
    throw new Error('No valid Google Maps API key found');
  }
  
  // Create Places service
  const service = new google.maps.places.PlacesService(map);
  
  // Create the nearby search request
  const request: google.maps.places.PlaceSearchRequest = {
    location: new google.maps.LatLng(location.latitude, location.longitude),
    radius: radius,
    type: 'bar',
    keyword: keyword,
    openNow: true,
  };
  
  // Perform the search
  return new Promise((resolve, reject) => {
    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        // Get full details for each place
        const detailedPlaces: Place[] = [];
        let completedRequests = 0;
        
        // Limit the number of results
        const limitedResults = results.slice(0, limit);
        
        limitedResults.forEach((result) => {
          if (!result.place_id) return;
          
          const detailRequest: google.maps.places.PlaceDetailsRequest = {
            placeId: result.place_id,
            fields: [
              'place_id', 'name', 'geometry', 'vicinity', 'formatted_address',
              'photos', 'rating', 'user_ratings_total', 'price_level', 
              'opening_hours', 'website', 'formatted_phone_number', 'types'
            ]
          };
          
          service.getDetails(detailRequest, (place, detailStatus) => {
            completedRequests++;
            
            if (
              detailStatus === google.maps.places.PlacesServiceStatus.OK &&
              place
            ) {
              // Convert the Google Place result to our Place interface
              const placeData: Place = {
                place_id: place.place_id || result.place_id!,
                name: place.name || result.name || 'Unknown Place',
                vicinity: place.vicinity || result.vicinity,
                formatted_address: place.formatted_address,
                geometry: {
                  location: {
                    lat: place.geometry?.location?.lat() || result.geometry?.location?.lat() || 0,
                    lng: place.geometry?.location?.lng() || result.geometry?.location?.lng() || 0,
                  }
                },
                photos: place.photos?.map(photo => ({
                  photo_reference: photo.getUrl() || '',
                  width: photo.width,
                  height: photo.height,
                  html_attributions: photo.html_attributions
                })),
                rating: place.rating,
                user_ratings_total: place.user_ratings_total,
                price_level: place.price_level,
                opening_hours: place.opening_hours ? {
                  open_now: place.opening_hours.isOpen?.(),
                  weekday_text: place.opening_hours.weekday_text
                } : undefined,
                website: place.website,
                formatted_phone_number: place.formatted_phone_number,
                types: place.types
              };
              
              detailedPlaces.push(placeData);
            }
            
            // Once all requests are done, resolve the promise
            if (completedRequests === limitedResults.length) {
              // Sort by rating (highest first), then by number of ratings
              detailedPlaces.sort((a, b) => {
                if (a.rating !== undefined && b.rating !== undefined) {
                  if (a.rating !== b.rating) {
                    return b.rating - a.rating;
                  }
                }
                return (b.user_ratings_total || 0) - (a.user_ratings_total || 0);
              });
              
              resolve(detailedPlaces);
            }
          });
        });
        
        // If no results, resolve with empty array
        if (limitedResults.length === 0) {
          resolve([]);
        }
      } else {
        if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          resolve([]);
        } else {
          reject(new Error(`Places API error: ${status}`));
        }
      }
    });
  });
};

// Create an optimized pub crawl route
export const createPubCrawlRoute = async (
  startLocation: Coordinates,
  availablePubs: Place[],
  numPubs: number
): Promise<PubCrawl> => {
  console.log(`Creating pub crawl route with ${numPubs} pubs`);
  
  if (availablePubs.length === 0) {
    throw new Error('No pubs available to create route');
  }
  
  // Ensure we have at least the requested number of pubs, or all available
  const maxPubs = Math.min(numPubs, availablePubs.length);
  
  // Select the top rated pubs from the available set
  const selectedPubs = availablePubs.slice(0, maxPubs);
  
  // Calculate route between pubs
  const route = await calculatePubCrawlRoute(startLocation, selectedPubs);
  
  return {
    places: selectedPubs,
    route: route,
    totalDistance: route.distance,
    totalDuration: route.duration,
    isCustom: false
  };
};

// Create a custom pub crawl route with selected pubs
export const createCustomPubCrawlRoute = async (
  startLocation: Coordinates,
  selectedPubs: Place[]
): Promise<PubCrawl> => {
  console.log(`Creating custom pub crawl route with ${selectedPubs.length} pubs`);
  
  if (selectedPubs.length === 0) {
    throw new Error('No pubs selected to create custom route');
  }
  
  // Calculate route between pubs
  const route = await calculatePubCrawlRoute(startLocation, selectedPubs);
  
  return {
    places: selectedPubs,
    route: route,
    totalDistance: route.distance,
    totalDuration: route.duration,
    isCustom: true
  };
};

// Calculate the optimal route between pubs
const calculatePubCrawlRoute = async (
  startLocation: Coordinates,
  pubs: Place[]
): Promise<Route> => {
  // In a real app, this would use the Google Directions API to calculate
  // an optimal route. For this prototype, we'll create a simplified version
  // that connects the pubs in order.
  
  const points: google.maps.LatLngLiteral[] = [
    { lat: startLocation.latitude, lng: startLocation.longitude },
    ...pubs.map(pub => ({
      lat: pub.geometry.location.lat,
      lng: pub.geometry.location.lng
    }))
  ];
  
  // Calculate straight-line distances between points
  let totalDistance = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalDistance += calculateHaversineDistance(points[i], points[i + 1]);
  }
  
  // Estimate duration: assume 10 minutes per stop plus walking time
  // Walking speed ~5 km/h = 83.33 meters per minute
  const walkingTimeMinutes = totalDistance / 83.33;
  const stopTimeMinutes = pubs.length * 30; // 30 minutes per pub
  const totalDurationMinutes = walkingTimeMinutes + stopTimeMinutes;
  
  return {
    points: points,
    distance: totalDistance,
    duration: totalDurationMinutes
  };
};

// Calculate distance between two points using Haversine formula
const calculateHaversineDistance = (
  point1: google.maps.LatLngLiteral,
  point2: google.maps.LatLngLiteral
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = point1.lat * Math.PI / 180;
  const φ2 = point2.lat * Math.PI / 180;
  const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
  const Δλ = (point2.lng - point1.lng) * Math.PI / 180;
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c; // Distance in meters
};
