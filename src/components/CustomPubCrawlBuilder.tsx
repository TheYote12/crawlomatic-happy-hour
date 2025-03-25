import React, { useState, useEffect, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Place, PubCrawl, searchNearbyPubs } from '@/utils/mapUtils';
import { Coordinates } from '@/utils/locationUtils';
import { toast } from "sonner";
import { GoogleMapsApiKeyManager } from '@/utils/googleMapsApiKeyManager';
import PubList from './PubList';

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
  const [searchDistance, setSearchDistance] = useState(1); // kilometers
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [selectedPubs, setSelectedPubs] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  
  // Initialize map when the component mounts and location is available
  useEffect(() => {
    if (location && isOpen) {
      // Create a temporary map instance
      const tempMap = new google.maps.Map(document.createElement('div'), {
        center: { lat: location.latitude, lng: location.longitude },
        zoom: 15,
      });
      setMap(tempMap);
    }
    
    return () => {
      // Clean up the map instance when the component unmounts or closes
      setMap(null);
    };
  }, [location, isOpen]);
  
  // Handle search
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
        {
          lat: location.latitude,
          lng: location.longitude
        }, 
        radiusInMeters, 
        map, 
        20, 
        searchQuery
      );
      
      setSearchResults(pubs);
    } catch (error) {
      console.error('Error searching for pubs:', error);
      toast.error('Failed to search for pubs');
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle pub selection
  const handlePubSelect = (pub: Place) => {
    setSelectedPubs(prevPubs => {
      if (prevPubs.find(p => p.place_id === pub.place_id)) {
        return prevPubs.filter(p => p.place_id !== pub.place_id);
      } else {
        return [...prevPubs, pub];
      }
    });
  };
  
  // Handle create crawl
  const handleCreateCrawl = () => {
    if (selectedPubs.length < 2) {
      toast.error('Please select at least two pubs to create a crawl');
      return;
    }
    
    if (!location) {
      toast.error('Location not available');
      return;
    }
    
    // Create a custom pub crawl route
    const customCrawl: PubCrawl = {
      places: selectedPubs,
      route: null, // Route will be calculated in the parent component
      totalDistance: 0,
      totalDuration: 0,
      isCustom: true
    };
    
    onCreateCrawl(customCrawl);
    onClose();
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create Custom Pub Crawl</SheetTitle>
          <SheetDescription>
            Search for pubs and create your own custom route.
          </SheetDescription>
        </SheetHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="search">Search Term</Label>
            <Input 
              id="search" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="col-span-3" 
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="distance">Search Distance (km)</Label>
            <Slider
              id="distance"
              defaultValue={[searchDistance]}
              max={5}
              step={0.1}
              onValueChange={(value) => setSearchDistance(value[0])}
              className="col-span-3"
            />
            <div className="col-span-4 text-sm text-muted-foreground">
              {searchDistance.toFixed(1)} km
            </div>
          </div>
          
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
        
        {searchResults.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Search Results</h3>
            <ul>
              {searchResults.map(pub => (
                <li key={pub.place_id} className="py-2 border-b">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded"
                      checked={selectedPubs.find(p => p.place_id === pub.place_id) !== undefined}
                      onChange={() => handlePubSelect(pub)}
                    />
                    <span>{pub.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {selectedPubs.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Selected Pubs</h3>
            <PubList 
              pubs={selectedPubs}
              totalDistance={0}
              totalDuration={0}
              activePubIndex={-1}
              onPubClick={() => {}}
              onViewDetails={() => {}}
            />
          </div>
        )}
        
        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </SheetClose>
          <Button type="button" onClick={handleCreateCrawl}>Create Crawl</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CustomPubCrawlBuilder;
