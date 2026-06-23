"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  clearStoredAuthUser,
  getStoredAuthToken,
  getStoredAuthUser,
  persistAuthUser,
  type AuthUserType
} from "@/app/lib/auth";
import type { LocationDetails } from "@/app/lib/location";
import { useCurrentLocation } from "@/app/hooks/useCurrentLocation";
import "./profile.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const InteractiveLocationMap = dynamic(
  () => import("@/app/components/InteractiveLocationMap"),
  {
    ssr: false,
    loading: () => <div className="map-loading-card">Loading map...</div>
  }
);

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  userType: AuthUserType;
  address?: string;
  description?: string;
  profileImage?: string;
  operatingHours?: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
}

const createMapLocationDetails = (
  selectedLocation: { lat: number; lng: number; address: string } | null
): LocationDetails | null => {
  if (!selectedLocation) {
    return null;
  }

  return {
    lat: selectedLocation.lat,
    lng: selectedLocation.lng,
    area: "",
    city: "",
    state: "",
    pincode: "",
    displayLocation: selectedLocation.address,
    fullAddress: selectedLocation.address
  };
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    description: "",
    profileImage: "",
    operatingHours: "",
  });

  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const {
    location: currentLocation,
    isLoading: isLocationLoading,
    error: locationError,
    refreshLocation
  } = useCurrentLocation(false);

  const handleUnauthorized = useCallback(() => {
    clearStoredAuthUser();
    router.push("/donor/login");
  }, [router]);

  useEffect(() => {
    const token = getStoredAuthToken();
    if (!token) {
      handleUnauthorized();
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data: UserProfile = await res.json();
        setProfile(data);
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          address: data.address || "",
          description: data.description || "",
          profileImage: data.profileImage || "",
          operatingHours: data.operatingHours || "",
        });

        const authUser = getStoredAuthUser();
        if (authUser && (authUser.name !== data.name || authUser.userType !== data.userType)) {
          persistAuthUser({
            ...authUser,
            name: data.name,
            userType: data.userType
          });
        }

        if (data.location?.coordinates) {
          setLocation({
            lng: data.location.coordinates[0],
            lat: data.location.coordinates[1],
            address: data.address || "",
          });
        }
      } catch (err: any) {
        setError(err.message || "An error occurred fetching your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [handleUnauthorized]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = useCallback((loc: LocationDetails) => {
    const selectedAddress = loc.fullAddress || loc.displayLocation;
    setLocation({
      lat: loc.lat,
      lng: loc.lng,
      address: selectedAddress,
    });
    setFormData(prev => ({ ...prev, address: selectedAddress }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const token = getStoredAuthToken();
    if (!token) {
      setSaving(false);
      setError("Your session has expired. Please login again.");
      handleUnauthorized();
      return;
    }

    try {
      const payload: Record<string, unknown> = { ...formData };

      if (location) {
        payload.location = {
          type: "Point",
          coordinates: [location.lng, location.lat]
        };
      }

      const res = await fetch(`${API}/api/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.status === 401) {
        setSaving(false);
        setError("Your session has expired. Please login again.");
        handleUnauthorized();
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile details.");
      }

      setSuccess("Profile updated successfully!");
      setProfile(data.user);

      const authUser = getStoredAuthUser();
      if (authUser && (authUser.name !== data.user.name || authUser.userType !== data.user.userType)) {
        persistAuthUser({ ...authUser, name: data.user.name, userType: data.user.userType });
      }

      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setTimeout(() => setError(""), 4000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-sreen">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Toast Messages */}
      {success && (
        <div className="status-toast success">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}
      {error && (
        <div className="status-toast error">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {error}
        </div>
      )}

      <div className="profile-container">
        {/* Sleek Cover Header */}
        <div className="profile-cover">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              {formData.profileImage ? (
                <Image
                  src={formData.profileImage}
                  alt="Profile"
                  width={120}
                  height={120}
                  className="profile-avatar-image"
                  unoptimized
                  priority
                />
              ) : (
                "👤"
              )}

            </div>
            <div className="profile-quick-info">
              <h1>{profile?.name || "Your Profile"}</h1>
              <span className="user-type-badge">{profile?.userType || "User"}</span>
            </div>
          </div>
        </div>

        <div className="profile-main">
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-grid">

              {/* Left Column: Basic Info */}
              <div className="form-section">
                <div className="section-header">
                  <h3>General Information</h3>
                  <p>Manage your basic account details.</p>
                </div>

                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="profileImage">Profile Image URL</label>
                  <input
                    id="profileImage"
                    name="profileImage"
                    type="url"
                    placeholder="e.g., https://example.com/me.jpg"
                    value={formData.profileImage}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Right Column: Bio & Biz Details */}
              <div className="form-section">
                <div className="section-header">
                  <h3>Extended Details</h3>
                  <p>Provide context to help people know you better.</p>
                </div>

                <div className="form-group">
                  <label htmlFor="operatingHours">Operating Hours</label>
                  <input
                    id="operatingHours"
                    name="operatingHours"
                    type="text"
                    placeholder="e.g. Mon-Fri 9AM - 5PM"
                    value={formData.operatingHours}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">About You</label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Tell the community about yourself, your organization, or restaurant..."
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Spanning Row: Map */}
              <div className="form-section full-width">
                <div className="section-header">
                  <h3>Location Configuration</h3>
                  <p>Drop a pin to precisely list your location for food tracking.</p>
                </div>

                <div className="map-wrapper">
                  <InteractiveLocationMap
                    onLocationChange={handleLocationChange}
                    currentLocation={createMapLocationDetails(location) || currentLocation}
                    isGpsLoading={isLocationLoading}
                    onRefreshGps={refreshLocation}
                  />
                </div>

                {locationError ? <p className="location-hint">{locationError}</p> : null}

                <div className="form-group">
                  <label htmlFor="address">Selected Physical Address</label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Automatically populates when a pin is dropped"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-button" disabled={saving}>
                {saving ? "Confirming..." : "Update Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
