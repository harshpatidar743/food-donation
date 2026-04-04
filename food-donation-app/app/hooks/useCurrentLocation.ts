"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchReverseGeocode, type LocationDetails } from "@/app/lib/location";

const getLocationErrorMessage = (error: GeolocationPositionError) => {
  if (error.code === error.PERMISSION_DENIED) {
    return "Location access was denied. Please allow it to continue.";
  }

  if (error.code === error.POSITION_UNAVAILABLE) {
    return "Your current location could not be detected right now.";
  }

  if (error.code === error.TIMEOUT) {
    return "Location request timed out. Please try again.";
  }

  return "Unable to get your current location.";
};

export const useCurrentLocation = (enabled = true) => {
  const [location, setLocation] = useState<LocationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState("");
  const requestedOnMountRef = useRef(false);

  const refreshLocation = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!navigator.geolocation) {
      setLocation(null);
      setError("Geolocation is not supported in this browser.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void (async () => {
          try {
            const nextLocation = await fetchReverseGeocode(
              position.coords.latitude,
              position.coords.longitude
            );
            setLocation(nextLocation);
            setError("");
          } catch (nextError) {
            setLocation(null);
            setError(
              nextError instanceof Error
                ? nextError.message
                : "Unable to look up your address."
            );
          } finally {
            setIsLoading(false);
          }
        })();
      },
      (positionError) => {
        setLocation(null);
        setError(getLocationErrorMessage(positionError));
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      setError("");
      return;
    }

    if (requestedOnMountRef.current) {
      return;
    }

    requestedOnMountRef.current = true;
    refreshLocation();
  }, [enabled, refreshLocation]);

  return {
    location,
    isLoading,
    error,
    refreshLocation
  };
};
