"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const donorId = localStorage.getItem("donorId");
    if (donorId) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <div className="container">
      <header>
        <div className="hero">
          <h1>Join the Fight Against Food Waste</h1>
          <p>Together we can make a difference by sharing surplus food with those in need.</p>
          <a href="#options" className="hero-button">Get Started</a>
        </div>
      </header>
      
      <section id="options" className="options">
        <div className="option">
          <h2>Are you a donor?</h2>
          <p>If you have excess food and want to donate, click below.</p>
          <Link href={isAuthenticated ? "/Donation" : "/donor/login"} className="button">
            <i className="fas fa-donate"></i> Donate Food
          </Link>
        </div>
        
        <div className="option">
          <h2>Looking for food?</h2>
          <p>If you're in need of food, click below to find available donations.</p>
          <Link href="/GetFood" className="button">
            <i className="fas fa-hamburger"></i> Get Food
          </Link>
        </div>
      </section>

      <section className="info-section">
        <div className="info-card">
          <div className="info-icon">🌍</div>
          <h3>Reduce Food Waste</h3>
          <p>Help reduce the massive amount of food waste by sharing surplus with those in need.</p>
        </div>
        <div className="info-card">
          <div className="info-icon">❤️</div>
          <h3>Help Others</h3>
          <p>Your donations can make a real difference in someone's life.</p>
        </div>
        <div className="info-card">
          <div className="info-icon">🤝</div>
          <h3>Community Connection</h3>
          <p>Connect with donors and recipients in your local community.</p>
        </div>
      </section>

      <footer>
        <p>&copy; 2024 Food Donation Platform. Making a difference, one meal at a time.</p>
      </footer>
    </div>
  );
}

