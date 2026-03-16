"use client"

import React, { useState } from 'react';
import './style.css';
import axios from 'axios'
import toast from 'react-hot-toast'

interface Donor {
  _id: string;
  name: string;
}

interface Donation {
  _id: string;
  donorId: Donor;
  foodType: string;
  quantity: number;
  location: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const Page = () => {
  const [location, setLocation] = useState('');
  const [availableDonations, setAvailableDonations] = useState<Donation[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Fetching available food in the desired region')

    try {
      console.log(`Searching for food in: ${location}`);

      const response = await axios.get<{ donations: Donation[] }>(`${API_BASE_URL}/donationsbylocation`, {
        params: {
          location: location,
        },
      });

      console.log("response : ", response);
      setAvailableDonations(response.data.donations || []);

    } catch (error: any) {
      console.error('Error fetching donations:', error);
      toast.error(error.response?.data?.error || 'Error in fetching donations');
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <div>
      <header>
        <div className="hero-small">
          <h1>Find Food <span className="dual-color-text">Donations</span> Near You</h1>
          <p>Search for available food donations in your area and help reduce food waste.</p>
        </div>
      </header>

      <main>
        <section className="form-section">
          <h2>Enter Your Location to Search</h2>
          <form id="location-form" className="form-container" onSubmit={handleSubmit}>
            <input
              type="text"
              id="user-location"
              placeholder="Enter your location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <button type="submit" className="button">Search for Food</button>
          </form>
        </section>

        <section id="available-food" className="donation-list-section">
          <h2>Available Donations</h2>
          {availableDonations.length === 0 ? (
            <p className="empty-message">No donations found in this location. Try searching for a different area.</p>
          ) : (
            <table className="donations-table">
              <thead>
                <tr>
                  <th>Donor Name</th>
                  <th>Food Type</th>
                  <th>Quantity</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {availableDonations.map((donation) => (
                  <tr key={donation._id}>
                    <td>
                      {donation.donorId && typeof donation.donorId === 'object' && donation.donorId.name 
                        ? donation.donorId.name 
                        : 'Anonymous'}
                    </td>
                    <td>{donation.foodType}</td>
                    <td>{donation.quantity} units</td>
                    <td>📍 {donation.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
};

export default Page;
