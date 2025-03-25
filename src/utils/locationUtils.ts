
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
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
};
