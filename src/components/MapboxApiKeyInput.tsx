
import React, { useState } from 'react';
import { MapboxApiKeyManager } from '../utils/mapboxApiKeyManager';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Settings, Key, RotateCcw } from 'lucide-react';

const MapboxApiKeyInput: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    try {
      MapboxApiKeyManager.setApiKey(apiKey);
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving API key:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    MapboxApiKeyManager.resetToDefault();
    setIsOpen(false);
  };

  // Don't render anything if a valid API key exists
  if (!isOpen && MapboxApiKeyManager.isKeyValid()) {
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
          Set Mapbox API Key
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Mapbox API Key</h3>
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
            placeholder="Enter your Mapbox API key"
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
          <p className="text-xs text-muted-foreground mt-2">
            Your API key is stored locally and is never sent to our servers.
          </p>
        </div>
      )}
    </div>
  );
};

export default MapboxApiKeyInput;
