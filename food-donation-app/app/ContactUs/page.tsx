"use client"

import React, { useState } from 'react';
import './style.css';
import toast from 'react-hot-toast';

const Page = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleInputChange = (e: any) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value,
        });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const toastId = toast.loading('Sending message...');
        
        // Simulate sending message
        setTimeout(() => {
            toast.success('Message sent successfully!');
            toast.dismiss(toastId);
            setFormData({
                name: '',
                email: '',
                message: ''
            });
        }, 1000);
    };

    return (
        <div>
            <header>
                <div className="hero-small">
                    <h1>Contact Us</h1>
                    <p>We'd love to hear from you. Get in touch with us for any questions or feedback.</p>
                </div>
            </header>
            <main>
                <section className="form-section">
                    <h2>Send Us a Message</h2>
                    <form id="contactForm" className="form-container" onSubmit={handleSubmit}>
                        <input 
                            type="text" 
                            id="name" 
                            placeholder="Your Name" 
                            value={formData.name}
                            onChange={handleInputChange} 
                            required 
                        />
                        <input 
                            type="email" 
                            id="email" 
                            placeholder="Your Email" 
                            value={formData.email}
                            onChange={handleInputChange} 
                            required 
                        />
                        <textarea 
                            id="message" 
                            placeholder="Your Message" 
                            value={formData.message}
                            onChange={handleInputChange} 
                            required 
                            rows={5}
                        ></textarea>

                        <button type="submit" className="button">Send Message</button>
                    </form>
                </section>

                <section className="content-section">
                    <h2>Other Ways to Reach Us</h2>
                    <div className="contact-info">
                        <div className="contact-item">
                            <h3>Email</h3>
                            <p>contact@fooddonation.com</p>
                        </div>
                        <div className="contact-item">
                            <h3>Phone</h3>
                            <p>+1 (555) 123-4567</p>
                        </div>
                        <div className="contact-item">
                            <h3>Address</h3>
                            <p>123 Food Street, Help City, HC 12345</p>
                        </div>
                    </div>
                </section>
            </main>
            <footer>
                <p>&copy; 2024 Food Donation Platform. Thank you for reaching out!</p>
            </footer>
        </div>
    );
};

export default Page;
