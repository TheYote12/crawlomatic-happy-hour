
import React, { useState } from 'react';
import { GoogleMapsApiKeyManager } from '../utils/googleMapsApiKeyManager';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Settings, Key, RotateCcw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const GoogleMapsApiKeyInput: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    try {
      GoogleMapsApiKeyManager.setApiKey(apiKey);
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving API key:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    GoogleMapsApiKeyManager.resetToDefault();
    setIsOpen(false);
  };

  const checkPlacesAPI = () => {
    setIsChecking(true);
    
    // Create a script element to load the Places API and check its status
    const script = document.createElement('script');
    const currentKey = apiKey || GoogleMapsApiKeyManager.getApiKey();
    
    script.src = `https://maps.googleapis.com/maps/api/js?key=${currentKey}&libraries=places&callback=checkPlacesCallback`;
    script.async = true;
    
    // Define the callback function
    window.checkPlacesCallback = () => {
      try {
        if (window.google && window.google.maps && window.google.maps.places) {
          toast.success('Places API is correctly configured!');
        } else {
          toast.error('Places API failed to load correctly');
        }
      } catch (error) {
        toast.error('Error checking Places API: ' + (error instanceof Error ? error.message : String(error)));
      } finally {
        setIsChecking(false);
        // Clean up
        document.body.removeChild(script);
        delete window.checkPlacesCallback;
      }
    };
    
    // Handle error
    script.onerror = () => {
      toast.error('Failed to load Places API. Make sure your API key is valid and has Places API enabled.');
      setIsChecking(false);
      document.body.removeChild(script);
      delete window.checkPlacesCallback;
    };
    
    document.body.appendChild(script);
  };

  // Don't render anything if a valid API key exists
  if (!isOpen && GoogleMapsApiKeyManager.isKeyValid()) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10"
        onClick={() => setIsOpen(true)}
        title="Map settings"
      >
        <Settings size={18} />
      </Button>
    );
  }

  return (
    <div className={`absolute ${isOpen ? 'top-4 right-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 w-72' : 'top-4 right-4 z-10'}`}>
      {!isOpen ? (
        <Button variant="secondary" onClick={() => setIsOpen(true)}>
          <Key className="mr-2 h-4 w-4" />
          Set Google Maps API Key
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Google Maps API Key</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </Button>
          </div>
          <Input
            type="text"
            placeholder="Enter your Google Maps API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full"
          />
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleReset}
              title="Reset to default API key"
            >
              <RotateCcw className="mr-2 h-3 w-3" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={!apiKey.trim() || isSaving}
              size="sm"
            >
              {isSaving ? 'Saving...' : 'Save Key'}
            </Button>
          </div>
          
          <Button 
            variant="outline"
            size="sm"
            className="w-full"
            onClick={checkPlacesAPI}
            disabled={isChecking}
          >
            <AlertCircle className="mr-2 h-3 w-3" />
            {isChecking ? 'Checking...' : 'Check Places API'}
          </Button>
          
          <p className="text-xs text-muted-foreground mt-2">
            Your API key is stored locally and is never sent to our servers.
          </p>
          
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> You must enable the Places API in your Google Cloud Console 
            for this application to work correctly.
          </p>
        </div>
      )}
    </div>
  );
};

// Add the Places API callback type to the window object
declare global {
  interface Window {
    checkPlacesCallback: () => void;
  }
}

export default GoogleMapsApiKeyInput;
