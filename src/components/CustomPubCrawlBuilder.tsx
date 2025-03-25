
import React, { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle, MapPin, Trash2 } from 'lucide-react';
import { createCustomPubCrawlRoute, Place, PubCrawl } from '@/utils/mapUtils';
import { Coordinates } from '@/utils/locationUtils';
import { toast } from 'sonner';
import LoadingSpinner from './LoadingSpinner';
import { ScrollArea } from './ui/scroll-area';
import PubCard from './PubCard';
import { Alert, AlertDescription } from './ui/alert';

interface CustomPubCrawlBuilderProps {
  location: Coordinates | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateCrawl: (crawl: PubCrawl) => void;
}

const CustomPubCrawlBuilder: React.FC<CustomPubCrawlBuilderProps> = ({
  location,
  isOpen,
  onClose,
  onCreateCrawl
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [selectedPubs, setSelectedPubs] = useState<Place[]>([]);
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);

  // Reset state when dialog is opened
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSearchResults([]);
      setSelectedPubs([]);
    }
  }, [isOpen]);

  // Handle search
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim() || !location) {
      toast.error('Please enter a search term');
      return;
    }

    try {
      setIsSearching(true);
      
      // Create a PlacesService instance
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        toast.error('Google Maps Places API not loaded');
        return;
      }
      
      const placesService = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
      
      const request = {
        location: new window.google.maps.LatLng(location.lat, location.lng),
        radius: 5000, // 5km
        keyword: searchTerm,
        type: 'bar' // Focus on bars
      };
      
      placesService.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          // Convert Google Places results to our Place interface
          const places: Place[] = results.map(result => ({
            id: result.place_id || Math.random().toString(36).substring(2, 15),
            place_id: result.place_id,
            name: result.name || 'Unknown Place',
            vicinity: result.vicinity || 'No address available',
            rating: result.rating,
            geometry: {
              location: {
                lat: result.geometry?.location?.lat() || 0,
                lng: result.geometry?.location?.lng() || 0
              }
            },
            photos: result.photos?.map(photo => ({ 
              photo_reference: photo.getUrl() || '' 
            })),
            price_level: result.price_level
          }));
          
          setSearchResults(places);
          
          if (places.length === 0) {
            toast.info('No places found with that search term');
          }
        } else {
          console.error('Places search error:', status);
          toast.error('Could not find any places. Try another search term.');
          setSearchResults([]);
        }
        
        setIsSearching(false);
      });
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error performing search');
      setIsSearching(false);
    }
  }, [searchTerm, location]);

  // Add pub to selection
  const handleAddPub = useCallback((pub: Place) => {
    setSelectedPubs(prev => {
      // Check if already added
      if (prev.some(p => p.id === pub.id)) {
        toast.info('This pub is already in your selection');
        return prev;
      }
      
      // Add to selection
      toast.success(`Added ${pub.name} to your custom crawl`);
      return [...prev, pub];
    });
  }, []);

  // Remove pub from selection
  const handleRemovePub = useCallback((pubId: string) => {
    setSelectedPubs(prev => {
      const newPubs = prev.filter(p => p.id !== pubId);
      return newPubs;
    });
  }, []);

  // Create the custom pub crawl
  const handleCreateRoute = useCallback(async () => {
    if (!location) {
      toast.error('Location not available');
      return;
    }
    
    if (selectedPubs.length < 2) {
      toast.error('Please select at least 2 pubs for your crawl');
      return;
    }
    
    try {
      setIsCreatingRoute(true);
      
      // Create a custom pub crawl route
      const customCrawl = await createCustomPubCrawlRoute(location, selectedPubs);
      
      onCreateCrawl(customCrawl);
      onClose();
      toast.success('Custom pub crawl created!');
    } catch (error) {
      console.error('Error creating custom crawl:', error);
      toast.error('Failed to create custom pub crawl');
    } finally {
      setIsCreatingRoute(false);
    }
  }, [location, selectedPubs, onCreateCrawl, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold mb-2">
            Build Your Own Pub Crawl
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search input */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search for pubs to add..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? <LoadingSpinner size="sm" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          
          {/* Search results */}
          {searchResults.length > 0 && (
            <>
              <h3 className="text-sm font-medium text-gray-500">
                Search Results ({searchResults.length})
              </h3>
              
              <ScrollArea className="h-60 rounded-md border">
                <div className="p-4 space-y-2">
                  {searchResults.map(pub => (
                    <div 
                      key={pub.id} 
                      className="p-3 rounded-lg border hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-medium">{pub.name}</h4>
                        <p className="text-xs text-gray-500">{pub.vicinity}</p>
                        {pub.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs">⭐ {pub.rating}</span>
                            {pub.price_level && (
                              <span className="text-xs">
                                {Array(pub.price_level).fill('£').join('')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleAddPub(pub)}
                        className="h-8 w-8 p-0"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
          
          {/* Selected pubs */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Your Selection ({selectedPubs.length})
            </h3>
            
            {selectedPubs.length === 0 ? (
              <div className="rounded-md border p-4 text-center text-sm text-gray-500">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                <p>No pubs selected yet. Search and add some above!</p>
              </div>
            ) : (
              <ScrollArea className="h-60 rounded-md border">
                <div className="p-4 space-y-2">
                  {selectedPubs.map((pub, index) => (
                    <div 
                      key={pub.id} 
                      className="p-3 rounded-lg border hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{pub.name}</h4>
                          <p className="text-xs text-gray-500">{pub.vicinity}</p>
                        </div>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleRemovePub(pub.id)}
                        className="h-8 w-8 p-0 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          
          {selectedPubs.length > 0 && (
            <Alert className="mt-4">
              <AlertDescription>
                Your custom crawl will start at your current location and visit each pub in the order shown above.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              disabled={selectedPubs.length < 2 || isCreatingRoute} 
              onClick={handleCreateRoute}
            >
              {isCreatingRoute ? <LoadingSpinner size="sm" /> : 'Create Pub Crawl'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomPubCrawlBuilder;
