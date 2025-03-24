
import React from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { 
  BookmarkPlus, Share, Sliders, 
  MapPin, ArrowRight, BarChart, Accessibility
} from 'lucide-react';
import { PubCrawl } from '../utils/mapUtils';

interface RouteOptionsProps {
  pubCrawl: PubCrawl | null;
  onSave: () => void;
  onShare: () => void;
  onOptimize: (preference: OptimizePreference) => void;
}

export type OptimizePreference = 
  | 'distance' 
  | 'atmosphere' 
  | 'price' 
  | 'accessibility';

const RouteOptions: React.FC<RouteOptionsProps> = ({
  pubCrawl,
  onSave,
  onShare,
  onOptimize
}) => {
  if (!pubCrawl) return null;

  return (
    <div className="flex flex-wrap gap-3 mt-4">
      <Button 
        variant="outline" 
        className="rounded-full px-5 py-2 border border-gray-200 text-gray-800 bg-white hover:bg-gray-50" 
        onClick={onSave}
      >
        <BookmarkPlus className="h-4 w-4 mr-2 text-primary" />
        Save Route
      </Button>
      
      <Button 
        variant="outline" 
        className="rounded-full px-5 py-2 border border-gray-200 text-gray-800 bg-white hover:bg-gray-50"
        onClick={onShare}
      >
        <Share className="h-4 w-4 mr-2 text-primary" />
        Share
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="rounded-full px-5 py-2 border border-gray-200 text-gray-800 bg-white hover:bg-gray-50"
          >
            <Sliders className="h-4 w-4 mr-2 text-primary" />
            Optimize
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl border border-gray-200 p-1 shadow-lg">
          <DropdownMenuItem 
            onClick={() => onOptimize('distance')}
            className="gap-2 cursor-pointer rounded-lg my-1 text-sm font-medium"
          >
            <MapPin className="h-4 w-4 text-primary" />
            <span>Shortest Distance</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onOptimize('atmosphere')}
            className="gap-2 cursor-pointer rounded-lg my-1 text-sm font-medium"
          >
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>Best Atmosphere</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onOptimize('price')}
            className="gap-2 cursor-pointer rounded-lg my-1 text-sm font-medium"
          >
            <BarChart className="h-4 w-4 text-primary" />
            <span>Best Value</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem 
            onClick={() => onOptimize('accessibility')}
            className="gap-2 cursor-pointer rounded-lg my-1 text-sm font-medium"
          >
            <Accessibility className="h-4 w-4 text-primary" />
            <span>Most Accessible</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default RouteOptions;
