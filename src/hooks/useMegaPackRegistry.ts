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

export function useMegaPackRegistry(
  initialMasterDriveLink?: string,
  authCredentials?: { token?: string; orderId?: string; phone?: string }
): UseMegaPackRegistryReturn {
  // Access is strictly locked by default until verified through valid mobile number or order ID
  const [resources, setResources] = useState<MegaPackResource[]>(() =>
    INITIAL_MEGAPACK_RESOURCES.map(r => ({
      ...r,
      destinationUrl: null,
      isLocked: true,
    }))
  );
  const [masterDriveLink, setMasterDriveLink] = useState<string>(initialMasterDriveLink || '');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch from REST API with optional credentials
  const refreshResources = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (authCredentials?.token) params.set('token', authCredentials.token);
      if (authCredentials?.orderId) params.set('orderId', authCredentials.orderId);
      if (authCredentials?.phone) params.set('phone', authCredentials.phone);

      const queryStr = params.toString();
      const res = await fetch(`/api/reels/resources${queryStr ? '?' + queryStr : ''}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.resources)) {
        setResources(data.resources);
        if (data.masterDriveLink) {
          setMasterDriveLink(data.masterDriveLink);
        } else if (!initialMasterDriveLink) {
          setMasterDriveLink('');
        }
      }
      setError(null);
    } catch (err: any) {
      console.warn('[MegaPack Registry] Failed to fetch resources:', err);
      setError('Unable to load latest resources from server. Using cached definitions.');
    } finally {
      setIsLoading(false);
    }
  }, [authCredentials?.token, authCredentials?.orderId, authCredentials?.phone, initialMasterDriveLink]);

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
      const sseParams = new URLSearchParams();
      if (authCredentials?.token) sseParams.set('token', authCredentials.token);
      if (authCredentials?.orderId) sseParams.set('orderId', authCredentials.orderId);
      if (authCredentials?.phone) sseParams.set('phone', authCredentials.phone);
      const sseQuery = sseParams.toString();

      const es = new EventSource(`/api/reels/events${sseQuery ? '?' + sseQuery : ''}`);
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
