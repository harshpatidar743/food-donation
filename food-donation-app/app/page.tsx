"use client";

export default function Home() {
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
          <a href="/Donation" className="button">
            <i className="fas fa-donate"></i> Donate Food
          </a>
        </div>
        
        <div className="option">
          <h2>Looking for food?</h2>
          <p>If you're in need of food, click below to find available donations.</p>
          <a href="/GetFood" className="button">
            <i className="fas fa-hamburger"></i> Get Food
          </a>
        </div>
      </section>

      <footer>
        <p>&copy; 2024 Food Donation Platform. Making a difference, one meal at a time.</p>
      </footer>
    </div>
  );
}
