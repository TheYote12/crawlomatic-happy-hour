import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Coordinates } from '@/utils/locationUtils';
import { 
  Place, 
  PubCrawl, 
  searchNearbyPubs,
  createCustomPubCrawlRoute
} from '@/utils/mapUtils';
import { GoogleMapsApiKeyManager } from '@/utils/googleMapsApiKeyManager';
import { toast } from 'sonner';
import { Plus, Trash2, MapPin, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import LoadingSpinner from './LoadingSpinner';

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
  const [searchDistance, setSearchDistance] = useState(2); // km
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [selectedPubs, setSelectedPubs] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const isMobile = useIsMobile();
  
  // Initialize map instance - in a real app, you'd use a map component
  useEffect(() => {
    if (isOpen && !map && window.google) {
      const mapInstance = new window.google.maps.Map(
        document.createElement('div'), // dummy element
        { center: { lat: 0, lng: 0 }, zoom: 15 }
      );
      setMap(mapInstance);
    }
    
    return () => {
      setMap(null);
    };
  }, [isOpen, map]);
  
  const handleSearch = async () => {
    if (!location || !map) {
      toast.error('Location not available');
      return;
    }
    
    if (!GoogleMapsApiKeyManager.isKeyValid()) {
      toast.error('Please set a valid Google Maps API key to search for pubs');
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Search with keyword filter
      const radiusInMeters = searchDistance * 1000;
      let searchQuery = 'pub';
      
      if (searchTerm.trim()) {
        searchQuery += ' ' + searchTerm.trim();
      }
      
      const pubs = await searchNearbyPubs(
        location, 
        radiusInMeters, 
        map, 
        20, 
        searchQuery
      );
      
      if (pubs.length === 0) {
        toast.error('No pubs found with that search term. Try another keyword or increase the distance.');
      } else {
        setSearchResults(pubs);
        toast.success(`Found ${pubs.length} pubs`);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error searching for pubs');
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleAddPub = (pub: Place) => {
    // Don't add duplicates
    if (selectedPubs.some(p => p.place_id === pub.place_id)) {
      toast.error('This pub is already in your crawl');
      return;
    }
    
    // Add pub to selected list
    setSelectedPubs([...selectedPubs, pub]);
    toast.success(`Added ${pub.name} to your crawl`);
  };
  
  const handleRemovePub = (pubId: string) => {
    setSelectedPubs(selectedPubs.filter(pub => pub.place_id !== pubId));
  };
  
  const handleCreateCrawl = async () => {
    if (!location) {
      toast.error('Location not available');
      return;
    }
    
    if (selectedPubs.length < 2) {
      toast.error('Please select at least 2 pubs for your crawl');
      return;
    }
    
    try {
      // Create a custom crawl route
      const customCrawl = await createCustomPubCrawlRoute(
        location, 
        selectedPubs
      );
      
      onCreateCrawl(customCrawl);
      toast.success('Custom pub crawl created!');
      
      // Reset state
      setSelectedPubs([]);
      setSearchResults([]);
      setSearchTerm('');
      
      onClose();
    } catch (error) {
      console.error('Error creating custom crawl:', error);
      toast.error('Failed to create custom pub crawl');
    }
  };
  
  const renderPubItem = (pub: Place, isSelected: boolean = false) => (
    <div 
      key={pub.place_id}
      className="p-3 border border-gray-200 rounded-lg flex justify-between items-center bg-white hover:bg-gray-50"
    >
      <div className="flex flex-col">
        <div className="font-medium text-sm">{pub.name}</div>
        <div className="text-xs text-gray-500 truncate max-w-[200px]">
          {pub.vicinity || pub.formatted_address}
        </div>
      </div>
      
      <Button
        variant={isSelected ? "destructive" : "default"}
        size="xs"
        className="rounded-full flex items-center gap-1 h-8"
        onClick={() => isSelected 
          ? handleRemovePub(pub.place_id) 
          : handleAddPub(pub)
        }
      >
        {isSelected ? (
          <>
            <Trash2 className="h-3 w-3" />
            <span>Remove</span>
          </>
        ) : (
          <>
            <Plus className="h-3 w-3" />
            <span>Add</span>
          </>
        )}
      </Button>
    </div>
  );
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col rounded-xl ${isOpen ? 'overflow-y-auto' : ''}`}>
        <DialogHeader>
          <DialogTitle>Create Custom Pub Crawl</DialogTitle>
          <DialogDescription>
            Search for pubs and create your own custom pub crawl.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          {/* Search inputs */}
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-3">
              <Label htmlFor="pub-search" className="sr-only">Search for pubs</Label>
              <Input
                id="pub-search"
                placeholder="Search for pubs (e.g., irish, craft beer, etc.)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="col-span-1">
              <Label htmlFor="search-distance" className="sr-only">Distance (km)</Label>
              <Input
                id="search-distance"
                type="number"
                placeholder="Distance (km)"
                min={0.5}
                max={10}
                step={0.5}
                value={searchDistance}
                onChange={(e) => setSearchDistance(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleSearch} 
            disabled={isSearching}
            className="rounded-full"
          >
            {isSearching ? 'Searching...' : 'Search for Pubs'}
          </Button>
          
          {/* Selected pubs section */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-base font-medium">Selected Pubs ({selectedPubs.length})</Label>
              {selectedPubs.length > 0 && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setSelectedPubs([])}
                  className="h-6 text-xs"
                >
                  Clear All
                </Button>
              )}
            </div>
            
            {selectedPubs.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  Add pubs from the search results to create your custom crawl
                </p>
              </div>
            ) : (
              <div className="grid gap-2 max-h-[150px] overflow-y-auto p-1">
                {selectedPubs.map(pub => renderPubItem(pub, true))}
              </div>
            )}
          </div>
          
          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base font-medium">Search Results ({searchResults.length})</Label>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setSearchResults([])}
                  className="h-6 text-xs"
                >
                  Clear Results
                </Button>
              </div>
              
              <div className="grid gap-2 max-h-[200px] overflow-y-auto p-1">
                {searchResults.map(pub => {
                  // Don't show pubs that are already selected
                  if (selectedPubs.some(p => p.place_id === pub.place_id)) {
                    return null;
                  }
                  return renderPubItem(pub);
                })}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} className="rounded-full border-gray-200">
            Cancel
          </Button>
          <Button 
            onClick={handleCreateCrawl} 
            disabled={selectedPubs.length < 2}
            className="rounded-full"
          >
            Create Custom Crawl
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomPubCrawlBuilder;
