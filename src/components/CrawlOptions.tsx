
import React, { useState } from 'react';
import { Beer, Ruler, Map } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface CrawlOptionsProps {
  onGenerate: (options: CrawlOptionsData) => void;
  isLoading: boolean;
}

export interface CrawlOptionsData {
  distance: number;
  stops: number;
}

const CrawlOptions: React.FC<CrawlOptionsProps> = ({ onGenerate, isLoading }) => {
  const [distance, setDistance] = useState<number>(1);
  const [stops, setStops] = useState<number>(5);
  const isMobile = useIsMobile();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ distance, stops });
  };
  
  return (
    <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 animate-slide-up">
      <h2 className="text-lg sm:text-xl font-medium mb-4 sm:mb-6 text-center">Create Your Pub Crawl</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 sm:space-y-5">
          <div>
            <label className="flex items-center text-xs sm:text-sm font-medium mb-2 text-muted-foreground">
              <Ruler className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Search Radius: {distance} km
            </label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={distance}
              onChange={(e) => setDistance(parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0.5 km</span>
              <span>5 km</span>
            </div>
          </div>
          
          <div>
            <label className="flex items-center text-xs sm:text-sm font-medium mb-2 text-muted-foreground">
              <Beer className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Number of Stops: {stops}
            </label>
            <input
              type="range"
              min="2"
              max="10"
              step="1"
              value={stops}
              onChange={(e) => setStops(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>2 stops</span>
              <span>10 stops</span>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 sm:py-3 rounded-lg sm:rounded-xl bg-primary text-primary-foreground flex items-center justify-center transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                <span className="text-sm sm:text-base">Generating...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <Map className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="text-sm sm:text-base">Generate Pub Crawl</span>
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrawlOptions;
