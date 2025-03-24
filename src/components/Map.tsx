
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Coordinates } from '../utils/locationUtils';
import LoadingSpinner from './LoadingSpinner';

interface MapProps {
  location: Coordinates;
  route: any | null;
  pubCoordinates: Array<{ lat: number; lng: number; name: string }>;
  activePubIndex: number;
  onMapLoad?: (map: mapboxgl.Map) => void;
}

const Map: React.FC<MapProps> = ({
  location,
  route,
  pubCoordinates,
  activePubIndex,
  onMapLoad
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Mapbox
  useEffect(() => {
    if (!mapRef.current) return;
    console.log("Initializing map with coordinates:", location);

    // Initialize map
    try {
      map.current = new mapboxgl.Map({
        container: mapRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [location.longitude, location.latitude],
        zoom: 15,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      // Add user location marker
      const userMarker = new mapboxgl.Marker({
        color: '#3b82f6'
      })
        .setLngLat([location.longitude, location.latitude])
        .addTo(map.current);

      map.current.on('load', () => {
        console.log("Map loaded successfully");
        setIsLoading(false);
        if (onMapLoad && map.current) {
          onMapLoad(map.current);
        }
      });

      map.current.on('error', (e) => {
        console.error("Map error:", e);
        setIsLoading(false);
        toast.error("There was an error loading the map");
      });

      return () => {
        markers.current.forEach(marker => marker.remove());
        userMarker.remove();
        map.current?.remove();
      };
    } catch (error) {
      console.error("Error creating map:", error);
      setIsLoading(false);
    }
  }, [location, onMapLoad]);

  // Update markers when pub coordinates change
  useEffect(() => {
    if (!map.current) return;
    console.log("Updating pub markers:", pubCoordinates.length);
    
    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    
    // Create new markers
    markers.current = pubCoordinates.map((pub, index) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = 'white';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.border = '2px solid #3b82f6';
      el.innerText = (index + 1).toString();
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([pub.lng, pub.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${pub.name}</h3>`))
        .addTo(map.current!);
        
      return marker;
    });
  }, [pubCoordinates]);

  // Pan to active pub when activePubIndex changes
  useEffect(() => {
    if (!map.current || activePubIndex < 0 || activePubIndex >= pubCoordinates.length) return;
    console.log("Focusing on pub:", activePubIndex);
    
    const activePub = pubCoordinates[activePubIndex];
    map.current.easeTo({
      center: [activePub.lng, activePub.lat],
      zoom: 15
    });
    
    // Show popup for active marker
    markers.current[activePubIndex]?.togglePopup();
  }, [activePubIndex, pubCoordinates]);

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
