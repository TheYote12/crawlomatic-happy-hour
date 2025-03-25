
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Gets the user's current location using the Geolocation API
 * @returns Promise with coordinates or error
 */
export const getCurrentLocation = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    // Success handler
    const successHandler = (position: GeolocationPosition) => {
      resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    };

    // Error handler with more detailed error messages
    const errorHandler = (error: GeolocationPositionError) => {
      console.error("Error getting location:", error);
      
      let errorMessage: string;
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location permission was denied. Please enable location access in your browser settings.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information is unavailable. Please try again or use a different device.";
          break;
        case error.TIMEOUT:
          errorMessage = "Location request timed out. Please check your connection and try again.";
          break;
        default:
          errorMessage = "An unknown error occurred while trying to access your location.";
      }
      
      reject(new Error(errorMessage));
    };

    navigator.geolocation.getCurrentPosition(
      successHandler,
      errorHandler,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};

/**
 * Calculates the distance between two coordinates in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

/**
 * Converts degrees to radians
 */
const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

/**
 * Formats a distance in a user-friendly way
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
};
