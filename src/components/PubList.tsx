
import React from 'react';
import PubCard from './PubCard';
import { Place } from '../utils/mapUtils';
import { formatDistance } from '../utils/locationUtils';
import { Calendar, Clock, Route } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PubListProps {
  pubs: Place[];
  totalDistance: number;
  totalDuration: number;
  activePubIndex: number;
  onPubClick: (index: number) => void;
  onViewDetails?: (pub: Place) => void;
}

const PubList: React.FC<PubListProps> = ({
  pubs,
  totalDistance,
  totalDuration,
  activePubIndex,
  onPubClick,
  onViewDetails
}) => {
  const isMobile = useIsMobile();
  
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)} mins`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  if (pubs.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No pubs found for your crawl. Try adjusting your settings.
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      {isMobile ? (
        <div className="space-y-3 mb-5">
          <div className="p-3 glass rounded-lg flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Stops</p>
              <p className="text-sm font-medium">{pubs.length} pubs</p>
            </div>
          </div>
          
          <div className="p-3 glass rounded-lg flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
              <Route className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Distance</p>
              <p className="text-sm font-medium">{formatDistance(totalDistance)}</p>
            </div>
          </div>
          
          <div className="p-3 glass rounded-lg flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-medium">{formatDuration(totalDuration)}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-5 p-4 glass rounded-xl">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stops</p>
              <p className="font-medium">{pubs.length} pubs</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
              <Route className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Distance</p>
              <p className="font-medium">{formatDistance(totalDistance)}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">{formatDuration(totalDuration)}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {pubs.map((pub, index) => (
          <PubCard
            key={pub.id}
            pub={pub}
            index={index}
            isActive={index === activePubIndex}
            onClick={() => onPubClick(index)}
            onViewDetails={() => onViewDetails?.(pub)}
          />
        ))}
      </div>
    </div>
  );
};

export default PubList;
