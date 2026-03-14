"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./register.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
type UserType = "individual" | "organization" | "business";

const userTypeCards = [
  {
    type: "individual" as UserType,
    label: "Individual",
    description: "Donate or receive food"
  },
  {
    type: "organization" as UserType,
    label: "Organization",
    description: "Food banks, charities"
  },
  {
    type: "business" as UserType,
    label: "Restaurant / Business",
    description: "Businesses with surplus"
  }
];

const userTypeTitles: Record<UserType, string> = {
  individual: "Register As Individual",
  organization: "Register As Organization",
  business: "Register As Restaurant"
};

const userTypeButtonLabels: Record<UserType, string> = {
  individual: "Register as Individual",
  organization: "Register as Organization",
  business: "Register as Restaurant"
};

const createInitialForm = (userType: UserType) => ({
  userType,
  name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  city: "",
  organizationName: "",
  registrationNumber: "",
  organizationAddress: "",
  ngoCertificateName: "",
  businessName: "",
  businessType: "",
  ownerName: "",
  businessAddress: "",
  gstNumber: ""
});

export default function Register() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>("individual");
  const [form, setForm] = useState(createInitialForm("individual"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUserTypeChange = (selectedType: UserType) => {
    setUserType(selectedType);
    setForm((currentForm) => ({
      ...currentForm,
      userType: selectedType
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    setForm((currentForm) => ({
      ...currentForm,
      ngoCertificateName: file?.name || ""
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        userType,
        name:
          userType === "organization"
            ? form.organizationName
            : userType === "business"
              ? form.businessName
              : form.name
      };

      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Registration successful! Please login to continue.");
        setUserType("individual");
        setForm(createInitialForm("individual"));
        setTimeout(() => {
          router.push("/donor/login");
        }, 2000);
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>Join FoodShare</h1>
          <p>Connect with your community through food sharing</p>
        </div>

        <div className="register-content">
          <div className="user-type-cards" role="radiogroup" aria-label="Select user type">
            {userTypeCards.map((card) => (
              <button
                key={card.type}
                type="button"
                className={`user-type-card ${userType === card.type ? "selected" : ""}`}
                onClick={() => handleUserTypeChange(card.type)}
                aria-pressed={userType === card.type}
              >
                <span className="card-kicker">{card.label}</span>
                {/* <strong>{card.label}</strong> */}
                <span>{card.description}</span>
              </button>
            ))}
          </div>

          <div className="register-form-panel">
            <div className="form-panel-header">
              <h2>{userTypeTitles[userType]}</h2>
              <div className="title-accent" />
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form className="register-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                {userType === "individual" && (
                  <>
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="password">Password</label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Create a password"
                        value={form.password}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="name">Full Name</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={form.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="address">Address</label>
                      <input
                        id="address"
                        name="address"
                        type="text"
                        placeholder="Enter your address"
                        value={form.address}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </>
                )}

                {userType === "organization" && (
                  <>
                    <div className="form-group">
                      <label htmlFor="organizationName">Organization Name</label>
                      <input
                        id="organizationName"
                        name="organizationName"
                        type="text"
                        placeholder="Enter your organization name"
                        value={form.organizationName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="registrationNumber">Registration Number</label>
                      <input
                        id="registrationNumber"
                        name="registrationNumber"
                        type="text"
                        placeholder="Enter your registration number"
                        value={form.registrationNumber}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="password">Password</label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Create a password"
                        value={form.password}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={form.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="city">City</label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        placeholder="Enter your city"
                        value={form.city}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="organizationAddress">Organization Address</label>
                      <input
                        id="organizationAddress"
                        name="organizationAddress"
                        type="text"
                        placeholder="Enter your organization address"
                        value={form.organizationAddress}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="ngoCertificate">Certificate Upload</label>
                      <input
                        id="ngoCertificate"
                        name="ngoCertificate"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileChange}
                        required
                      />
                      {form.ngoCertificateName && (
                        <p className="form-hint">Selected file: {form.ngoCertificateName}</p>
                      )}
                    </div>
                  </>
                )}

                {userType === "business" && (
                  <>
                    <div className="form-group">
                      <label htmlFor="businessName">Business Name</label>
                      <input
                        id="businessName"
                        name="businessName"
                        type="text"
                        placeholder="Enter your business name"
                        value={form.businessName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="businessType">Business Type</label>
                      <input
                        id="businessType"
                        name="businessType"
                        type="text"
                        placeholder="Restaurant, Hotel, Catering, etc."
                        value={form.businessType}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="ownerName">Owner Name</label>
                      <input
                        id="ownerName"
                        name="ownerName"
                        type="text"
                        placeholder="Enter the owner's name"
                        value={form.ownerName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="password">Password</label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Create a password"
                        value={form.password}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={form.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="city">City</label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        placeholder="Enter your city"
                        value={form.city}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="gstNumber">GST Number</label>
                      <input
                        id="gstNumber"
                        name="gstNumber"
                        type="text"
                        placeholder="Enter your GST number"
                        value={form.gstNumber}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="businessAddress">Business Address</label>
                      <input
                        id="businessAddress"
                        name="businessAddress"
                        type="text"
                        placeholder="Enter your business address"
                        value={form.businessAddress}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </>
                )}
              </div>

              <button type="submit" className="register-button" disabled={loading}>
                {loading ? "Registering..." : userTypeButtonLabels[userType]}
              </button>
            </form>

            <div className="register-footer">
              <p>
                Already have an account?{" "}
                <Link href="/donor/login">Login here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
