"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { LocationDetails } from "@/app/lib/location";
import { useCurrentLocation } from "@/app/hooks/useCurrentLocation";
import "./register.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
type UserType = "individual" | "organization" | "business";
type RegistrationLocation = {
  lat: number;
  lng: number;
  address: string;
  city: string;
};

const InteractiveLocationMap = dynamic(
  () => import("@/app/components/InteractiveLocationMap"),
  {
    ssr: false,
    loading: () => <div className="map-loading-card">Loading map...</div>
  }
);

const userTypeToRole = {
  individual: "individual",
  organization: "organization",
  business: "business/restaurant"
} as const;

const userTypeCards = [
  {
    type: "individual" as UserType,
    label: "Individual",
    description: "Donate or receive food"
  },
  {
    type: "organization" as UserType,
    label: "Organization",
    description: "NGOs, Food banks"
  },
  {
    type: "business" as UserType,
    label: "Business / Restaurant",
    description: "Businesses and restaurants with surplus food"
  }
];

const userTypeTitles: Record<UserType, string> = {
  individual: "Register As Individual",
  organization: "Register As Organization",
  business: "Register As Business / Restaurant"
};

const userTypeButtonLabels: Record<UserType, string> = {
  individual: "Register as Individual",
  organization: "Register as Organization",
  business: "Register as Business / Restaurant"
};

const nameLabels: Record<UserType, string> = {
  individual: "Full Name",
  organization: "Organization Name",
  business: "Business Name"
};

const createInitialForm = (userType: UserType) => ({
  userType,
  name: "",
  email: "",
  password: "",
  phone: ""
});

const requiresLocationSelection = (userType: UserType) =>
  userType === "organization" || userType === "business";

export default function Register() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>("individual");
  const [form, setForm] = useState(createInitialForm("individual"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [location, setLocation] = useState<RegistrationLocation | null>(null);

  const isLocationRequired = requiresLocationSelection(userType);
  const {
    location: currentLocation,
    isLoading: isLocationLoading,
    error: locationError,
    refreshLocation
  } = useCurrentLocation(isLocationRequired);

  const handleLocationChange = useCallback((loc: LocationDetails) => {
    const selectedAddress = loc.fullAddress || loc.displayLocation;

    setLocation({
      lat: loc.lat,
      lng: loc.lng,
      address: selectedAddress,
      city: loc.city || ""
    });

    setError("");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUserTypeChange = (selectedType: UserType) => {
    setUserType(selectedType);
    setForm(currentForm => ({
      ...currentForm,
      userType: selectedType
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (requiresLocationSelection(userType) && !location) {
      setError(locationError || "Please select your location on the map.");
      alert("Please select your location on the map.");
      return;
    }

    setLoading(true);

    try {
      const normalizedUserType = userTypeToRole[userType];
      const payload: any = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        userType: normalizedUserType,
        accountType: normalizedUserType,
        role: normalizedUserType
      };

      if (isLocationRequired && location) {
        payload.location = {
          type: "Point",
          coordinates: [location.lng, location.lat]
        }
        payload.address = location.address;
        payload.city = location.city;
      }

      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Registration successful! Please login to continue.");
        setUserType("individual");
        setForm(createInitialForm("individual"));
        setLocation(null);
        setTimeout(() => {
          router.push("/donor/login");
        }, 2000);
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = loading || (isLocationRequired && (!location || isLocationLoading));

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>Join FoodShare</h1>
          <p>Connect with your community through food sharing</p>
        </div>

        <div className="register-content">
          <div className="user-type-cards" role="radiogroup" aria-label="Select user type">
            {userTypeCards.map((card) => (
              <button
                key={card.type}
                type="button"
                className={`user-type-card ${userType === card.type ? "selected" : ""}`}
                onClick={() => handleUserTypeChange(card.type)}
                aria-pressed={userType === card.type}
              >
                <span className="card-kicker">{card.label}</span>
                <span>{card.description}</span>
              </button>
            ))}
          </div>

          <div className="register-form-panel">
            <div className="form-panel-header">
              <h2>{userTypeTitles[userType]}</h2>
              <div className="title-accent" />
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form className="register-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">{nameLabels[userType]}</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={`Enter your ${nameLabels[userType].toLowerCase()}`}
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={form.password}
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
                    placeholder="Enter your phone number"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                {isLocationRequired && (
                  <>
                    <div className="form-group full-width">
                      <label>
                        Location <span className="required">*</span>
                        <span className="map-hint">
                          Please drop a pin on the map to accurately record your location.
                        </span>
                      </label>
                      <InteractiveLocationMap
                        onLocationChange={handleLocationChange}
                        currentLocation={currentLocation}
                        isGpsLoading={isLocationLoading}
                        onRefreshGps={refreshLocation}
                        className="registration-location-map"
                      />
                      {locationError && !location && (
                        <p className="field-hint field-hint--warning">{locationError}</p>
                      )}
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="selectedAddress">Selected Address</label>
                      <textarea
                        id="selectedAddress"
                        className="location-preview"
                        value={location?.address || "Select your location on the map above."}
                        rows={3}
                        readOnly
                      />
                      {!location && (
                        <p className="field-error">You must select a location to continue.</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <button type="submit" className="register-button" disabled={isSubmitDisabled}>
                {loading ? "Registering..." : userTypeButtonLabels[userType]}
              </button>
            </form>

            <div className="register-footer">
              <p>
                Already have an account?{" "}
                <Link href="/donor/login">Login here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
