"use client";

import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import "./style.css";

type ContactFormResponse = {
    success: boolean;
    error?: string;
};

const Page = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedMessage = message.trim();

        if (!trimmedName || !trimmedEmail || !trimmedMessage) {
            toast.error("Name, email, and message are required.");
            return;
        }

        const toastId = toast.loading("Sending message...");
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: trimmedName,
                    email: trimmedEmail,
                    message: trimmedMessage,
                }),
            });

            const data: ContactFormResponse = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to send message.");
            }

            toast.success("Message Sent Successfully", { id: toastId });
            setName("");
            setEmail("");
            setMessage("");
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Failed to send message.";
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
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
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isSubmitting}
                            required 
                        />
                        <input 
                            type="email" 
                            id="email" 
                            placeholder="Your Email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSubmitting}
                            required 
                        />
                        <textarea 
                            id="message" 
                            placeholder="Your Message" 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={isSubmitting}
                            required 
                            rows={5}
                        ></textarea>

                        <button type="submit" className="button" disabled={isSubmitting}>
                            {isSubmitting ? "Sending..." : "Send Message"}
                        </button>
                    </form>
                </section>

                <section className="content-section">
                    <h2>Other Ways to Reach Us</h2>
                    <div className="contact-info">
                        <div className="contact-item">
                            <h3>Email</h3>
                            <p>harshcu2@gmail.com</p>
                        </div>
                        <div className="contact-item">
                            <h3>Phone</h3>
                            <p>+91 9752297271</p>
                        </div>
                        <div className="contact-item">
                            <h3>Address</h3>
                            <p>2124, GBP Crest, Kharar, Punjab, India, 140301.</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Page;
