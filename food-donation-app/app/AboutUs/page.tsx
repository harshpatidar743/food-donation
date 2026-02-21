"use client"

import React from 'react';

const Page = () => {
    return (
        <div>
            <header>
                <div className="hero-small">
                    <h1>About Us</h1>
                    <p>Learn more about our mission to reduce food waste and help those in need.</p>
                </div>
            </header>
            <main>
                <section className="content-section">
                    <h2>Our Mission</h2>
                    <p>
                        We are dedicated to reducing food waste and fighting hunger in our community. 
                        Our platform connects donors with excess food to those who need it most. 
                        Together, we can make a difference one meal at a time.
                    </p>
                </section>

                <section className="content-section">
                    <h2>What We Do</h2>
                    <p>
                        We provide a seamless platform for:
                    </p>
                    <ul className="feature-list">
                        <li>Donors to share their surplus food</li>
                        <li>Those in need to find available food donations</li>
                        <li>Building a stronger, more connected community</li>
                    </ul>
                </section>

                <section className="content-section">
                    <h2>Join Our Cause</h2>
                    <p>
                        Whether you have food to donate or need assistance, we are here to help. 
                        Together, we can reduce waste and ensure no one goes hungry.
                    </p>
                </section>
            </main>
            <footer>
                <p>&copy; 2024 Food Donation Platform. Thank you for your support!</p>
            </footer>
        </div>
    );
};

export default Page;
