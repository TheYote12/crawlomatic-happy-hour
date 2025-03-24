
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
      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <MapPin className="h-8 w-8 text-primary" />
      </div>
      
      <h2 className="text-2xl font-medium mb-3">Location Access</h2>
      
      <p className="text-muted-foreground mb-6">
        We need your location to find great pubs around you and create the perfect pub crawl.
      </p>
      
      {error && (
        <div className="flex items-center space-x-2 text-destructive mb-4 p-3 bg-destructive/10 rounded-lg w-full">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
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
    </div>
  );
};

export default LocationPermission;
