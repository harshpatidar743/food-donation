"use client"

import React, { useEffect, useState } from 'react';
import './style.css';
import axios from 'axios'
import toast from 'react-hot-toast';
import { useRouter } from "next/navigation";
import { getStoredAuthToken, getStoredAuthUser } from "../lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type Donation = {
    _id?: string;
    foodType: string;
    quantity: number;
    location: string;
};

const Page = () => {

    const [formData, setFormData] = useState({
        foodType: '',
        quantity: '',
        location: '',
    });

    const router = useRouter();

    const [donations, setDonations] = useState<Donation[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);

        const authUser = getStoredAuthUser();

        if (!authUser?.donorId) {
            router.push("/donor/login");
            return;
        }

        const fetchData = async () => {
            const toastId = isClient && toast.loading('fetching data ...');
            try {
                const response = await axios.get<Donation[]>(`${API_BASE_URL}/donations`);
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

        const authUser = getStoredAuthUser();
        const token = getStoredAuthToken();

        if (!authUser?.donorId || !token) {
            toast.error("Please login as donor first");
            router.push("/donor/login");
            return;
        }

        const toastId = isClient && toast.loading("Donating...");

        try {

            const payload = {
                foodType: formData.foodType,
                quantity: Number(formData.quantity),
                location: formData.location
            };

            const response = await axios.post<{ donation: Donation; message: string }>(
                `${API_BASE_URL}/donate`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setDonations((prev) => [...prev, response.data.donation]);

            setFormData({
                foodType: "",
                quantity: "",
                location: "",
            });

            isClient && toast.success(response.data.message || "Donated successfully");

        } catch (error: any) {

            isClient && toast.error(error.response?.data?.error || "Error occurred");
            console.log(error);

        } finally {

            if (isClient && toastId) toast.dismiss(toastId);

        }
    };

    return (
        <div>
            <header>
                <div className="hero-small">
                    <h1><span className="dual-color-text">Donate</span> Your Excess Food</h1>
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
        </div>
    );
};

export default Page;
