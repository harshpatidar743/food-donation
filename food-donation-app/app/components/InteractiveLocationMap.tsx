"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchForwardGeocode, fetchReverseGeocode, hasCoordinates, type LocationDetails } from '../lib/location';

export interface InteractiveLocationMapProps {
  onLocationChange: (location: LocationDetails) => void;
  className?: string;
  currentLocation?: LocationDetails | null;
  isGpsLoading?: boolean;
  onRefreshGps: () => void;
}

const DEFAULT_MAP_CENTER: LatLngExpression = [20.5937, 78.9629];
const LOCATION_ZOOM = 15;

function MapViewportController({ position }: { position: LatLngExpression | null }) {
  const map = useMap();

  useEffect(() => {
    if (!position) {
      return;
    }

    map.setView(position, LOCATION_ZOOM);
  }, [map, position]);

  return null;
}

export default function InteractiveLocationMap({
  onLocationChange,
  className = '',
  currentLocation = null,
  isGpsLoading = false,
  onRefreshGps,
}: InteractiveLocationMapProps) {
  const [location, setLocation] = useState<LocationDetails | null>(null);
  const [position, setPosition] = useState<LatLngExpression | null>(null);
  const [fullAddress, setFullAddress] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState('');
  const [hasManualSelection, setHasManualSelection] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const onLocationChangeRef = useRef(onLocationChange);

  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  // Leaflet icon fix - SSR SAFE (CRITICAL FIX)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Fix Leaflet default marker icons (dark theme compatible)
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  }, []);

  // Unified updateLocation function
  const updateLocation = useCallback(async (lat: number, lng: number, addressOverride?: string) => {
    setError('');
    setIsGeocoding(true);
    
    try {
      const reverseData = await fetchReverseGeocode(lat, lng);
      const newLocation: LocationDetails = {
        ...reverseData,
        fullAddress: addressOverride || reverseData.fullAddress || reverseData.displayLocation,
      };
      
      setLocation(newLocation);
      setPosition([lat, lng]);
      setFullAddress(newLocation.fullAddress);

      onLocationChangeRef.current(newLocation);
      
      if (mapRef.current) {
        mapRef.current.setView([lat, lng], LOCATION_ZOOM);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Location lookup failed');
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  // Initialize with GPS location
  useEffect(() => {
    if (hasManualSelection) {
      return;
    }

    if (hasCoordinates(currentLocation?.lat, currentLocation?.lng)) {
      const nextLocation = currentLocation as LocationDetails;

      setLocation(nextLocation);
      setPosition([nextLocation.lat, nextLocation.lng]);
      setFullAddress(nextLocation.fullAddress || nextLocation.displayLocation);
      onLocationChangeRef.current(nextLocation);

      if (mapRef.current) {
        mapRef.current.setView([nextLocation.lat, nextLocation.lng], LOCATION_ZOOM);
      }
    }
  }, [currentLocation, hasManualSelection]);

  // Custom debounce hook
  const useDebounce = <T extends (...args: any[]) => any>(callback: T, delay: number) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    return useCallback(((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T, [callback, delay]);
  };

  const debouncedForwardGeocode = useDebounce(async (address: string) => {
    if (!address.trim()) return;
    
    try {
      const forwardData = await fetchForwardGeocode(address);
      if (forwardData) {
        updateLocation(forwardData.lat, forwardData.lng, address);
      }
    } catch {
      // Silent fail
    }
  }, 500);

  const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAddress = e.target.value;
    setFullAddress(newAddress);
    setError('');
    
    if (location) {
      setLocation(prev => prev ? { ...prev, fullAddress: newAddress } : null);
    }
    
    debouncedForwardGeocode(newAddress);
  }, [debouncedForwardGeocode, location]);

  const handleMarkerDragEnd = useCallback((e: L.DragEndEvent) => {
    const newLatLng = e.target.getLatLng();
    setHasManualSelection(true);
    updateLocation(newLatLng.lat, newLatLng.lng);
  }, [updateLocation]);

  const handleRefreshGPS = useCallback(async () => {
    setError('');
    setHasManualSelection(false);
    onRefreshGps();
  }, [onRefreshGps]);

  const MapEvents = () => {
    const map = useMapEvents({
      click(event) {
        setHasManualSelection(true);
        updateLocation(event.latlng.lat, event.latlng.lng);
      }
    });
    mapRef.current = map;
    return null;
  };

  if (!position && isGpsLoading) {
    return (
      <div className={`interactive-location-map ${className}`}>
        <div className="map-loading">
          <div className="spinner"></div>
          <p>Detecting your location...</p>
          <button onClick={handleRefreshGPS} className="btn-refresh" disabled={isGpsLoading}>
            🔄 Refresh GPS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`interactive-location-map ${className}`}>
      <div className="map-container">
        <MapContainer
          center={(position || DEFAULT_MAP_CENTER) as LatLngExpression}
          zoom={position ? 15 : 5}
          style={{ height: '300px', width: '100%', borderRadius: '8px' }}
        >
          <TileLayer
            attribution='&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapViewportController position={position} />
          <MapEvents />
          {position && (
            <Marker 
              position={position} 
              draggable 
              eventHandlers={{ dragend: handleMarkerDragEnd as any }}
            />
          )}
        </MapContainer>
      </div>

      <div className="map-controls">
        {/* <div className="selection-summary" aria-live="polite">
          <p className="selection-summary__title">
            {hasManualSelection ? 'Selected custom location' : 'Selected location'}
          </p>
          <p className="selection-summary__text">
            {location?.displayLocation || fullAddress || 'Click anywhere on the map or refresh GPS to choose your location.'}
          </p>
          {location ? (
            <p className="selection-summary__meta">
              Lat {location.lat.toFixed(5)}, Lng {location.lng.toFixed(5)}
            </p>
          ) : null}
        </div> */}

        <button 
          onClick={handleRefreshGPS} 
          className="btn-refresh"
          disabled={isGpsLoading || isGeocoding}
        >
          {isGpsLoading ? '🔄 Detecting...' : '🔄 Refresh GPS'}
        </button>
        {error ? <p className="map-error">{error}</p> : null}
      </div>

      <style jsx>{`
        .interactive-location-map {
          --map-bg: #1a1a1a;
          --map-border: #333;
          --input-bg: #2a2a2a;
          --input-border: #444;
          --text-primary: #e0e0e0;
          --text-secondary: #aaa;
          --btn-bg: #3a3a3a;
          --btn-hover: #4a4a4a;
          --error: #ff6b6b;
          --loading: #4a90e2;
        }

        .map-container {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          margin-bottom: 1rem;
        }

        .map-controls {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          align-items: center;
        }

        .selection-summary {
          width: 100%;
          padding: 0.85rem 1rem;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .selection-summary__title,
        .selection-summary__text,
        .selection-summary__meta {
          margin: 0;
        }

        .selection-summary__title {
          color: #ffffff;
          font-size: 0.9rem;
          font-weight: 700;
        }

        .selection-summary__text {
          margin-top: 0.35rem;
          color: var(--text-primary);
          line-height: 1.5;
        }

        .selection-summary__meta {
          margin-top: 0.35rem;
          color: var(--text-secondary);
          font-size: 0.82rem;
        }

        .btn-refresh {
          padding: 0.5rem 1rem;
          background: var(--btn-bg);
          color: var(--text-primary);
          border: 2px solid var(--input-border);
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-refresh:hover:not(:disabled) {
          background: var(--btn-hover);
          border-color: var(--loading);
        }

        .btn-refresh:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .map-error {
          margin: 0;
          color: var(--error);
          font-size: 0.82rem;
          text-align: center;
        }

        .map-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          background: var(--map-bg);
          border-radius: 8px;
          border: 2px dashed var(--map-border);
          color: var(--text-primary);
          gap: 1rem;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--input-border);
          border-top: 3px solid var(--loading);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .map-container {
            height: 250px;
          }
        }
      `}</style>
    </div>
  );
}
