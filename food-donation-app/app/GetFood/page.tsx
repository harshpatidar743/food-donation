"use client";

import React, { FormEvent, useEffect, useRef, useState, useCallback } from "react";
import "./style.css";
import axios from "axios";
import toast from "react-hot-toast";
import DonationCard from "../Donation/components/DonationCard";
import type { RouteInfo, SearchDonation } from "../Donation/types";
import { isDonationAvailable, getDistance, getFullRouteInfoAsync } from "../Donation/utils";
import { getLocationSearchQuery, hasCoordinates } from "../lib/location";
import { useCurrentLocation } from "../hooks/useCurrentLocation";

// Extend interface to include required fields (TS safety)
interface LocalSearchDonation extends SearchDonation {
  distance?: number;
  routeInfo?: RouteInfo;
  loadingRoute?: boolean;
  lat?: number;
  lng?: number;
  _id: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const Page = () => {
  const [location, setLocation] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [availableDonations, setAvailableDonations] = useState<LocalSearchDonation[]>([]);

  const {
    location: currentLocation,
    isLoading: isLocationLoading,
    error: locationError,
    refreshLocation
  } = useCurrentLocation();
  const autoSearchRef = useRef(false);
  const visibleDonations = availableDonations;

  useEffect(() => {
    if (!currentLocation) {
      return;
    }

    const searchLabel = currentLocation.displayLocation || getLocationSearchQuery(currentLocation);
    const searchQuery = getLocationSearchQuery(currentLocation);

    setLocation((currentValue) => currentValue || searchLabel);

    if (!autoSearchRef.current && searchQuery) {
      autoSearchRef.current = true;
      setActiveSearch(searchQuery);
    }
  }, [currentLocation]);

  // Memoized fetchDonations to fix ESLint + stable deps
  const fetchDonations = useCallback(async (showToast = false) => {
    const hasCurrentCoordinates = hasCoordinates(currentLocation?.lat, currentLocation?.lng);

    const toastId = toast.loading("Fetching all available donations");

    try {
      const response = await axios.get<any>(`${API_BASE_URL}/donations`);

      let nextDonations: LocalSearchDonation[] = Array.isArray(response.data)
        ? response.data
        : response.data.donations || [];

      // Filter available first
      nextDonations = nextDonations.filter((donation: LocalSearchDonation) => isDonationAvailable(donation));

      // Compute straight-line distances (with null checks)
      if (hasCurrentCoordinates) {
        nextDonations = nextDonations.map((donation) => ({
          ...donation,
          distance: hasCoordinates(donation.lat, donation.lng)
            ? getDistance(currentLocation!.lat, currentLocation!.lng, donation.lat!, donation.lng!)
            : Infinity
        }));
      }

      // Fetch route info and sort by travel time
      const donationsWithRoutes = await Promise.all(
        nextDonations.map(async (donation) => {
          if (
            hasCurrentCoordinates &&
            hasCoordinates(donation.lat, donation.lng)
          ) {
            const routeInfo = await getFullRouteInfoAsync(
              currentLocation!.lat,
              currentLocation!.lng,
              donation.lat!,
              donation.lng!
            );
            return {
              ...donation,
              routeInfo
            };
          }
          return donation;
        })
      );

      // Sort by fastest drivable route first, then shorter driving distance, then shorter walking distance.
      const sortedDonations = donationsWithRoutes.sort((a, b) => {
        const aDriveTime = a.routeInfo?.routeTimeMin ?? Infinity;
        const bDriveTime = b.routeInfo?.routeTimeMin ?? Infinity;
        if (aDriveTime !== bDriveTime) {
          return aDriveTime - bDriveTime;
        }
        const aDriveDistance = a.routeInfo?.routeDistanceKm ?? Infinity;
        const bDriveDistance = b.routeInfo?.routeDistanceKm ?? Infinity;
        if (aDriveDistance !== bDriveDistance) {
          return aDriveDistance - bDriveDistance;
        }
        const aWalkDistance = a.routeInfo?.walkingDistanceKm ?? Infinity;
        const bWalkDistance = b.routeInfo?.walkingDistanceKm ?? Infinity;
        if (aWalkDistance !== bWalkDistance) {
          return aWalkDistance - bWalkDistance;
        }
        const aDist = a.distance ?? Infinity;
        const bDist = b.distance ?? Infinity;
        return aDist - bDist;
      });

      setAvailableDonations(sortedDonations);

      if (showToast) {
        toast.success(
          hasCurrentCoordinates
            ? "All available donations loaded - sorted by fastest driving route."
            : "All available donations loaded.",
          { id: toastId }
        );
      } else {
        toast.dismiss(toastId);
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || "Error in fetching donations"
        : "Error in fetching donations";

      if (showToast) {
        toast.error(message, { id: toastId });
      } else {
        toast.dismiss(toastId);
      }
    }
  }, [activeSearch, currentLocation?.lat, currentLocation?.lng]);

  // Polling useEffect - ESLint fixed with stable fetchDonations
  useEffect(() => {
    fetchDonations(true);
    const intervalId = setInterval(() => {
      fetchDonations();
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchDonations]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const searchValue = location.trim();

    if (!searchValue) {
      if (hasCoordinates(currentLocation?.lat, currentLocation?.lng)) {
        setActiveSearch("");
        await fetchDonations(true);
        return;
      }

      toast.error("Please enter an address area or pincode.");
      return;
    }

    setActiveSearch(searchValue);
    await fetchDonations(true);
  };

  return (
    <div>
      <header>
        <div className="hero-small">
          <h1>
            Find Food <span className="dual-color-text">Donations</span> Near You
          </h1>
          <p>Search for available food donations in your area and help reduce food waste.</p>
        </div>
      </header>

      <main>
        <section className="form-section">
          <h2>Find Food Near Your Current Location</h2>
          <p className="section-subtitle">
            We detect your location automatically and use it to search nearby donations.
          </p>

          <div className="search-location-card">
            <div>
              <p className="search-location-title">
                {isLocationLoading
                  ? "Detecting your location..."
                  : currentLocation?.displayLocation || "Location not available yet"}
              </p>
              <p className="search-location-meta">
                {locationError
                  ? locationError
                  : currentLocation
                    ? currentLocation.area || currentLocation.city || currentLocation.pincode
                      ? `Area: ${currentLocation.area || "Not found"} | City: ${
                          currentLocation.city || "Not found"
                        } | Pincode: ${currentLocation.pincode || "Not found"}`
                      : "GPS coordinates detected. Address lookup is unavailable, so nearby donations are being matched by distance."
                    : "Allow location access to auto-fill your search."}
              </p>
            </div>
            <button
              type="button"
              className="button button--secondary"
              onClick={refreshLocation}
              disabled={isLocationLoading}
            >
              Refresh Location
            </button>
          </div>

          <form id="location-form" className="form-container" onSubmit={handleSubmit}>
            <input
              type="text"
              id="user-location"
              placeholder="Detected area or pincode"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              required
            />
            <button type="submit" className="button">
              {activeSearch ? "Refresh Search" : "Search for Food"}
            </button>
          </form>
        </section>

        <section id="available-food" className="donation-list-section">
          <div className="section-heading">
            <div>
              <h2>Available Donations</h2>
              <p className="section-subtitle">
                Browse active food listings in a faster, easier-to-scan card view.
              </p>
            </div>
          </div>

          {visibleDonations.length === 0 ? (
            <p className="empty-message">
              No food available in this area yet. Try searching another location.
            </p>
          ) : (
            <div className="donation-cards">
              {visibleDonations.map((donation) => (
                <DonationCard 
                  key={donation._id} 
                  donation={donation} 
                  showDonorName 
                  currentLat={currentLocation?.lat}
                  currentLng={currentLocation?.lng}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Page;
