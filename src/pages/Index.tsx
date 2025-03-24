
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

// Script to load Google Maps API
const loadGoogleMapsScript = () => {
  return new Promise<void>((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    // Placeholder API key - in a real app, you would use your own API key
    // and properly secure it server-side or with restrictions
    const API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = reject;
    
    // Define the callback function
    window.initMap = () => {
      resolve();
    };
    
    document.head.appendChild(script);
  });
};

const Index = () => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [pubCrawl, setPubCrawl] = useState<PubCrawl | null>(null);
  const [activePubIndex, setActivePubIndex] = useState(-1);
  const mapRef = useRef<google.maps.Map | null>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load Google Maps API
  useEffect(() => {
    const loadMaps = async () => {
      try {
        await loadGoogleMapsScript();
        setMapsLoaded(true);
        setIsMapLoading(false);
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
        toast.error('Failed to load Google Maps. Please reload the page.');
      }
    };
    
    loadMaps();
  }, []);

  // Handle location request
  const handleRequestLocation = useCallback(async () => {
    try {
      setLocationError(undefined);
      setIsLoading(true);
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
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
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Generate pub crawl
  const handleGenerateCrawl = useCallback(async (options: CrawlOptionsData) => {
    if (!location || !mapRef.current) return;
    
    try {
      setIsLoading(true);
      setPubCrawl(null);
      setActivePubIndex(-1);
      
      const radiusInMeters = options.distance * 1000;
      
      // Search for pubs near the user's location
      const pubs = await searchNearbyPubs(location, radiusInMeters, mapRef.current, options.stops * 2);
      
      if (pubs.length === 0) {
        toast.error('No pubs found nearby. Try increasing your search radius.');
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
                {isMapLoading || !mapsLoaded ? (
                  <div className="h-full w-full flex items-center justify-center bg-muted">
                    <LoadingSpinner size="large" />
                  </div>
                ) : (
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
                )}
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
