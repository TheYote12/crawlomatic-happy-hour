
import React from 'react';
import { Place } from '../utils/mapUtils';
import { 
  Star, Clock, MapPin, DollarSign, Phone, Globe, 
  Users, Camera, X, Share2
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
  if (!pub) return null;

  const renderPriceLevel = () => {
    if (pub.price_level === undefined) return null;
    
    const dollars = [];
    for (let i = 0; i < pub.price_level; i++) {
      dollars.push(<DollarSign key={i} className="h-3 w-3" />);
    }
    
    return (
      <div className="flex items-center text-muted-foreground">
        {dollars}
      </div>
    );
  };

  // In a real app, you'd get these from an API
  const pubDetails = {
    phone: pub.formatted_phone_number || "+44 20 1234 5678",
    website: pub.website || "https://example.com/pub",
    hours: pub.opening_hours?.weekday_text || [
      "Monday: 11:00 AM – 11:00 PM",
      "Tuesday: 11:00 AM – 11:00 PM",
      "Wednesday: 11:00 AM – 11:00 PM",
      "Thursday: 11:00 AM – 12:00 AM",
      "Friday: 11:00 AM – 1:00 AM",
      "Saturday: 11:00 AM – 1:00 AM",
      "Sunday: 12:00 PM – 10:30 PM"
    ],
    photos: Array(4).fill(pub.photos?.[0]?.photo_reference || pub.id).map((id, i) => 
      `https://source.unsplash.com/random/600x400/?pub,bar,tavern&sig=${id}-${i}`
    ),
    capacity: "Moderate",
    atmosphere: ["Casual", "Traditional", "Cozy"]
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-2xl">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl">{pub.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-1 text-muted-foreground mt-1">
            <MapPin className="h-3 w-3" />
            <span>{pub.vicinity}</span>
          </DialogDescription>
          <DialogClose className="absolute right-2 top-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        
        <div className="mt-2 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {pubDetails.photos.map((photo, index) => (
              <div 
                key={index} 
                className={`relative rounded-md overflow-hidden ${
                  index === 0 ? 'col-span-2 row-span-2' : ''
                }`}
              >
                <img 
                  src={photo} 
                  alt={`${pub.name} - Photo ${index + 1}`}
                  className="w-full h-full object-cover aspect-square"
                />
              </div>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            {pub.rating && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                <span>{pub.rating.toFixed(1)} / 5</span>
              </Badge>
            )}
            
            {pub.opening_hours?.open_now && (
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
            
            {pubDetails.capacity && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{pubDetails.capacity}</span>
              </Badge>
            )}
            
            {pubDetails.atmosphere.map((atmos, index) => (
              <Badge key={index} variant="secondary">{atmos}</Badge>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 space-y-2">
              <h3 className="font-medium">Contact Information</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{pubDetails.phone}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a href={pubDetails.website} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    {pubDetails.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{pub.vicinity}</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 space-y-2">
              <h3 className="font-medium">Opening Hours</h3>
              <div className="text-sm space-y-1">
                {pubDetails.hours.map((hour, index) => (
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
      </DialogContent>
    </Dialog>
  );
};

export default PubDetails;
