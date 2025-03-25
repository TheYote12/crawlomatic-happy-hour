
import React from 'react';
import { MapPin, AlertCircle, Lock } from 'lucide-react';
import { Button } from './ui/button';

interface LocationPermissionProps {
  onRequestLocation: () => void;
  error?: string;
}

const LocationPermission: React.FC<LocationPermissionProps> = ({ 
  onRequestLocation,
  error
}) => {
  // Function to open browser settings for location permissions
  const openLocationSettings = () => {
    // This opens instructions for different browsers
    window.open('https://support.google.com/chrome/answer/142065?hl=en', '_blank');
  };

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
        <div className="flex items-center space-x-2 text-destructive mb-4 p-4 bg-destructive/10 rounded-lg w-full">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium">{error}</p>
            <p className="mt-1">
              Your browser may be blocking location access. Please check your browser settings and ensure location permissions are enabled.
            </p>
          </div>
        </div>
      )}
      
      <Button
        onClick={onRequestLocation}
        className="w-full py-3 px-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center space-x-2 hover:opacity-90 transition-all duration-300 active:scale-95 mb-4"
      >
        <MapPin className="h-5 w-5" />
        <span>Share My Location</span>
      </Button>
      
      {error && (
        <Button 
          variant="outline" 
          onClick={openLocationSettings}
          className="w-full py-3 px-4 rounded-full flex items-center justify-center space-x-2 mb-4"
        >
          <Lock className="h-5 w-5" />
          <span>Open Location Settings</span>
        </Button>
      )}
      
      <p className="text-xs text-muted-foreground mt-2">
        Your location is only used within this app and never stored on our servers.
      </p>
    </div>
  );
};

export default LocationPermission;
