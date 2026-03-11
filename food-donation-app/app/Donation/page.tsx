"use client"

import React, { useEffect, useState } from 'react';
import './style.css';
import axios from 'axios'
import toast from 'react-hot-toast';
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const Page = () => {

    const [formData, setFormData] = useState({
        foodType: '',
        quantity: '',
        location: '',
    });

    const router = useRouter();

    const [donations, setDonations] = useState<{ foodType: string, quantity: string, location: string }[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);

        const donorId = localStorage.getItem("donorId");

        if (!donorId) {
            router.push("/donor/login");
            return;
        }

        const fetchData = async () => {
            const toastId = isClient && toast.loading('fetching data ...');
            try {
                const response = await axios.get(`${API_BASE_URL}/donations`);
                console.log("Fetched donations: ", response);
                setDonations(response.data);
                isClient && toast.success("Data fetched successfully");
            } catch (error) {
                isClient && toast.error("Error occurred");
                console.error("Error fetching donations: ", error);
            } finally {
                if (isClient && toastId) toast.dismiss(toastId);
            }
        };

        fetchData();
    }, []);

    const handleInputChange = (e: any) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value,
        });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        const donorId = localStorage.getItem("donorId");

        if (!donorId) {
            toast.error("Please login as donor first");
            return;
        }

        const toastId = isClient && toast.loading("Donating...");

        try {

            const payload = {
                donorId,
                foodType: formData.foodType,
                quantity: formData.quantity,
                location: formData.location
            };

            const response = await axios.post(`${API_BASE_URL}/donate`, payload);

            setDonations((prev) => [...prev, payload]);

            setFormData({
                foodType: "",
                quantity: "",
                location: "",
            });

            isClient && toast.success("Donated successfully");

        } catch (error) {

            isClient && toast.error("Error occurred");
            console.log(error);

        } finally {

            if (isClient && toastId) toast.dismiss(toastId);

        }
    };

    return (
        <div>
            <header>
                <div className="hero-small">
                    <h1>Donate Your Excess Food</h1>
                    <p>Make a difference by donating your surplus food to those in need.</p>
                </div>
            </header>
            <main>
                <section className="form-section">
                    <h2>Fill in the Details to Donate</h2>
                    <form id="donationForm" className="form-container" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            id="foodType"
                            placeholder="Type of Food"
                            value={formData.foodType}
                            onChange={handleInputChange}
                            required
                        />

                        <input
                            type="number"
                            id="quantity"
                            placeholder="Quantity"
                            value={formData.quantity}
                            onChange={handleInputChange}
                            required
                        />

                        <input
                            type="text"
                            id="location"
                            placeholder="Location"
                            value={formData.location}
                            onChange={handleInputChange}
                            required
                        />

                        <button type="submit" className="button">Donate Now</button>
                    </form>
                </section>

                <section id="recipients" className="donation-list-section">
                    <h2>Available Donations</h2>
                    <ul id="donationsList">
                        {donations.map((donation, index) => (
                            <li key={index}>
                                Donation: {donation.quantity} units of {donation.foodType} in {donation.location}.
                            </li>
                        ))}
                    </ul>
                </section>
            </main>
            <footer>
                <p>&copy; 2024 Food Donation Platform. Thank you for helping!</p>
            </footer>
        </div>
    );
};

export default Page;
