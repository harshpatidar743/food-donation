"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./myDonations.css";
import { getStoredAuthUser } from "../../lib/auth";
import { apiGet, apiPatch, apiDelete } from "../../lib/api";
import { Donation } from "../../Donation/types";
import dynamic from 'next/dynamic';
const LocationMapPreview = dynamic(() => import('@/app/components/LocationMapPreview'), { ssr: false });
import {
  formatAvailableQuantityDisplay,
  getCompactExpiryLabel,
  getDonationAddress,
  getDonationLocationLabel,
  getDonationStatus,
  getDonationTitle,
  getExpiryMeta
} from "../../Donation/utils";


type DonationWithId = Donation & { _id: string };

export default function MyDonations() {
  const router = useRouter();
  const [donations, setDonations] = useState<DonationWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [takenQuantities, setTakenQuantities] = useState<Record<string, string>>({});
  const [updatingDonationId, setUpdatingDonationId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const authUser = getStoredAuthUser();
    const donorId = authUser?.donorId;

    if (!donorId) {
      router.push("/donor/login");
      return;
    }
    // Token handled automatically by apiFetch with 401 logout

    const fetchDonations = async (showLoading = false) => {
      if (showLoading) {
        setLoading(true);
      }

      try {
        const response = await apiGet(`/mydonations/${donorId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load donations");
        }

        setDonations(data);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while loading donations");
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    };

    fetchDonations(true);
    const intervalId = setInterval(() => {
      fetchDonations();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [router]);

  const deleteDonation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this donation?")) {
      return;
    }
    // Auth handled automatically by apiFetch with 401 logout

    try {
      const response = await apiDelete(`/donation/${id}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete donation");
      }

      setDonations((currentDonations) =>
        currentDonations.filter((donation) => donation._id !== id)
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete donation");
    }
  };

  const reduceQuantity = async (donationId: string) => {
    const takenQuantity = Number(takenQuantities[donationId] || 0);

    if (!takenQuantity || takenQuantity <= 0) {
      alert("Enter a valid taken quantity.");
      return;
    }

    // Auth handled automatically by apiFetch with 401 logout

    setUpdatingDonationId(donationId);

    try {
      const response = await apiPatch(`/donation/${donationId}/reduce`, { takenQuantity });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update quantity");
      }

      setDonations((currentDonations) =>
        currentDonations.map((donation) =>
          donation._id === donationId ? data.donation : donation
        )
      );
      setTakenQuantities((currentValues) => ({
        ...currentValues,
        [donationId]: ""
      }));
    } catch (updateError) {
      alert(updateError instanceof Error ? updateError.message : "Failed to update quantity");
    } finally {
      setUpdatingDonationId(null);
    }
  };

  const markCompleted = async (donationId: string) => {
    // Auth handled automatically by apiFetch with 401 logout

    setUpdatingDonationId(donationId);

    try {
      const response = await apiPatch(`/donation/${donationId}/complete`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete donation");
      }

      setDonations((currentDonations) =>
        currentDonations.map((donation) =>
          donation._id === donationId ? data.donation : donation
        )
      );
    } catch (completeError) {
      alert(completeError instanceof Error ? completeError.message : "Failed to complete donation");
    } finally {
      setUpdatingDonationId(null);
    }
  };

  if (loading) {
    return (
      <div className="my-donations-page">
        <div className="my-donations-container">
          <div className="loading-state" role="status" aria-live="polite">
            <div className="spinner" aria-hidden="true" />
            <p>Loading your donations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-donations-page">
      <div className="my-donations-container">
        <div className="my-donations-header">
          <h1>My Donations</h1>
          <p>Manage live food quantities and keep every listing in sync</p>
        </div>

        <Link href="/donor/dashboard" className="back-button">
          Back to Dashboard
        </Link>

        {error && (
          <div className="error-state">
            <h2>Error</h2>
            <p>{error}</p>
          </div>
        )}

        {!error && donations.length === 0 ? (
          <div className="empty-state">
            <div className="icon">No donations</div>
            <h2>No Donations Yet</h2>
            <p>You haven&apos;t made any donations yet. Start helping those in need!</p>
            <Link href="/Donation" className="donate-now-button">
              Make Your First Donation
            </Link>
          </div>
        ) : (
          <div className="donations-list">
            {donations.map((donation) => {
              const donationId = donation._id;
              const donationStatus = getDonationStatus(donation);
              const expiryMeta = getExpiryMeta(donation.availableUntil);
              const expiryLabel = getCompactExpiryLabel(donation.availableUntil);
              const locationLabel = getDonationLocationLabel(donation);
              const pickupAddress = getDonationAddress(donation);
              const showPickupAddress =
                pickupAddress &&
                pickupAddress.toLowerCase() !== locationLabel.toLowerCase();
              const controlsDisabled = donationStatus !== "active" || updatingDonationId === donationId;

              return (
                <div key={donationId} className={`donation-card donation-card--${donationStatus}`}>
                  <div className="donation-card-main">
                    {donation.foodImage?.dataUrl ? (
                      <div className="donation-card-image-wrap">
                        <Image
                          src={donation.foodImage.dataUrl}
                          alt={getDonationTitle(donation)}
                          className="donation-card-image"
                          width={80}
                          height={80}
                          sizes="80px"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="donation-card-image-wrap donation-card-image-wrap--placeholder">
                        <span>No image</span>
                      </div>
                    )}

                    <div className="donation-summary">
                      <div className="donation-card-header">
                        <div className="donation-info">
                          <h3>{getDonationTitle(donation)}</h3>
                        </div>
                        <span className={`status-pill status-pill--${donationStatus}`}>
                          {donationStatus}
                        </span>
                      </div>

                      <p className="donation-location">{locationLabel}</p>
                      {showPickupAddress && (
                        <p className="donation-location-detail">Pickup: {pickupAddress}</p>
                      )}

                      <div className="donation-meta-row">
                        <span>{formatAvailableQuantityDisplay(donation)}</span>
                        <span className={`expiry-value expiry-value--${expiryMeta.tone}`}>
                          {expiryLabel}
                        </span>
                      </div>

                      <div className="donation-submeta-row">
                        <span>{donation.foodCategory || "Food"}</span>
                        <span>{new Date(donation.createdAt || "").toLocaleDateString()}</span>
                      </div>

                      <div className="donation-map-row">
                        <LocationMapPreview
                          lat={donation.lat}
                          lng={donation.lng}
                          title={getDonationTitle(donation)}
                          buttonClassName="map-button"
                          disabledButtonClassName="map-button map-button--disabled"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="quantity-controls">
                    <div className="quantity-input-group">
                      <label htmlFor={`taken-${donationId}`}>Food Taken</label>
                      <div className="quantity-input-group">
                        <input
                          id={`taken-${donationId}`}
                          type="number"
                          min="1"
                          placeholder="2"
                          value={takenQuantities[donationId] || ""}
                          disabled={controlsDisabled}
                          onChange={(event) =>
                            setTakenQuantities((currentValues) => ({
                              ...currentValues,
                              [donationId]: event.target.value
                            }))
                          }
                        />
                      </div>

                      <div className="control-buttons">
                        <button
                          className="update-button"
                          disabled={controlsDisabled}
                          onClick={() => reduceQuantity(donationId)}
                        >
                          Reduce Quantity
                        </button>
                        <button
                          className="complete-button"
                          disabled={controlsDisabled}
                          onClick={() => markCompleted(donationId)}
                        >
                          Mark as Completed
                        </button>
                        <button
                          className="delete-button"
                          disabled={updatingDonationId === donationId}
                          onClick={() => deleteDonation(donationId)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

