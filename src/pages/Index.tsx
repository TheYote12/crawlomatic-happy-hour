
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { toast } from "sonner";
import Header from '@/components/Header';
import LocationPermission from '@/components/LocationPermission';
import Map from '@/components/Map';
import CrawlOptions, { CrawlOptionsData } from '@/components/CrawlOptions';
import PubList from '@/components/PubList';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getCurrentLocation, Coordinates } from '@/utils/locationUtils';
import { 
  Place, 
  PubCrawl, 
  searchNearbyPubs, 
  createPubCrawlRoute,
  createCustomPubCrawlRoute
} from '@/utils/mapUtils';
import { ChevronDown, BookmarkPlus, ArrowDownToLine, PlusCircle, MapPin } from 'lucide-react';
import GoogleMapsApiKeyInput from '@/components/GoogleMapsApiKeyInput';
import { GoogleMapsApiKeyManager } from '@/utils/googleMapsApiKeyManager';
import PubDetails from '@/components/PubDetails';
import SaveRouteDialog from '@/components/SaveRouteDialog';
import SavedRoutes from '@/components/SavedRoutes';
import ShareDialog from '@/components/ShareDialog';
import RouteOptions, { OptimizePreference } from '@/components/RouteOptions';
import { SavedRoute } from '@/utils/savedRoutesManager';
import CommunityRoutes from '@/components/CommunityRoutes';
import CustomPubCrawlBuilder from '@/components/CustomPubCrawlBuilder';
import { Button } from '@/components/ui/button';

