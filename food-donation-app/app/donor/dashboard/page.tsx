"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./dashboard.css";
import { clearStoredAuthUser, getStoredAuthUser } from "../../lib/auth";

export default function Dashboard() {
  const router = useRouter();
  const [donorName, setDonorName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const authUser = getStoredAuthUser();
    
    if (!authUser?.donorId) {
      router.push("/donor/login");
      return;
    }

    if (authUser.name) {
      setDonorName(authUser.name);
    }

    setLoading(false);
  }, [router]);

  const logout = () => {
    clearStoredAuthUser();
    router.push("/donor/login");
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Donor Dashboard</h1>
          <p>Manage your food donations</p>
        </div>

        {donorName && (
          <div className="welcome-message">
            <h2>Welcome, {donorName}!</h2>
            <p>Thank you for being a part of our food donation initiative.</p>
          </div>
        )}

        <div className="dashboard-actions">
          <div 
            className="action-card add-donation"
            onClick={() => router.push("/Donation")}
          >
            <div className="icon">🍲</div>
            <h3>Add Donation</h3>
            <p>Donate your excess food to help those in need</p>
          </div>

          <div 
            className="action-card my-donations"
onClick={() => router.push("/donor/myDonations")}
          >
            <div className="icon">📋</div>
            <h3>My Donations</h3>
            <p>View and manage your previous donations</p>
          </div>

          <div 
            className="action-card logout"
            onClick={logout}
          >
            <div className="icon">🚪</div>
            <h3>Logout</h3>
            <p>Sign out of your account</p>
          </div>
        </div>

        <div className="dashboard-stats">
          <h3>Quick Stats</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="number">0</div>
              <div className="label">Total Donations</div>
            </div>
            <div className="stat-item">
              <div className="number">0</div>
              <div className="label">People Helped</div>
            </div>
            <div className="stat-item">
              <div className="number">0</div>
              <div className="label">Active Listings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

