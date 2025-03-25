
import React from 'react';
import { MapPin, AlertCircle } from 'lucide-react';

interface LocationPermissionProps {
  onRequestLocation: () => void;
  error?: string;
}

const LocationPermission: React.FC<LocationPermissionProps> = ({ 
  onRequestLocation,
  error
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center animate-fade-in">
      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse-light">
        <MapPin className="h-8 w-8 text-primary" />
      </div>
      
      <h2 className="text-2xl font-medium mb-3">Location Access</h2>
      
      <p className="text-muted-foreground mb-6">
        We need your location to find great pubs around you and create the perfect pub crawl.
      </p>
      
      {error && (
        <div className="flex items-start gap-2 text-destructive mb-6 p-4 bg-destructive/10 rounded-lg w-full">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1">{error}</p>
            {error.includes("Permission denied") && (
              <ol className="text-xs list-decimal pl-4 text-left">
                <li>Click the lock/globe icon in your browser's address bar</li>
                <li>Select "Site settings" or "Permissions"</li>
                <li>Set Location access to "Allow"</li>
                <li>Refresh the page and try again</li>
              </ol>
            )}
            {error.includes("Position unavailable") && (
              <p className="text-xs text-left">
                Your device is having trouble determining your location. Try using a different device or network connection.
              </p>
            )}
          </div>
        </div>
      )}
      
      <button
        onClick={onRequestLocation}
        className="glass w-full py-3 px-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center space-x-2 hover:opacity-90 transition-all duration-300 active:scale-95"
      >
        <MapPin className="h-5 w-5" />
        <span>Share My Location</span>
      </button>
      
      <p className="text-xs text-muted-foreground mt-6">
        Your location is only used within this app and never stored on our servers.
      </p>
      
      {/* Fallback for environments where geolocation doesn't work */}
      <div className="mt-8 pt-6 border-t border-gray-200 w-full">
        <p className="text-sm font-medium mb-2">Location not working?</p>
        <p className="text-xs text-muted-foreground mb-4">
          If you're using a development environment or your device doesn't support geolocation, 
          you can use a demo location instead.
        </p>
        <button
          onClick={() => {
            // Mock location for New York City
            const mockGeolocation = {
              lat: 40.7128,
              lng: -74.0060,
              latitude: 40.7128,
              longitude: -74.0060
            };
            // This will be handled by the onRequestLocation handler
            // which expects a promise resolution
            navigator.geolocation.getCurrentPosition = (success) => {
              success({
                coords: {
                  latitude: mockGeolocation.latitude,
                  longitude: mockGeolocation.longitude,
                  accuracy: 10,
                  altitude: null,
                  altitudeAccuracy: null,
                  heading: null,
                  speed: null
                },
                timestamp: Date.now()
              });
            };
            onRequestLocation();
          }}
          className="text-sm text-primary underline hover:text-primary/80"
        >
          Use demo location
        </button>
      </div>
    </div>
  );
};

export default LocationPermission;
