"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  // State for form fields
  const [fName, setfName] = useState("");
  const [lName, setlName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // Placeholder for future verification code logic
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");

  // State to control visibility of passwords
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Send the form data as JSON
        body: JSON.stringify({ email, password, fName, lName }),
      });

      if (res.ok) {
        // Redirect to the login page or another page upon success
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.error || "Sign up failed");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h1>This is Sign Up Page</h1>
      <form onSubmit={handleSignUp}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="fName">First Name:</label>
          <input
            type="fName"
            id="fName"
            value={fName}
            onChange={(e) => setfName(e.target.value)}
            placeholder="Enter your First Name"
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              marginTop: "0.5rem",
              color: "black",
            }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="lName">Last Name:</label>
          <input
            type="lName"
            id="lName"
            value={lName}
            onChange={(e) => setlName(e.target.value)}
            placeholder="Enter your Last Name"
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              marginTop: "0.5rem",
              color: "black",
            }}
          />
        </div>
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
