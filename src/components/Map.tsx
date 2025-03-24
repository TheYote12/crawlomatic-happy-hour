
import React, { useEffect, useRef, useState } from 'react';
import { Coordinates } from '../utils/locationUtils';
import { createMarker } from '../utils/mapUtils';
import LoadingSpinner from './LoadingSpinner';

interface MapProps {
  location: Coordinates;
  route: google.maps.DirectionsResult | null;
  pubCoordinates: Array<{ lat: number; lng: number; name: string }>;
  activePubIndex: number;
  onMapLoad?: (map: google.maps.Map) => void;
}

const Map: React.FC<MapProps> = ({
  location,
  route,
  pubCoordinates,
  activePubIndex,
  onMapLoad
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Google Maps
  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const newMap = new google.maps.Map(mapRef.current, {
      center: { lat: location.latitude, lng: location.longitude },
      zoom: 15,
      mapId: 'DEMO_MAP_ID', // You would use your own map ID here
      disableDefaultUI: true,
      zoomControl: true,
      fullscreenControl: true,
      gestureHandling: 'greedy',
      styles: [
        {
          featureType: "all",
          elementType: "geometry",
          stylers: [{ visibility: "simplified" }]
        },
        {
          featureType: "poi",
          elementType: "labels.icon",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    // Create the directions renderer
    const newDirectionsRenderer = new google.maps.DirectionsRenderer({
      map: newMap,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#3b82f6',
        strokeWeight: 5,
        strokeOpacity: 0.7
      }
    });

    setMap(newMap);
    setDirectionsRenderer(newDirectionsRenderer);
    
    if (onMapLoad) onMapLoad(newMap);
    
    // Add user location marker
    const userMarker = new google.maps.Marker({
      position: new google.maps.LatLng(location.latitude, location.longitude),
      map: newMap,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#3b82f6',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 8
      },
      title: 'Your Location'
    });

    setIsLoading(false);

    return () => {
      if (directionsRenderer) directionsRenderer.setMap(null);
      markers.forEach(marker => marker.setMap(null));
      userMarker.setMap(null);
    };
  }, [location]);

  // Update directions when route changes
  useEffect(() => {
    if (!map || !directionsRenderer || !route) return;
    
    directionsRenderer.setDirections(route);
    
  }, [map, directionsRenderer, route]);

  // Update markers when pub coordinates change
  useEffect(() => {
    if (!map) return;
    
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    
    // Create new markers
    const newMarkers = pubCoordinates.map((pub, index) => {
      return createMarker(
        map,
        new google.maps.LatLng(pub.lat, pub.lng),
        (index + 1).toString(),
        pub.name
      );
    });
    
    setMarkers(newMarkers);
    
    return () => {
      newMarkers.forEach(marker => marker.setMap(null));
    };
  }, [map, pubCoordinates]);

  // Pan to active pub when activePubIndex changes
  useEffect(() => {
    if (!map || activePubIndex < 0 || activePubIndex >= pubCoordinates.length) return;
    
    const activePub = pubCoordinates[activePubIndex];
    map.panTo(new google.maps.LatLng(activePub.lat, activePub.lng));
    
    // Highlight the marker
    markers.forEach((marker, index) => {
      if (index === activePubIndex) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => marker.setAnimation(null), 750);
      }
    });
  }, [map, activePubIndex, pubCoordinates, markers]);

  return (
    <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-lg">
      <div ref={mapRef} className="map-container h-full w-full" />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-xs">
          <LoadingSpinner size="large" />
        </div>
      )}
    </div>
  );
};

export default Map;
