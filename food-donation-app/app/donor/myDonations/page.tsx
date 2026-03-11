"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./myDonations.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Donation {
  _id: string;
  foodType: string;
  quantity: number;
  location: string;
  createdAt: string;
}

export default function MyDonations() {
  const router = useRouter();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user is logged in
    const donorId = localStorage.getItem("donorId");

    if (!donorId) {
      router.push("/donor/login");
      return;
    }

    // Fetch donations
    const fetchDonations = async () => {
      try {
        const res = await fetch(`${API}/mydonations/${donorId}`);
        const data = await res.json();

        if (res.ok) {
          setDonations(data);
        } else {
          setError(data.error || "Failed to load donations");
        }
      } catch (err) {
        setError("An error occurred while loading donations");
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [router]);

  const deleteDonation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this donation?")) {
      return;
    }

    try {
      const res = await fetch(`${API}/donation/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setDonations(donations.filter((d) => d._id !== id));
      }
    } catch (err) {
      alert("Failed to delete donation");
    }
  };

  if (loading) {
    return (
      <div className="my-donations-page">
        <div className="my-donations-container">
          <div className="loading-state">
            <div className="spinner">⏳</div>
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
          <p>Manage and view all your food donations</p>
        </div>

        <Link href="/donor/dashboard" className="back-button">
          ← Back to Dashboard
        </Link>

        {error && (
          <div className="error-state">
            <h2>Error</h2>
            <p>{error}</p>
          </div>
        )}

        {!error && donations.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📦</div>
            <h2>No Donations Yet</h2>
            <p>You haven't made any donations yet. Start helping those in need!</p>
            <Link href="/Donation" className="donate-now-button">
              Make Your First Donation
            </Link>
          </div>
        ) : (
          <div className="donations-list">
            {donations.map((donation) => (
              <div key={donation._id} className="donation-card">
                <div className="donation-info">
                  <h3>🍲 {donation.foodType}</h3>
                  <div className="donation-details">
                    <div className="donation-detail">
                      <span className="label">Quantity</span>
                      <span className="value">{donation.quantity} units</span>
                    </div>
                    <div className="donation-detail">
                      <span className="label">Location</span>
                      <span className="value">{donation.location}</span>
                    </div>
                    <div className="donation-detail">
                      <span className="label">Date</span>
                      <span className="value">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="donation-actions">
                  <button
                    className="delete-button"
                    onClick={() => deleteDonation(donation._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

