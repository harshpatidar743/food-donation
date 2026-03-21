"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./login.module.css";
import { persistAuthUser, type UserRole } from "../../lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type LoginResponse = {
  donorId?: string;
  name?: string;
  role?: UserRole;
  token?: string;
  message?: string;
  error?: string;
};

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data: LoginResponse = await res.json();

      if (res.ok && data.donorId) {
        const role = data.role || "individual";

        persistAuthUser({
          donorId: data.donorId,
          name: data.name,
          role,
          token: data.token
        });

        router.push(role === "admin" ? "/dashboard/messages" : "/donor/dashboard");
      } else {
        setError(data.error || data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginHeader}>
          <h1>Donor Login</h1>
          <p>Welcome back! Please login to continue.</p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form className={styles.loginForm} onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.loginButton} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className={styles.loginFooter}>
          <p>
            Don't have an account?{" "}
            <Link href="/donor/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

