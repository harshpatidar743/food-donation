"use client";

import React, { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from "react";
import "./style.css";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getStoredAuthToken, getStoredAuthUser } from "../lib/auth";
import DonationCard from "./components/DonationCard";
import { Donation, FoodCategory, QuantityUnit, SearchDonation } from "./types";
import { isDonationAvailable, normalizeText } from "./utils";
import { buildFullAddress, type LocationDetails } from "../lib/location";
import { useCurrentLocation } from "../hooks/useCurrentLocation";
import dynamic from "next/dynamic";

const InteractiveLocationMap = dynamic(
  () => import("../components/InteractiveLocationMap").then((mod) => ({ default: mod.default })),
  { ssr: false, loading: () => <div>Loading map...</div> }
);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;
const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{8,14}$/;
const PINCODE_PATTERN = /^\d{4,10}$/;

type DonationFormData = {
  foodName: string;
  foodCategory: FoodCategory | "";
  quantity: string;
  quantityUnit: QuantityUnit;
  foodPreparedTime: string;
  availableUntil: string;
  pickupPoint: string;
  contactNumber: string;
  additionalNotes: string;
  foodImageData: string;
  foodImageName: string;
  foodImageType: string;
};

type FormField = keyof DonationFormData | "location";
type FormErrors = Partial<Record<FormField, string>>;

const createInitialFormData = (): DonationFormData => ({
  foodName: "",
  foodCategory: "",
  quantity: "",
  quantityUnit: "plates",
  foodPreparedTime: "",
  availableUntil: "",
  pickupPoint: "",
  contactNumber: "",
  additionalNotes: "",
  foodImageData: "",
  foodImageName: "",
  foodImageType: ""
});

