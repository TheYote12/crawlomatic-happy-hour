
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Settings, CheckCircle2, AlertCircle } from 'lucide-react';
import { GoogleMapsApiKeyManager } from '@/utils/googleMapsApiKeyManager';
import { Separator } from './ui/separator';

const GoogleMapsApiKeyInput = () => {
  const [apiKey, setApiKey] = useState(GoogleMapsApiKeyManager.getApiKey());
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveKey = () => {
    GoogleMapsApiKeyManager.setApiKey(apiKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetKey = () => {
    GoogleMapsApiKeyManager.resetToDefault();
    setApiKey(GoogleMapsApiKeyManager.getApiKey());
  };

  return (
    <div className="absolute bottom-4 right-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full bg-background shadow-md"
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">API Key Settings</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-4"
          align="end"
          sideOffset={16}
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm">Google Maps API Key</h4>
              <p className="text-muted-foreground text-xs mt-1">
                Your API key is used to access Google Maps services.
              </p>
              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="apiKey" className="text-xs">API Key</Label>
                  {apiKey && apiKey.trim() !== '' && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Active</span>
                    </div>
                  )}
                </div>
                <Input
                  id="apiKey"
                  type={isInputVisible ? "text" : "password"}
                  placeholder="Enter your Google Maps API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
              <div className="flex justify-between mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setIsInputVisible(!isInputVisible)}
                >
                  {isInputVisible ? "Hide" : "Show"}
                </Button>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={handleResetKey}
                  >
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs"
                    onClick={handleSaveKey}
                  >
                    {isSaved ? "Saved!" : "Save"}
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-start gap-2 text-amber-600 text-xs">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Enable required APIs</p>
                  <p className="text-muted-foreground mt-1">Make sure to enable these APIs in Google Cloud Console:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>
                      <a 
                        href="https://console.cloud.google.com/apis/library/places-backend.googleapis.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:text-primary"
                      >
                        Places API
                      </a>
                      {" "}(for pub search)
                    </li>
                    <li>
                      <a 
                        href="https://console.cloud.google.com/apis/library/directions-backend.googleapis.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:text-primary"
                      >
                        Directions API
                      </a>
                      {" "}(for routes)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default GoogleMapsApiKeyInput;