const Index = () => {
  // Fix the ordering of useState declarations
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [pubCrawl, setPubCrawl] = useState<PubCrawl | null>(null);
  const [activePubIndex, setActivePubIndex] = useState(-1);
  const [selectedPub, setSelectedPub] = useState<Place | null>(null);
  const [showPubDetails, setShowPubDetails] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSavedRoutes, setShowSavedRoutes] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  
  const mapRef = useRef<google.maps.Map | null>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const lastOptionsRef = useRef<CrawlOptionsData | null>(null);

  // Set default API key on component mount if not already set
  useEffect(() => {
    const apiKey = GoogleMapsApiKeyManager.getApiKey();
    console.log("Current API key status:", apiKey ? "Set" : "Not set");
    
    if (!apiKey) {
      // Force set the default key from GoogleMapsApiKeyManager
      const defaultKey = 'AIzaSyA1I9dNXno-OQUM4fYc-0Fogsr4QQgJ0_E';
      GoogleMapsApiKeyManager.setApiKey(defaultKey);
      console.log("Default API key applied");
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
      setLocationError(error instanceof Error ? error.message : 'Could not access your location. Please check your browser permissions and try again.');
      toast.error('Could not access your location.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle map load
  const handleMapLoad = useCallback((map: google.maps.Map) => {
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
      lastOptionsRef.current = options;
      
      const radiusInMeters = options.distance * 1000;
      
      // Check if Google Maps API key is available
      if (!GoogleMapsApiKeyManager.isKeyValid()) {
        toast.error('Please set a valid Google Maps API key to search for pubs');
        setIsLoading(false);
        return;
      }
      
      // Search for pubs near the user's location
      console.log("Attempting to search for pubs...");
      try {
        const pubs = await searchNearbyPubs(
          { 
            lat: location.latitude, 
            lng: location.longitude 
          }, 
          radiusInMeters, 
          mapRef.current, 
          options.stops * 2
        );
        
        if (pubs.length === 0) {
          toast.error('No pubs found nearby. Try increasing your search radius.');
          setIsLoading(false);
          return;
        }
        
        // Create an optimized pub crawl route
        const newPubCrawl = await createPubCrawlRoute(
          { 
            lat: location.latitude, 
            lng: location.longitude 
          }, 
          pubs, 
          options.stops
        );
        
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
        console.error('Error during pub search:', error);
        
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Check specific API errors
        if (errorMessage.includes('Places API')) {
          toast.error(
            'Google Places API issue detected. Please ensure you have enabled the Places API in your Google Cloud Console.',
            { 
              duration: 6000,
              description: 'Go to Google Cloud Console > APIs & Services > Library > search for "Places API" and click "Enable"' 
            }
          );
        } else if (errorMessage.includes('OVER_QUERY_LIMIT')) {
          toast.error('You have exceeded your Google Places API quota for today');
        } else if (errorMessage.includes('ZERO_RESULTS')) {
          toast.error('No pubs found nearby. Try increasing your search radius.');
        } else {
          toast.error('Failed to generate pub crawl. Please try again later.');
        }
      }
    } catch (error) {
      console.error('Error generating pub crawl:', error);
      toast.error('Failed to generate pub crawl. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  // Handle custom pub crawl creation
  const handleCreateCustomCrawl = useCallback((customCrawl: PubCrawl) => {
    // Add isCustom flag to the crawl
    const customizedCrawl: PubCrawl = {
      ...customCrawl,
      isCustom: true
    };
    
    setPubCrawl(customizedCrawl);
    setActivePubIndex(0);
    
    // Scroll to results
    if (resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  // Handle pub card click
  const handlePubClick = useCallback((index: number) => {
    setActivePubIndex(index);
  }, []);

  // Handle pub details click
  const handlePubDetailsClick = useCallback((pub: Place) => {
    setSelectedPub(pub);
    setShowPubDetails(true);
  }, []);

  // Handle loading a saved route
  const handleLoadSavedRoute = useCallback((savedRoute: SavedRoute) => {
    setPubCrawl(savedRoute.pubCrawl);
    setActivePubIndex(0);
    
    // Scroll to results
    if (resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    
    toast.success(`Loaded route: ${savedRoute.name}`);
  }, []);

  // Handle route optimization
  const handleOptimizeRoute = useCallback((preference: OptimizePreference) => {
    if (!pubCrawl || !location) {
      toast.error('No route to optimize');
      return;
    }
    
    // In a real app, this would call an API to optimize the route based on preference
    // For this demo, we'll just simulate optimization with a delay
    toast.info(`Optimizing route for ${preference}...`);
    setIsLoading(true);
    
    setTimeout(() => {
      try {
        // Create a copy of the pub crawl to simulate optimization
        const optimizedCrawl = {...pubCrawl};
        
        // Simulate different optimizations
        if (preference === 'distance') {
          // Sort by distance from current pub
          optimizedCrawl.places = [...optimizedCrawl.places].sort((a, b) => {
            if (!activePubIndex || activePubIndex < 0) return 0;
            const currentPub = optimizedCrawl.places[activePubIndex];
            const distA = calculateDistance(currentPub, a);
            const distB = calculateDistance(currentPub, b);
            return distA - distB;
          });
        } else if (preference === 'price') {
          // Sort by price level (lowest first)
          optimizedCrawl.places = [...optimizedCrawl.places].sort((a, b) => {
            return (a.price_level || 999) - (b.price_level || 999);
          });
        } else if (preference === 'atmosphere') {
          // Sort by rating (highest first)
          optimizedCrawl.places = [...optimizedCrawl.places].sort((a, b) => {
            return (b.rating || 0) - (a.rating || 0);
          });
        }
        
        // Update routes in a real app would recalculate this
        setPubCrawl(optimizedCrawl);
        setActivePubIndex(0);
        
        toast.success(`Route optimized for ${preference}`);
      } catch (error) {
        console.error('Error optimizing route:', error);
        toast.error('Failed to optimize route');
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  }, [pubCrawl, location, activePubIndex]);

  // Helper function to calculate distance between two pubs
  const calculateDistance = (pub1: Place, pub2: Place): number => {
    const lat1 = pub1.geometry.location.lat;
    const lng1 = pub1.geometry.location.lng;
    const lat2 = pub2.geometry.location.lat;
    const lng2 = pub2.geometry.location.lng;
    
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
  };

  return (
    <div className="min-h-screen">
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
            <div className="flex justify-between items-center">
              <Button 
                variant="outline" 
                className="rounded-full px-5 py-2 flex items-center gap-2"
                onClick={() => setShowCustomBuilder(true)}
              >
                <PlusCircle className="h-4 w-4 text-primary" />
                <span>Create Custom Crawl</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="rounded-full px-5 py-2 flex items-center gap-2"
                onClick={() => setShowSavedRoutes(true)}
              >
                <BookmarkPlus className="h-4 w-4 text-primary" />
                <span>Saved Routes</span>
              </Button>
            </div>
            
            {location && (
              <CommunityRoutes
                userLocation={{
                  lat: location.latitude,
                  lng: location.longitude,
                  name: 'Current Location'
                }}
                onSelectRoute={handleLoadSavedRoute}
              />
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div 
                className="h-[30vh] lg:h-[70vh] rounded-3xl overflow-hidden relative shadow-xl"
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
                <GoogleMapsApiKeyInput />
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
                  <div className="animate-bounce p-2 glass rounded-full shadow-md">
                    <ChevronDown className="h-6 w-6 text-primary" />
                  </div>
                </div>
                
                <div ref={resultsRef} className="glass-card p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <h2 className="text-2xl sm:text-3xl font-medium gradient-text">
                      {pubCrawl.isCustom ? 'Your Custom Pub Crawl' : 'Your Pub Crawl'}
                    </h2>
                    
                    <RouteOptions 
                      pubCrawl={pubCrawl}
                      onSave={() => setShowSaveDialog(true)}
                      onShare={() => setShowShareDialog(true)}
                      onOptimize={handleOptimizeRoute}
                    />
                  </div>
                  
                  <PubList 
                    pubs={pubCrawl.places}
                    totalDistance={pubCrawl.totalDistance}
                    totalDuration={pubCrawl.totalDuration}
                    activePubIndex={activePubIndex}
                    onPubClick={handlePubClick}
                    onViewDetails={handlePubDetailsClick}
                  />
                </div>
              </>
            )}
          </div>
        )}
        
        {/* Dialogs and modals */}
        <PubDetails 
          pub={selectedPub}
          isOpen={showPubDetails}
          onClose={() => setShowPubDetails(false)}
          onShare={() => {
            setShowPubDetails(false);
            setShowShareDialog(true);
          }}
        />
        
        <SaveRouteDialog 
          pubCrawl={pubCrawl}
          isOpen={showSaveDialog}
          onClose={() => setShowSaveDialog(false)}
          userLocation={location ? { 
            lat: location.latitude, 
            lng: location.longitude,
            name: 'Current Location'
          } : undefined}
        />
        
        <SavedRoutes 
          isOpen={showSavedRoutes}
          onClose={() => setShowSavedRoutes(false)}
          onLoadRoute={handleLoadSavedRoute}
        />
        
        <ShareDialog 
          pubCrawl={pubCrawl}
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
        />
        
        <CustomPubCrawlBuilder
          location={location}
          isOpen={showCustomBuilder}
          onClose={() => setShowCustomBuilder(false)}
          onCreateCrawl={handleCreateCustomCrawl}
        />
      </main>
    </div>
  );
};

export default Index;
