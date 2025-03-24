
import React, { useState, useEffect } from 'react';
import { GoogleMapsApiKeyManager } from '../utils/googleMapsApiKeyManager';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Settings, Key, RotateCcw } from 'lucide-react';

const GoogleMapsApiKeyInput: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load current API key when component mounts
  useEffect(() => {
    // Set the API key to the default one
    setApiKey('AIzaSyA1I9dNXno-OQUM4fYc-0Fogsr4QQgJ0_E');
  }, [isOpen]); // Reload the key when the form opens

  const handleSave = () => {
    setIsSaving(true);
    try {
      GoogleMapsApiKeyManager.setApiKey(apiKey.trim());
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

  // Don't render settings button if API key is fixed
  if (!isOpen) {
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
    <div className="absolute top-4 right-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 w-72">
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
          readOnly
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
        <p className="text-xs text-muted-foreground mt-2">
          Using the provided Google Maps API key.
        </p>
      </div>
    </div>
  );
};

export default GoogleMapsApiKeyInput;
