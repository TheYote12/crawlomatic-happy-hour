
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
  Save, Share2, FileText, RefreshCw, 
  Coffee, Sparkles, Footprints, Accessibility
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
    <div className="flex gap-2 mt-4">
      <Button 
        variant="outline" 
        className="gap-2" 
        onClick={onSave}
      >
        <Save className="h-4 w-4" />
        Save Route
      </Button>
      
      <Button 
        variant="outline" 
        className="gap-2" 
        onClick={onShare}
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Optimize Route
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => onOptimize('distance')}
            className="gap-2 cursor-pointer"
          >
            <Footprints className="h-4 w-4" />
            <span>Shortest Distance</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onOptimize('atmosphere')}
            className="gap-2 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Best Atmosphere</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onOptimize('price')}
            className="gap-2 cursor-pointer"
          >
            <Coffee className="h-4 w-4" />
            <span>Best Value</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => onOptimize('accessibility')}
            className="gap-2 cursor-pointer"
          >
            <Accessibility className="h-4 w-4" />
            <span>Most Accessible</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default RouteOptions;
