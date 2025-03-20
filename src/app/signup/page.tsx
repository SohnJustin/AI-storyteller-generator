"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  // State for form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // Placeholder for future verification code logic
  const [verificationCode, setVerificationCode] = useState("");

  // State to control visibility of passwords
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    // Here you would normally call your API for sign-up
    console.log("Signing up with:", email, password);
    // After successful sign-up, redirect to login (or directly log in)
    router.push("/login");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h1>This is Sign Up Page</h1>
      <form onSubmit={handleSignUp}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              marginTop: "0.5rem",
              color: "black",
            }}
          />
        </div>

        {/* Password Field with Show/Hide Toggle */}
        <div style={{ marginBottom: "1rem", position: "relative" }}>
          <label htmlFor="password">Password:</label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              marginTop: "0.5rem",
              color: "black",
            }}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "10px",
              top: "35px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "black",
            }}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Confirm Password Field with Show/Hide Toggle */}
        <div style={{ marginBottom: "1rem", position: "relative" }}>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              marginTop: "0.5rem",
              color: "black",
            }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{
              position: "absolute",
              right: "10px",
              top: "35px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "black",
            }}
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Verification Code Field (Placeholder) */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="verificationCode">Verification Code (Future):</label>
          <input
            type="text"
            id="verificationCode"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="(User will receive an email for this)"
            disabled // Placeholder for future verification code logic
            style={{
              width: "100%",
              padding: "0.5rem",
              marginTop: "0.5rem",
            }}
          />
        </div>

        <button type="submit" style={{ padding: "0.75rem 1.5rem" }}>
          Sign Up
        </button>
      </form>
    </div>
  );
}
