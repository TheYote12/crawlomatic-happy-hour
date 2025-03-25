
export interface Coordinates {
  lat: number;
  lng: number;
  latitude?: number;
  longitude?: number;
}

export const getCurrentLocation = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = 'Unknown error';
        
        if (error.code === 1) {
          errorMessage = 'Permission denied. Please enable location permissions.';
        } else if (error.code === 2) {
          errorMessage = 'Position unavailable. Try again later.';
        } else if (error.code === 3) {
          errorMessage = 'Timeout getting location. Try again.';
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout to 15 seconds
        maximumAge: 0
      }
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
