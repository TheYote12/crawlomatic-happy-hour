
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Coordinates } from '../utils/locationUtils';
import LoadingSpinner from './LoadingSpinner';
import { toast } from "sonner";
import { MapboxApiKeyManager } from '../utils/mapboxApiKeyManager';

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
  const [isMapError, setIsMapError] = useState(false);
  const [routeLine, setRouteLine] = useState<mapboxgl.Map | null>(null);

  // Initialize Mapbox
  useEffect(() => {
    if (!mapRef.current) return;
    console.log("Initializing map with coordinates:", location);

    const apiKey = MapboxApiKeyManager.getApiKey();
    if (!apiKey) {
      console.error("No Mapbox API key found");
      setIsMapError(true);
      setIsLoading(false);
      toast.error("Mapbox API key is missing. Please set your API key.");
      return;
    }

    // Initialize map
    try {
      // Set the Mapbox token
      mapboxgl.accessToken = apiKey;
      
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
        
        // If we have pub coordinates, draw the route once the map loads
        if (pubCoordinates.length > 1 && map.current) {
          drawRoute(map.current, [location, ...pubCoordinates.map(p => ({ latitude: p.lat, longitude: p.lng }))]);
        }
      });

      map.current.on('error', (e) => {
        console.error("Map error:", e);
        setIsLoading(false);
        setIsMapError(true);
        toast.error("There was an error loading the map. Please check your API key and try again.");
      });

      return () => {
        markers.current.forEach(marker => marker.remove());
        userMarker.remove();
        
        // Clean up any route layers
        if (map.current && map.current.getLayer('route')) {
          map.current.removeLayer('route');
          map.current.removeSource('route');
        }
        
        map.current?.remove();
      };
    } catch (error) {
      console.error("Error creating map:", error);
      setIsLoading(false);
      setIsMapError(true);
      toast.error("Failed to initialize the map. Please refresh and try again.");
    }
  }, [location, onMapLoad]);

  // Draw a route between coordinates
  const drawRoute = (mapInstance: mapboxgl.Map, waypoints: Coordinates[]) => {
    if (waypoints.length < 2) return;
    
    // Create a LineString from the coordinates
    const lineString = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: waypoints.map(point => [point.longitude, point.latitude])
      }
    };
    
    // Add the line to the map
    if (mapInstance.getSource('route')) {
      // Update existing source
      (mapInstance.getSource('route') as mapboxgl.GeoJSONSource).setData(
        lineString as unknown as GeoJSON.Feature<GeoJSON.Geometry>
      );
    } else {
      // Add new source and layer
      mapInstance.addSource('route', {
        type: 'geojson',
        data: lineString as unknown as GeoJSON.Feature<GeoJSON.Geometry>
      });
      
      mapInstance.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 4,
          'line-opacity': 0.7
        }
      });
    }
  };

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
    
    // Draw route if we have pub coordinates
    if (pubCoordinates.length > 1 && map.current.loaded()) {
      drawRoute(map.current, [location, ...pubCoordinates.map(p => ({ latitude: p.lat, longitude: p.lng }))]);
    }
  }, [pubCoordinates, location]);

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
            There was a problem loading the map. Please check your internet connection and Mapbox API key.
          </p>
        </div>
      )}
    </div>
  );
};

export default Map;
