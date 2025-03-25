
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { Coordinates } from '../utils/locationUtils';
import LoadingSpinner from './LoadingSpinner';
import { toast } from "sonner";
import { GoogleMapsApiKeyManager } from '../utils/googleMapsApiKeyManager';
import { Button } from './ui/button';

interface MapProps {
  location: Coordinates;
  route: google.maps.DirectionsResult | null;
  pubCoordinates: Array<{ lat: number; lng: number; name: string }>;
  activePubIndex: number;
  onMapLoad?: (map: google.maps.Map) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1rem'
};

// Define libraries as a constant to prevent reloading
const libraries = ['places'];

const Map: React.FC<MapProps> = ({
  location,
  route,
  pubCoordinates,
  activePubIndex,
  onMapLoad
}) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [isMapError, setIsMapError] = useState(false);
  const [isDirectionsError, setIsDirectionsError] = useState(false);
  const markersRef = useRef<google.maps.Marker[]>([]);
  
  // Load Google Maps API with your key
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GoogleMapsApiKeyManager.getApiKey(),
    libraries: libraries as any
  });

  // Handle API loading error
  useEffect(() => {
    if (loadError) {
      console.error("Error loading Google Maps:", loadError);
      setIsMapError(true);
      
      // Check if the error might be due to missing Places API
      if (loadError.message && loadError.message.includes('ApiNotActivatedMapError')) {
        toast.error('Places API not enabled. Please enable it in your Google Cloud Console.');
      }
    }
  }, [loadError]);

  // Check for route errors
  useEffect(() => {
    if (pubCoordinates.length > 0 && !route && !isMapError) {
      // Only show the error if we have pubs but no route
      setIsDirectionsError(true);
    } else {
      setIsDirectionsError(false);
    }
  }, [route, pubCoordinates, isMapError]);

  // Handle map load
  const handleOnLoad = useCallback((map: google.maps.Map) => {
    console.log("Google Maps loaded successfully");
    mapRef.current = map;
    
    // Add user location marker
    new google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#3b82f6',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#ffffff'
      },
      title: 'Your Location'
    });
    
    if (onMapLoad) {
      onMapLoad(map);
    }
  }, [location, onMapLoad]);

  // Set up markers for pubs
  useEffect(() => {
    if (!mapRef.current || pubCoordinates.length === 0) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Create markers for each pub
    pubCoordinates.forEach((pub, index) => {
      const marker = new google.maps.Marker({
        position: { lat: pub.lat, lng: pub.lng },
        map: mapRef.current,
        label: {
          text: (index + 1).toString(),
          color: '#FFFFFF',
          fontWeight: 'bold'
        },
        title: pub.name
      });
      
      const infoWindow = new google.maps.InfoWindow({
        content: `<div class="p-2"><h3 class="font-semibold">${pub.name}</h3><p>Stop #${index + 1}</p></div>`
      });
      
      marker.addListener('click', () => {
        infoWindow.open(mapRef.current, marker);
      });
      
      markersRef.current.push(marker);
    });
    
    // Fit bounds to include all markers if no route is available
    if (!route && mapRef.current) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: location.lat, lng: location.lng });
      pubCoordinates.forEach(pub => {
        bounds.extend({ lat: pub.lat, lng: pub.lng });
      });
      mapRef.current.fitBounds(bounds);
    }
  }, [pubCoordinates, location, route]);

  // Focus on active pub when it changes
  useEffect(() => {
    if (!mapRef.current || activePubIndex < 0 || activePubIndex >= pubCoordinates.length) return;
    
    const activePub = pubCoordinates[activePubIndex];
    
    mapRef.current.panTo({ lat: activePub.lat, lng: activePub.lng });
    mapRef.current.setZoom(16);
    
    // Show info window for the active pub
    if (markersRef.current[activePubIndex]) {
      google.maps.event.trigger(markersRef.current[activePubIndex], 'click');
    }
  }, [activePubIndex, pubCoordinates]);

  // Handle map unload
  const handleOnUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Function to open Google Cloud Console for enabling Directions API
  const openDirectionsApiConsole = () => {
    window.open('https://console.cloud.google.com/apis/library/directions-backend.googleapis.com', '_blank');
  };

  // Display loading or error states
  if (loadError) {
    return (
      <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 p-6">
          <div className="text-destructive mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h3 className="text-lg font-semibold">Failed to load map</h3>
          <p className="text-sm text-muted-foreground text-center mt-2">
            There was a problem loading Google Maps. Please check your API key and make sure the Places API is enabled in your Google Cloud Console.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-xs">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-lg">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat: location.lat, lng: location.lng }}
        zoom={15}
        onLoad={handleOnLoad}
        onUnmount={handleOnUnmount}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false
        }}
      >
        {/* Render route if available */}
        {route && (
          <DirectionsRenderer
            options={{
              directions: route,
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#3b82f6',
                strokeWeight: 4,
                strokeOpacity: 0.7
              }
            }}
          />
        )}
      </GoogleMap>
      
      {isMapError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 p-6">
          <div className="text-destructive mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h3 className="text-lg font-semibold">Failed to load map</h3>
          <p className="text-sm text-muted-foreground text-center mt-2">
            There was a problem loading the map. Please check your internet connection and Google Maps API key.
          </p>
        </div>
      )}

      {isDirectionsError && !isMapError && pubCoordinates.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 glass p-4 rounded-lg shadow-lg">
          <h3 className="text-md font-semibold mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-amber-500">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            Directions API not enabled
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            For route mapping to work, you need to enable the Directions API in your Google Cloud Console.
          </p>
          <Button 
            variant="secondary" 
            className="w-full" 
            onClick={openDirectionsApiConsole}
          >
            Enable Directions API
          </Button>
        </div>
      )}
    </div>
  );
};

export default Map;
