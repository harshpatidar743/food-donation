"use client";

import React, { FormEvent, useEffect, useState } from "react";
import "./style.css";
import axios from "axios";
import toast from "react-hot-toast";
import DonationCard from "../Donation/components/DonationCard";
import { Donation } from "../Donation/types";
import { isDonationAvailable } from "../Donation/utils";

type Donor = {
  _id: string;
  name: string;
};

type SearchDonation = Donation & {
  donorId?: Donor | string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const Page = () => {
  const [location, setLocation] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [availableDonations, setAvailableDonations] = useState<SearchDonation[]>([]);
  const visibleDonations = availableDonations.filter((donation) => isDonationAvailable(donation));

  useEffect(() => {
    if (!activeSearch) {
      return undefined;
    }

    const fetchDonations = async (showToast = false) => {
      const toastId = toast.loading("Fetching available food in the desired region");

      try {
        const response = await axios.get<SearchDonation[] | { donations: SearchDonation[] }>(
          `${API_BASE_URL}/donationsbylocation`,
          {
            params: {
              location: activeSearch
            }
          }
        );

        const nextDonations = Array.isArray(response.data)
          ? response.data
          : response.data.donations || [];

        setAvailableDonations(nextDonations.filter((donation) => isDonationAvailable(donation)));

        if (showToast) {
          toast.success("Available donations loaded.", { id: toastId });
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
    };

    fetchDonations(true);
    const intervalId = setInterval(() => {
      fetchDonations();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [activeSearch]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const searchValue = location.trim();

    if (!searchValue) {
      toast.error("Please enter an address area or pincode.");
      return;
    }

    setActiveSearch(searchValue);
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
          <h2>Enter Your Area or Pincode</h2>
          <form id="location-form" className="form-container" onSubmit={handleSubmit}>
            <input
              type="text"
              id="user-location"
              placeholder="Enter address area or pincode"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              required
            />
            <button type="submit" className="button">
              Search for Food
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
