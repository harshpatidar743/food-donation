"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./myDonations.css";
import { getStoredAuthToken, getStoredAuthUser } from "../../lib/auth";
import { Donation } from "../../Donation/types";
import {
  formatRemainingQuantityDisplay,
  getDonationAddress,
  getDonationStatus,
  getDonationTitle,
  getExpiryMeta,
  getQuantityProgress
} from "../../Donation/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
type DonationWithId = Donation & { _id: string };

export default function MyDonations() {
  const router = useRouter();
  const [donations, setDonations] = useState<DonationWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [takenQuantities, setTakenQuantities] = useState<Record<string, string>>({});
  const [updatingDonationId, setUpdatingDonationId] = useState<string | null>(null);

  useEffect(() => {
    const authUser = getStoredAuthUser();
    const donorId = authUser?.donorId;
    const token = getStoredAuthToken();

    if (!donorId || !token) {
      router.push("/donor/login");
      return undefined;
    }

    const fetchDonations = async (showLoading = false) => {
      if (showLoading) {
        setLoading(true);
      }

      try {
        const response = await fetch(`${API}/mydonations/${donorId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();

        if (response.ok) {
          setDonations(data);
          setError("");
        } else {
          setError(data.error || "Failed to load donations");
        }
      } catch {
        setError("An error occurred while loading donations");
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

    try {
      const response = await fetch(`${API}/donation/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getStoredAuthToken()}`
        }
      });

      if (response.ok) {
        setDonations((currentDonations) =>
          currentDonations.filter((donation) => donation._id !== id)
        );
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete donation");
      }
    } catch {
      alert("Failed to delete donation");
    }
  };

  const reduceQuantity = async (donationId: string) => {
    const takenQuantity = Number(takenQuantities[donationId] || 0);

    if (!takenQuantity || takenQuantity <= 0) {
      alert("Enter a valid taken quantity.");
      return;
    }

    setUpdatingDonationId(donationId);

    try {
      const response = await fetch(`${API}/donation/${donationId}/reduce`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getStoredAuthToken()}`
        },
        body: JSON.stringify({ takenQuantity })
      });

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
    setUpdatingDonationId(donationId);

    try {
      const response = await fetch(`${API}/donation/${donationId}/complete`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getStoredAuthToken()}`
        }
      });

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
          <div className="loading-state">
            <div className="spinner">Loading...</div>
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
              const progressPercent = getQuantityProgress(donation);
              const controlsDisabled = donationStatus !== "active" || updatingDonationId === donationId;

              return (
                <div key={donationId} className={`donation-card donation-card--${donationStatus}`}>
                  <div className="donation-card-header">
                    <div className="donation-info">
                      <h3>{getDonationTitle(donation)}</h3>
                      <p className="donation-meta">{formatRemainingQuantityDisplay(donation)}</p>
                    </div>
                    <span className={`status-pill status-pill--${donationStatus}`}>
                      {donationStatus}
                    </span>
                  </div>

                  <div className="progress-block">
                    <div className="progress-copy">
                      <span>Remaining stock</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="progress-track" aria-hidden="true">
                      <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>

                  <div className="donation-details">
                    <div className="donation-detail">
                      <span className="label">Category</span>
                      <span className="value">{donation.foodCategory || "Not specified"}</span>
                    </div>
                    <div className="donation-detail">
                      <span className="label">Total Quantity</span>
                      <span className="value">{donation.totalQuantity ?? donation.quantity}</span>
                    </div>
                    <div className="donation-detail">
                      <span className="label">Remaining Quantity</span>
                      <span className="value">{donation.remainingQuantity ?? donation.quantity}</span>
                    </div>
                    <div className="donation-detail">
                      <span className="label">Pickup Address</span>
                      <span className="value">{getDonationAddress(donation)}</span>
                    </div>
                    <div className="donation-detail">
                      <span className="label">Expiry</span>
                      <span className={`value expiry-value expiry-value--${expiryMeta.tone}`}>
                        {expiryMeta.label}
                      </span>
                    </div>
                    <div className="donation-detail">
                      <span className="label">Posted On</span>
                      <span className="value">
                        {new Date(donation.createdAt || "").toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="quantity-controls">
                    <div className="quantity-input-group">
                      <label htmlFor={`taken-${donationId}`}>Food Taken</label>
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