const Page = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const preparedTimeInputRef = useRef<HTMLInputElement | null>(null);
  const availableUntilInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState<DonationFormData>(createInitialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const {
    location: currentLocation,
    isLoading: isLocationLoading,
    error: locationError,
    refreshLocation
  } = useCurrentLocation();
  const [pickupLocation, setPickupLocation] = useState(currentLocation);
  const visibleDonations = donations.filter((donation) => isDonationAvailable(donation));
  const fullAddressPreview = pickupLocation ? buildFullAddress(formData.pickupPoint, pickupLocation) : '';

  useEffect(() => {
    const authUser = getStoredAuthUser();

    if (!authUser?.donorId) {
      router.push("/donor/login");
      return;
    }

    const fetchDonations = async (showToast = false) => {
      const toastId = toast.loading("Fetching active donations...");

      try {
        const response = await axios.get<Donation[]>(`${API_BASE_URL}/donations`);
        setDonations(response.data.filter((donation) => isDonationAvailable(donation)));
        if (showToast) {
          toast.success("Active donations loaded.", { id: toastId });
        } else {
          toast.dismiss(toastId);
        }
      } catch {
        if (showToast) {
          toast.error("Unable to load active donations right now.", { id: toastId });
        } else {
          toast.dismiss(toastId);
        }
      }
    };

    fetchDonations(true);
    const intervalId = setInterval(() => {
      fetchDonations();
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [router]);

  useEffect(() => {
    if (!currentLocation) {
      return;
    }

    setFormErrors((currentErrors) => ({
      ...currentErrors,
      location: ""
    }));
  }, [currentLocation]);

  const handleLocationChange = useCallback((location: LocationDetails) => {
    setPickupLocation(location);
    setFormErrors((errors) => ({ ...errors, location: "" }));
  }, []);

  const validateForm = (values: DonationFormData): FormErrors => {
    const errors: FormErrors = {};
    const trimmedFoodName = values.foodName.trim();
    const trimmedPickupPoint = values.pickupPoint.trim();
    const trimmedContactNumber = values.contactNumber.trim();
    const parsedQuantity = Number(values.quantity);
    const preparedTime = values.foodPreparedTime ? new Date(values.foodPreparedTime) : null;
    const availableUntil = values.availableUntil ? new Date(values.availableUntil) : null;

    if (!trimmedFoodName) {
      errors.foodName = "Food name is required.";
    }

    if (!values.foodCategory) {
      errors.foodCategory = "Please select a food category.";
    }

    if (!values.quantity.trim()) {
      errors.quantity = "Quantity is required.";
    } else if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
      errors.quantity = "Quantity must be a positive number.";
    }

    if (!values.foodPreparedTime) {
      errors.foodPreparedTime = "Food prepared time is required.";
    } else if (!preparedTime || Number.isNaN(preparedTime.getTime())) {
      errors.foodPreparedTime = "Enter a valid prepared date and time.";
    }

    if (!values.availableUntil) {
      errors.availableUntil = "Available until / expiry time is required.";
    } else if (!availableUntil || Number.isNaN(availableUntil.getTime())) {
      errors.availableUntil = "Enter a valid expiry date and time.";
    } else if (availableUntil.getTime() <= Date.now()) {
      errors.availableUntil = "Expiry time must be after the current time.";
    }

    if (
      preparedTime &&
      availableUntil &&
      !Number.isNaN(preparedTime.getTime()) &&
      !Number.isNaN(availableUntil.getTime()) &&
      availableUntil <= preparedTime
    ) {
      errors.availableUntil = "Expiry time must be after the prepared time.";
    }

    if (!pickupLocation) {
      errors.location = locationError || "Please set pickup location using the map.";
    }

    if (pickupLocation?.pincode && !PINCODE_PATTERN.test(pickupLocation.pincode.trim())) {
      errors.location = "Pincode is invalid. Adjust marker or refresh GPS.";
    }

                if (!trimmedPickupPoint) {
      errors.pickupPoint =
        "House No / Building Name / Restaurant Name / NGO Name is required.";
    }

    if (!trimmedContactNumber) {
      errors.contactNumber = "Contact number is required.";
    } else if (!PHONE_PATTERN.test(trimmedContactNumber)) {
      errors.contactNumber = "Enter a valid phone number.";
    }

    if (values.foodImageName && !values.foodImageData) {
      errors.foodImageData = "Selected image could not be processed. Please choose it again.";
    }

    return errors;
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    const fieldName = name as keyof DonationFormData;

    setFormData((currentData) => ({
      ...currentData,
      [fieldName]: value
    }));

    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: "",
      ...(fieldName === "pickupPoint" ? { location: "" } : {})
    }));

    setSubmitError("");
    setSuccessMessage("");
  };

  const handleNormalizeBlur = (fieldName: "foodName" | "pickupPoint") => {
    setFormData((currentData) => ({
      ...currentData,
      [fieldName]: normalizeText(currentData[fieldName])
    }));
  };

  const handleDateTimeInputClick = (inputRef: React.RefObject<HTMLInputElement>) => () => {
    inputRef.current?.showPicker?.();
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    setSubmitError("");
    setSuccessMessage("");

    if (!file) {
      setFormData((currentData) => ({
        ...currentData,
        foodImageData: "",
        foodImageName: "",
        foodImageType: ""
      }));

      setFormErrors((currentErrors) => ({
        ...currentErrors,
        foodImageData: ""
      }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFormErrors((currentErrors) => ({
        ...currentErrors,
        foodImageData: "Only image files are allowed."
      }));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setFormErrors((currentErrors) => ({
        ...currentErrors,
        foodImageData: "Image size must be 3 MB or less."
      }));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";

      setFormData((currentData) => ({
        ...currentData,
        foodImageData: dataUrl,
        foodImageName: file.name,
        foodImageType: file.type
      }));

      setFormErrors((currentErrors) => ({
        ...currentErrors,
        foodImageData: ""
      }));
    };

    reader.onerror = () => {
      setFormErrors((currentErrors) => ({
        ...currentErrors,
        foodImageData: "Unable to read the selected image."
      }));
    };

    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormData(createInitialFormData());
    setFormErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const authUser = getStoredAuthUser();
    const token = getStoredAuthToken();

    if (!authUser?.donorId || !token) {
      toast.error("Please login as donor first.");
      router.push("/donor/login");
      return;
    }

    const validationErrors = validateForm(formData);
    const normalizedFullAddress = buildFullAddress(formData.pickupPoint, currentLocation);
    setFormErrors(validationErrors);
    setSubmitError("");
    setSuccessMessage("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    const payload = {
      foodName: normalizeText(formData.foodName),
      foodCategory: formData.foodCategory,
      quantity: Number(formData.quantity),
      quantityUnit: formData.quantityUnit,
      foodPreparedTime: new Date(formData.foodPreparedTime).toISOString(),
      availableUntil: new Date(formData.availableUntil).toISOString(),
      location: pickupLocation?.displayLocation || "",
      lat: pickupLocation?.lat,
      lng: pickupLocation?.lng,
      area: pickupLocation?.area || "",
      city: pickupLocation?.city || "",
      state: pickupLocation?.state || "",
      fullAddress: pickupLocation?.fullAddress || normalizedFullAddress,
      pincode: pickupLocation?.pincode || "",
      contactNumber: formData.contactNumber.trim(),
      additionalNotes: formData.additionalNotes.trim(),
      foodImage: formData.foodImageData
        ? {
            fileName: formData.foodImageName,
            contentType: formData.foodImageType,
            dataUrl: formData.foodImageData
          }
        : undefined
    };

    try {
      const response = await axios.post<{ donation: Donation; message: string }>(
        `${API_BASE_URL}/donate`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setDonations((currentDonations) =>
        isDonationAvailable(response.data.donation)
          ? [response.data.donation, ...currentDonations]
          : currentDonations
      );
      setSuccessMessage(
        response.data.message || "Donation posted successfully for self-pickup."
      );
      resetForm();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || "Unable to submit the donation right now."
        : "Unable to submit the donation right now.";

      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <header>
        <div className="hero-small">
          <h1>
            <span className="dual-color-text">Donate</span> Your Excess Food
          </h1>
          <p>Make a difference by donating your surplus food to those in need.</p>
        </div>
      </header>

      <main>
        <section className="form-section">
          <h2>Fill in the Details to Donate</h2>
          <p className="form-subtitle">
            Receivers will collect this donation directly from your location.
          </p>

          {submitError && <div className="status-message error-message">{submitError}</div>}
          {successMessage && (
            <div className="status-message success-message">{successMessage}</div>
          )}

          <form
            id="donationForm"
            className="form-container"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="foodName">Food Name</label>
                <input
                  type="text"
                  id="foodName"
                  name="foodName"
                  placeholder="Example: Chapati, Veg pulao, bread"
                  value={formData.foodName}
                  onBlur={() => handleNormalizeBlur("foodName")}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                />
                {formErrors.foodName && <p className="field-error">{formErrors.foodName}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="foodCategory">Food Category</label>
                <select
                  id="foodCategory"
                  name="foodCategory"
                  value={formData.foodCategory}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Veg">Veg</option>
                  <option value="Non-veg">Non-veg</option>
                </select>
                {formErrors.foodCategory && (
                  <p className="field-error">{formErrors.foodCategory}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Quantity</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  placeholder="Example: 10"
                  min="1"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                />
                {formErrors.quantity && <p className="field-error">{formErrors.quantity}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="quantityUnit">Quantity Type</label>
                <select
                  id="quantityUnit"
                  name="quantityUnit"
                  value={formData.quantityUnit}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                >
                  <option value="plates">Plates</option>
                  <option value="people">People</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="foodPreparedTime">Food Prepared Time</label>
                <input
                  ref={preparedTimeInputRef}
                  type="datetime-local"
                  id="foodPreparedTime"
                  name="foodPreparedTime"
                  value={formData.foodPreparedTime}
                  onClick={handleDateTimeInputClick(preparedTimeInputRef)}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="cursor-pointer"
                  required
                />
                {formErrors.foodPreparedTime && (
                  <p className="field-error">{formErrors.foodPreparedTime}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="availableUntil">Available Until / Expiry Time</label>
                <input
                  ref={availableUntilInputRef}
                  type="datetime-local"
                  id="availableUntil"
                  name="availableUntil"
                  value={formData.availableUntil}
                  onClick={handleDateTimeInputClick(availableUntilInputRef)}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="cursor-pointer"
                  required
                />
                {formErrors.availableUntil && (
                  <p className="field-error">{formErrors.availableUntil}</p>
                )}
              </div>

              <div className="form-group full-width">
                <label>Your Location</label>
                <InteractiveLocationMap 
                  onLocationChange={handleLocationChange}
                  currentLocation={currentLocation}
                  isGpsLoading={isLocationLoading}
                  onRefreshGps={refreshLocation}
                  className="donation-location-map"
                />
              </div>

              <div className="form-group">
                <label htmlFor="pickupPoint">
                  House No / Building Name / Restaurant Name / NGO Name
                </label>
                <input
                  type="text"
                  id="pickupPoint"
                  name="pickupPoint"
                  placeholder="Example: House 21, Green Residency"
                  value={formData.pickupPoint}
                  onBlur={() => handleNormalizeBlur("pickupPoint")}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                />
                {formErrors.pickupPoint && (
                  <p className="field-error">{formErrors.pickupPoint}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="contactNumber">Contact Number</label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  placeholder="Enter contact number"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                />
                {formErrors.contactNumber && (
                  <p className="field-error">{formErrors.contactNumber}</p>
                )}
              </div>

              <div className="form-group full-width">
                <label htmlFor="fullAddressPreview">Full Address Preview</label>
                <textarea
                  id="fullAddressPreview"
                  value={pickupLocation?.fullAddress || fullAddressPreview || "Complete pickup address (updated with map)"}
                  rows={3}
                  className="location-preview"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label htmlFor="foodImage">Food Image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="foodImage"
                  name="foodImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
                <p className="field-hint">
                  Optional. Upload a clear food image up to 3 MB.
                </p>
                {formData.foodImageName && (
                  <p className="field-hint">Selected file: {formData.foodImageName}</p>
                )}
                {formErrors.foodImageData && (
                  <p className="field-error">{formErrors.foodImageData}</p>
                )}
              </div>

              <div className="form-group full-width">
                <label htmlFor="additionalNotes">Additional Notes</label>
                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  placeholder="Optional notes about packaging, allergens, or handling"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>
            </div>

            <button
              type="submit"
              className="button"
              disabled={isSubmitting || !pickupLocation || isLocationLoading}
            >
              {isSubmitting ? "Submitting..." : "Donate Now"}
            </button>
          </form>
        </section>

        <section id="recipients" className="donation-list-section">
          <div className="section-heading">
            <div>
              <h2>Active Donations</h2>
              <p className="section-subtitle">
                Clean donation listings with urgency and contact details.
              </p>
            </div>
          </div>

          {visibleDonations.length === 0 ? (
            <p className="empty-message">
              No active donations yet. Your next donation can be the first one listed.
            </p>
          ) : (
            <div className="donation-cards">
              {visibleDonations.map((donation) => (
                <DonationCard key={donation._id} donation={donation} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Page;
