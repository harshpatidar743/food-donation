"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  getMapLink,
  getOpenStreetMapEmbedUrl,
  hasCoordinates
} from "@/app/lib/location";
import 'leaflet/dist/leaflet.css';
import type { LatLngExpression } from 'leaflet';

// Fix Leaflet icons - moved to useEffect for SSR safety
type LocationMapPreviewProps = {
  lat?: number;
  lng?: number;
  currentLat?: number;
  currentLng?: number;
  title: string;
  buttonClassName: string;
  disabledButtonClassName: string;
  mapLabel?: string;
};

function MapEvents() {
  const map = useMap();
  map.setMaxZoom(18);
  return null;
}

export default function LocationMapPreview({
  lat,
  lng,
  currentLat,
  currentLng,
  title,
  buttonClassName,
  disabledButtonClassName,
  mapLabel = "Pickup location"
}: LocationMapPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mapType, setMapType] = useState<'iframe' | 'interactive'>('interactive');
  const canShowMap = hasCoordinates(lat, lng);
  const hasCurrentLocation = currentLat != null && currentLng != null && !Number.isNaN(currentLat) && !Number.isNaN(currentLng);
  const mapRef = useRef<L.Map | null>(null);

  // Initialize Leaflet icons client-side only
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Fix Leaflet default marker icons
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  }, []);

  if (!canShowMap) {
    return (
      <button type="button" className={disabledButtonClassName} disabled>
        View Map
      </button>
    );
  }

  const safeLat = lat as number;
  const safeLng = lng as number;
  const safeCurrentLat = currentLat as number;
  const safeCurrentLng = currentLng as number;
  const mapLink = getMapLink(safeLat, safeLng);
  const embedUrl = getOpenStreetMapEmbedUrl(safeLat, safeLng);

  const toggleMapType = () => {
    setMapType(prev => prev === 'iframe' ? 'interactive' : 'iframe');
  };

  return (
    <>
      <button
        type="button"
        className={buttonClassName}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        {isOpen ? "Hide Map" : "View Map"}
      </button>

      {isOpen && (
        <div className="donation-map-preview">
          <div className="donation-map-header">
            <span>{mapLabel} {hasCurrentLocation && '(Your location shown as blue ring)'}</span>
            <div className="map-controls">
              {/* <button className="map-type-toggle" onClick={toggleMapType}>
                {mapType === 'iframe' ? 'Interactive' : 'Simple'}
              </button> */}
              <a
                className="donation-map-expand"
                href={mapLink}
                target="_blank"
                rel="noreferrer"
              >
                Google Maps
              </a>
            </div>
          </div>

          {mapType === 'interactive' && hasCurrentLocation ? (
            <div className="leaflet-map-container" style={{height: '250px'}}>
              <MapContainer
                center={[(safeLat + safeCurrentLat)/2, (safeLng + safeCurrentLng)/2]}
                zoom={14}
                style={{height: '100%', width: '100%', borderRadius: '8px'}}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapEvents />
                <Marker position={[safeLat, safeLng]} />
                <CircleMarker
                  center={[safeCurrentLat, safeCurrentLng]}
                  radius={8}
                  fillOpacity={0.8}
                  fillColor="#4285f4"
                  stroke={true}
                  color="#ffffff"
                  weight={2}
                >
                  <CircleMarker
                    center={[safeCurrentLat, safeCurrentLng]}
                    radius={12}
                    fillOpacity={0.2}
                    fillColor="#4285f4"
                    stroke={false}
                  />
                </CircleMarker>
              </MapContainer>
            </div>
          ) : (
            <iframe
              title={`Map for ${title}`}
              src={embedUrl}
              className="donation-map-frame"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
        </div>
      )}
    </>
  );
}
