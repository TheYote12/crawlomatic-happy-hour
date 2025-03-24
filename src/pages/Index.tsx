import React, { useEffect, useState, useRef, useCallback } from 'react';
import { toast } from "sonner";
import Header from '@/components/Header';
import LocationPermission from '@/components/LocationPermission';
import Map from '@/components/Map';
import CrawlOptions, { CrawlOptionsData } from '@/components/CrawlOptions';
import PubList from '@/components/PubList';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getCurrentLocation, Coordinates } from '@/utils/locationUtils';
import { Place, PubCrawl, searchNearbyPubs, createPubCrawlRoute } from '@/utils/mapUtils';
import { ArrowDown, Loader2 } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import MapboxApiKeyInput from '@/components/MapboxApiKeyInput';
import { MapboxApiKeyManager } from '@/utils/mapboxApiKeyManager';

const Index = () => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [pubCrawl, setPubCrawl] = useState<PubCrawl | null>(null);
  const [activePubIndex, setActivePubIndex] = useState(-1);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Check if Mapbox API key is available on component mount
  useEffect(() => {
    const apiKey = MapboxApiKeyManager.getApiKey();
    if (!apiKey) {
      toast.error('Mapbox API key is not set. Please set your API key to use the map.');
    }
  }, []);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle location request
  const handleRequestLocation = useCallback(async () => {
    try {
      setLocationError(undefined);
      setIsLoading(true);
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
      console.log("Location found:", currentLocation);
      toast.success('Location found!');
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Could not access your location. Please check your browser permissions and try again.');
      toast.error('Could not access your location.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle map load
  const handleMapLoad = useCallback((map: mapboxgl.Map) => {
    console.log("Map loaded and ready");
    mapRef.current = map;
    setIsMapLoading(false);
  }, []);

  // Generate pub crawl
  const handleGenerateCrawl = useCallback(async (options: CrawlOptionsData) => {
    if (!location || !mapRef.current) return;
    
    try {
      setIsLoading(true);
      setPubCrawl(null);
      setActivePubIndex(-1);
      
      const radiusInMeters = options.distance * 1000;
      
      // Check if Mapbox API key is available
      if (!MapboxApiKeyManager.isKeyValid()) {
        toast.error('Please set a valid Mapbox API key to search for pubs');
        setIsLoading(false);
        return;
      }
      
      // Search for pubs near the user's location
      const pubs = await searchNearbyPubs(location, radiusInMeters, mapRef.current, options.stops * 2);
      
      if (pubs.length === 0) {
        toast.error('No pubs found nearby. Try increasing your search radius.');
        setIsLoading(false);
        return;
      }
      
      // Create an optimized pub crawl route
      const newPubCrawl = await createPubCrawlRoute(location, pubs, options.stops);
      
      setPubCrawl(newPubCrawl);
      setActivePubIndex(0);
      
      // Scroll to results
      if (resultsRef.current) {
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      
      toast.success(`Found ${newPubCrawl.places.length} great pubs for your crawl!`);
    } catch (error) {
      console.error('Error generating pub crawl:', error);
      toast.error('Failed to generate pub crawl. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  // Handle pub card click
  const handlePubClick = useCallback((index: number) => {
    setActivePubIndex(index);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header isScrolled={isScrolled} />
      
      <main className="pt-16 pb-16 px-4 max-w-7xl mx-auto">
        {!location ? (
          <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
            <LocationPermission 
              onRequestLocation={handleRequestLocation} 
              error={locationError} 
            />
          </div>
        ) : (
          <div className="space-y-8 pt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div 
                className="h-[30vh] lg:h-[70vh] rounded-2xl overflow-hidden relative"
                style={{ minHeight: '400px' }}
              >
                <Map 
                  location={location}
                  route={pubCrawl?.route || null}
                  pubCoordinates={(pubCrawl?.places || []).map(place => ({
                    lat: place.geometry.location.lat,
                    lng: place.geometry.location.lng,
                    name: place.name
                  }))}
                  activePubIndex={activePubIndex}
                  onMapLoad={handleMapLoad}
                />
                <MapboxApiKeyInput />
              </div>
              
              <div ref={optionsRef}>
                <CrawlOptions 
                  onGenerate={handleGenerateCrawl} 
                  isLoading={isLoading} 
                />
              </div>
            </div>
            
            {pubCrawl && pubCrawl.places.length > 0 && (
              <>
                <div className="flex justify-center my-8">
                  <div className="animate-bounce">
                    <ArrowDown className="h-6 w-6 text-primary" />
                  </div>
                </div>
                
                <div ref={resultsRef}>
                  <h2 className="text-2xl font-medium mb-6 text-center animate-fade-in">Your Pub Crawl</h2>
                  <PubList 
                    pubs={pubCrawl.places}
                    totalDistance={pubCrawl.totalDistance}
                    totalDuration={pubCrawl.totalDuration}
                    activePubIndex={activePubIndex}
                    onPubClick={handlePubClick}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
