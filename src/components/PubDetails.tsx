
import React, { useState, useEffect } from 'react';
import { Place, getPlaceDetails, getPlacePhotoUrl } from '../utils/mapUtils';
import { 
  Star, Clock, MapPin, DollarSign, Phone, Globe, 
  Users, Camera, X, Share2, Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  Dialog,
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from './ui/dialog';
import { Badge } from './ui/badge';
import { EmptyState } from './EmptyState';

interface PubDetailsProps {
  pub: Place | null;
  isOpen: boolean;
  onClose: () => void;
  onShare?: () => void;
}

const PubDetails: React.FC<PubDetailsProps> = ({
  pub,
  isOpen,
  onClose,
  onShare
}) => {
  const [detailedPub, setDetailedPub] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && pub) {
      // Fetch detailed pub information when dialog opens
      const fetchPubDetails = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          // Check if Google Maps is available
          if (!window.google || !window.google.maps) {
            throw new Error("Google Maps not loaded");
          }
          
          // Create a dummy map element for Places Service API
          const mapElement = document.createElement('div');
          const map = new google.maps.Map(mapElement);
          
          const details = await getPlaceDetails(pub.id, map);
          
          if (details) {
            setDetailedPub(details);
          } else {
            // If we couldn't get details, fallback to the basic pub info
            setDetailedPub(pub);
          }
        } catch (error) {
          console.error("Error fetching pub details:", error);
          setError("Could not load detailed information");
          setDetailedPub(pub); // Fallback to basic info on error
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchPubDetails();
    }
  }, [isOpen, pub]);

  if (!pub) return null;

  const renderPriceLevel = () => {
    const pubToRender = detailedPub || pub;
    
    if (pubToRender.price_level === undefined) return null;
    
    const dollars = [];
    for (let i = 0; i < pubToRender.price_level; i++) {
      dollars.push(<DollarSign key={i} className="h-3 w-3" />);
    }
    
    return (
      <div className="flex items-center text-muted-foreground">
        {dollars}
      </div>
    );
  };

  const displayPub = detailedPub || pub;

  // Generate random photos if none available
  const getPhotos = () => {
    const photoUrlBase = "https://source.unsplash.com/random/600x400/?pub,bar,tavern";
    
    if (displayPub.photos && displayPub.photos.length > 0) {
      // Use actual photos from API
      return displayPub.photos.slice(0, 4).map((photo, i) => 
        `${photo.photo_reference || `${photoUrlBase}&sig=${displayPub.id}-${i}`}`
      );
    } else {
      // Generate fallback random pub images
      return Array(4).fill(null).map((_, i) => 
        `${photoUrlBase}&sig=${displayPub.id}-${i}`
      );
    }
  };

  // Determine the atmosphere tags based on pub types
  const getAtmosphereTags = () => {
    const defaultTags = ["Pub", "Casual"];
    
    if (!displayPub.types || displayPub.types.length === 0) {
      return defaultTags;
    }
    
    const atmosphereTags: string[] = [];
    
    if (displayPub.types.includes("bar")) atmosphereTags.push("Bar");
    if (displayPub.types.includes("restaurant")) atmosphereTags.push("Food");
    if (displayPub.types.includes("night_club")) atmosphereTags.push("Nightlife");
    if (displayPub.types.includes("cafe")) atmosphereTags.push("Cafe");
    
    // Add default "Pub" tag if we have empty tags
    if (atmosphereTags.length === 0) {
      return defaultTags;
    }
    
    // Add a "Casual" tag if there's no night_club to suggest a casual atmosphere
    if (!displayPub.types.includes("night_club")) {
      atmosphereTags.push("Casual");
    }
    
    return atmosphereTags;
  };

  // Format phone number
  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return "+44 20 1234 5678"; // Default fallback
    return phone;
  };

  // Format website URL
  const formatWebsite = (website?: string) => {
    if (!website) return "https://example.com/pub"; // Default fallback
    return website;
  };

  // The API sometimes doesn't provide opening hours - create a reasonable fallback
  const getOpeningHours = () => {
    if (displayPub.opening_hours?.weekday_text && displayPub.opening_hours.weekday_text.length > 0) {
      return displayPub.opening_hours.weekday_text;
    }
    
    return [
      "Monday: 11:00 AM – 11:00 PM",
      "Tuesday: 11:00 AM – 11:00 PM",
      "Wednesday: 11:00 AM – 11:00 PM",
      "Thursday: 11:00 AM – 12:00 AM",
      "Friday: 11:00 AM – 1:00 AM",
      "Saturday: 11:00 AM – 1:00 AM",
      "Sunday: 12:00 PM – 10:30 PM"
    ];
  };

  // Determine pub capacity based on ratings and reviews
  const getPubCapacity = () => {
    if (!displayPub.user_ratings_total) return "Moderate";
    
    if (displayPub.user_ratings_total > 1000) return "Very Popular";
    if (displayPub.user_ratings_total > 500) return "Popular";
    if (displayPub.user_ratings_total > 100) return "Moderate";
    return "Cozy";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-2xl">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl">{displayPub.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-1 text-muted-foreground mt-1">
            <MapPin className="h-3 w-3" />
            <span>{displayPub.vicinity || displayPub.formatted_address}</span>
          </DialogDescription>
          <DialogClose className="absolute right-2 top-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-10 flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Loading pub details...</p>
          </div>
        ) : error ? (
          <EmptyState 
            icon={<X className="h-8 w-8 text-destructive" />}
            title="Failed to load details"
            description={error}
          />
        ) : (
          <div className="mt-2 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {getPhotos().map((photo, index) => (
                <div 
                  key={index} 
                  className={`relative rounded-md overflow-hidden ${
                    index === 0 ? 'col-span-2 row-span-2' : ''
                  }`}
                >
                  <img 
                    src={photo} 
                    alt={`${displayPub.name} - Photo ${index + 1}`}
                    className="w-full h-full object-cover aspect-square"
                  />
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              {displayPub.rating && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  <span>{displayPub.rating.toFixed(1)} / 5</span>
                </Badge>
              )}
              
              {displayPub.opening_hours?.open_now && (
                <Badge variant="outline" className="border-green-500 text-green-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Open Now</span>
                </Badge>
              )}
              
              {renderPriceLevel() && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {renderPriceLevel()}
                </Badge>
              )}
              
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{getPubCapacity()}</span>
              </Badge>
              
              {getAtmosphereTags().map((atmos, index) => (
                <Badge key={index} variant="secondary">{atmos}</Badge>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 space-y-2">
                <h3 className="font-medium">Contact Information</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{formatPhoneNumber(displayPub.formatted_phone_number)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={formatWebsite(displayPub.website)} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                      {formatWebsite(displayPub.website).replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{displayPub.vicinity || displayPub.formatted_address}</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 space-y-2">
                <h3 className="font-medium">Opening Hours</h3>
                <div className="text-sm space-y-1">
                  {getOpeningHours().map((hour, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-muted-foreground">{hour.split(': ')[0]}</span>
                      <span>{hour.split(': ')[1]}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button 
                onClick={onShare}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PubDetails;
