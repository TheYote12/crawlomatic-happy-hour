
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { SavedRoute, SavedRoutesManager } from '../utils/savedRoutesManager';
import { MapPin, Users, Clock, Route, Star } from 'lucide-react';
import { formatDistance } from '../utils/locationUtils';
import { useIsMobile } from '@/hooks/use-mobile';

interface CommunityRoutesProps {
  userLocation?: { lat: number; lng: number };
  onSelectRoute: (route: SavedRoute) => void;
}

const CommunityRoutes: React.FC<CommunityRoutesProps> = ({ 
  userLocation, 
  onSelectRoute 
}) => {
  const [popularRoutes, setPopularRoutes] = useState<SavedRoute[]>([]);
  const [nearbyRoutes, setNearbyRoutes] = useState<SavedRoute[]>([]);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Get popular routes
    const popular = SavedRoutesManager.getPopularCommunityRoutes(6);
    setPopularRoutes(popular);
    
    // Get nearby routes if user location is available
    if (userLocation) {
      const nearby = SavedRoutesManager.getNearbyCommunityRoutes(userLocation, 10);
      setNearbyRoutes(nearby);
    }
  }, [userLocation]);
  
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };
  
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)} mins`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };
  
  // Helper function to render a route card
  const renderRouteCard = (route: SavedRoute) => (
    <Card key={route.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base sm:text-lg">{route.name}</CardTitle>
        <CardDescription className="line-clamp-2 text-xs sm:text-sm">
          {route.description || `A pub crawl with ${route.pubCrawl.places.length} stops`}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-1">
        <div className="flex flex-col gap-1 text-xs sm:text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-primary" />
            <span>{route.pubCrawl.places.length} stops</span>
          </div>
          <div className="flex items-center gap-1">
            <Route className="h-3 w-3 text-primary" />
            <span>{formatDistance(route.pubCrawl.totalDistance)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-primary" />
            <span>{formatDuration(route.pubCrawl.totalDuration)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-primary" />
            <span>By {route.author || 'Anonymous'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={() => onSelectRoute(route)} 
          variant="default" 
          size={isMobile ? "xs" : "sm"}
          className="w-full rounded-full"
        >
          Use This Route
        </Button>
      </CardFooter>
    </Card>
  );
  
  // Check if we have any community routes
  const hasCommunityRoutes = popularRoutes.length > 0 || nearbyRoutes.length > 0;
  
  if (!hasCommunityRoutes) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
        <div className="text-center py-8">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Community Routes Yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Be the first to create and share a pub crawl with the community! Create a route and check "Share with community" when saving.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
      <h2 className="text-2xl sm:text-3xl font-medium text-gray-900 mb-6">
        Community Pub Crawls
      </h2>
      
      {nearbyRoutes.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Nearby Routes</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearbyRoutes.slice(0, 3).map(renderRouteCard)}
          </div>
        </div>
      )}
      
      {popularRoutes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Popular Routes</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularRoutes.slice(0, 3).map(renderRouteCard)}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityRoutes;
