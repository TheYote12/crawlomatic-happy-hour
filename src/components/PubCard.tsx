
import React from 'react';
import { Place, getPlacePhotoUrl } from '../utils/mapUtils';
import { MapPin, Star, Clock, DollarSign, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface PubCardProps {
  pub: Place;
  index: number;
  isActive?: boolean;
  onClick?: () => void;
  onViewDetails?: () => void;
}

const PubCard: React.FC<PubCardProps> = ({ 
  pub, 
  index, 
  isActive = false, 
  onClick,
  onViewDetails
}) => {
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

  const getImageUrl = () => {
    // Try to get the first actual photo from the pub
    if (pub.photos && pub.photos.length > 0 && pub.photos[0].photo_reference) {
      return getPlacePhotoUrl(pub.photos[0].photo_reference);
    }
    
    // Fallback to a placeholder if no photos available
    return `https://source.unsplash.com/random/400x200/?pub,bar&sig=${pub.id}`;
  };

  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg ${
        isActive 
          ? 'ring-2 ring-primary shadow-lg scale-[1.02]' 
          : 'ring-1 ring-border'
      }`}
    >
      <div className="relative h-48 bg-muted overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
        
        <img 
          src={getImageUrl()} 
          alt={pub.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-110"
          loading="lazy"
        />
        
        <div className="absolute top-3 left-3 bg-black/70 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium z-20">
          {index + 1}
        </div>
        
        {pub.opening_hours?.open_now && (
          <div className="absolute top-3 right-3 bg-green-500/90 text-white text-xs px-2 py-1 rounded-full flex items-center z-20">
            <Clock className="h-3 w-3 mr-1" />
            Open Now
          </div>
        )}
        
        <div 
          className="absolute bottom-3 right-3 z-20"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.();
          }}
        >
          <Button size="sm" variant="secondary" className="gap-1">
            <Info className="h-3 w-3" />
            Details
          </Button>
        </div>
      </div>
      
      <div 
        className="p-4 cursor-pointer"
        onClick={onClick}
      >
        <h3 className="font-medium text-lg mb-1 truncate">{pub.name}</h3>
        
        <div className="flex items-center text-muted-foreground text-sm mb-2">
          <MapPin className="h-3 w-3 mr-1" />
          <span className="truncate">{pub.vicinity}</span>
        </div>
        
        <div className="flex items-center justify-between">
          {pub.rating && (
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
              <span className="text-sm font-medium">{pub.rating.toFixed(1)}</span>
            </div>
          )}
          
          {renderPriceLevel()}
        </div>
      </div>
    </div>
  );
};

export default PubCard;
