"use client"

import React, { useState } from 'react';
import './style.css';
import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const Page = () => {
  const [location, setLocation] = useState('');
  const [availableDonations, setAvailableDonations] = useState<{id?: number, donorName: string, foodType: string, location: string}[]>([]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const toastId=toast.loading('fetching available food in the desired region')

    try{

    

    
    console.log(`Searching for food in: ${location}`);

const response = await axios.get(`${API_BASE_URL}/donationsbylocation`, {
  params: {
    location: location,
       },
    });

    console.log("response : ",response );

    setAvailableDonations(response.data.donations);

}
catch(error){
    toast.error('error in fetching');
}
finally{
  toast.dismiss(toastId);
}

  
  };

  return (
    <div>
      <header>
        <div className="hero-small">
          <h1>Find Food Donations Near You</h1>
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
          <ul id="food-list">
            {availableDonations.map((donation) => (
              <li key={donation.id}>
                <strong>{donation.donorId?.name}</strong> is donating {donation.quantity} units of {donation.foodType} in {donation.location}
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer>
        <p>&copy; 2024 Food Donation Platform. Helping people in need, one meal at a time.</p>
      </footer>
    </div>
  );
};

export default Page;
