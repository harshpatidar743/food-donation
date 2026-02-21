"use client"

import React, { useEffect, useState } from 'react';
import axios from 'axios'
import toast from 'react-hot-toast';

const Page = () => {

    const [formData, setFormData] = useState({
        donorName: '',
        foodType: '',
        quantity: '',
        location: '',
    });

    const [donations, setDonations] = useState<{donorName: string, foodType: string, quantity: string, location: string}[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);

        const fetchData = async () => {
            const toastId = isClient && toast.loading('fetching data ...');
            try {
                const response = await axios.get('https://food-donation-uwmq.onrender.com/donations');
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
    }, [isClient]);

    const handleInputChange = (e: any) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value,
        });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const toastId = isClient && toast.loading('Donating...');
        try {

            setDonations((prevDonations) => [...prevDonations, formData]);

            console.log(formData);

            const response = await axios.post('https://food-donation-uwmq.onrender.com/donate', formData);

            console.log("Response: ", response);


            setFormData({
                donorName: '',
                foodType: '',
                quantity: '',
                location: '',
            });

            isClient && toast.success('Donated successfully');
        } catch (error) {
            isClient && toast.error('Error occurred');
            console.log("This is the error: ", error);
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
                        <input type="text" id="donorName" placeholder="Your Name" value={formData.donorName}
                            onChange={handleInputChange} required />
                        <input type="text" id="foodType" placeholder="Type of Food"
                            value={formData.foodType}
                            onChange={handleInputChange}
                            required />
                        <input type="number" id="quantity" placeholder="Quantity" value={formData.quantity}
                            onChange={handleInputChange} required />
                        <input type="text" id="location" placeholder="Location" value={formData.location}
                            onChange={handleInputChange} required />

                        <button type="submit" className="button">Donate Now</button>
                    </form>
                </section>

                <section id="recipients" className="donation-list-section">
                    <h2>Available Donations</h2>
                    <ul id="donationsList">
                        {donations.map((donation, index) => (
                            <li key={index}>
                                <strong>{donation.donorName}</strong> is donating {donation.quantity} units of {donation.foodType} in {donation.location}.
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
