import { useState, useEffect, useCallback, useRef } from 'react';
import { MegaPackResource } from '../types';
import { INITIAL_MEGAPACK_RESOURCES } from '../data/initialMegaPackResources';

export interface UseMegaPackRegistryReturn {
  resources: MegaPackResource[];
  masterDriveLink: string;
  isLoading: boolean;
  error: string | null;
  refreshResources: () => Promise<void>;
  updateResourceLocally: (updated: MegaPackResource) => void;
  setMasterDriveLinkLocally: (url: string) => void;
}

export function useMegaPackRegistry(initialMasterDriveLink?: string): UseMegaPackRegistryReturn {
  const [resources, setResources] = useState<MegaPackResource[]>(INITIAL_MEGAPACK_RESOURCES);
  const [masterDriveLink, setMasterDriveLink] = useState<string>(
    initialMasterDriveLink || 'https://drive.google.com/drive/folders/1jkXdin8dyQ99mYKxC2JOczG8e7EHlF3C?usp=sharing'
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch from REST API
  const refreshResources = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/reels/resources');
      const data = await res.json();
      if (data.success && Array.isArray(data.resources)) {
        setResources(data.resources);
        if (data.masterDriveLink) {
          setMasterDriveLink(data.masterDriveLink);
        }
      }
      setError(null);
    } catch (err: any) {
      console.warn('[MegaPack Registry] Failed to fetch resources:', err);
      setError('Unable to load latest resources from server. Using cached definitions.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update local state when admin performs changes
  const updateResourceLocally = useCallback((updated: MegaPackResource) => {
    setResources(prev => prev.map(r => (r.id === updated.id ? updated : r)));
  }, []);

  const setMasterDriveLinkLocally = useCallback((url: string) => {
    if (url && typeof url === 'string') {
      setMasterDriveLink(url.trim());
    }
  }, []);

  // Setup real-time listener (SSE)
  useEffect(() => {
    refreshResources();

    try {
      const es = new EventSource('/api/reels/events');
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.eventType === 'INITIAL_STATE') {
            if (Array.isArray(payload.resources)) {
              setResources(payload.resources);
            }
            if (payload.masterDriveLink) {
              setMasterDriveLink(payload.masterDriveLink);
            }
          } else if (payload.eventType === 'RESOURCE_UPDATED' && payload.resource) {
            updateResourceLocally(payload.resource);
          } else if (payload.eventType === 'CONFIG_UPDATED' && payload.config) {
            if (payload.config.masterDriveLink) {
              setMasterDriveLink(payload.config.masterDriveLink);
            }
          }
        } catch (_) {}
      };

      es.onerror = () => {
        // SSE error, try reconnect in background
      };
    } catch (_) {}

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [refreshResources, updateResourceLocally]);

  return {
    resources,
    masterDriveLink,
    isLoading,
    error,
    refreshResources,
    updateResourceLocally,
    setMasterDriveLinkLocally,
  };
}
