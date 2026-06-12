"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

  const inputClasses =
    "w-full rounded border border-gray-300 bg-white/95 p-3 text-black outline-none focus:border-yellow-700 focus:ring-1 focus:ring-yellow-700";

  return (
    <div
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center p-4"
      style={{ backgroundImage: "url('/backgroundimg.jpg')" }}
    >
      {/* Dark overlay for contrast, matching the landing page */}
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative my-8 w-full max-w-md rounded-lg border border-yellow-800/60 bg-black/60 p-8 text-white shadow-xl backdrop-blur-sm">
        <h1 className="mb-2 text-center text-3xl">Create Your Account</h1>
        <p className="mb-6 text-center text-sm text-gray-300">
          Begin crafting your own adventures.
        </p>

        {error && (
          <p className="mb-4 rounded bg-red-900/40 px-3 py-2 text-center text-sm text-red-300">
            {error}
          </p>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="fName" className="mb-1 block text-sm">
              First Name
            </label>
            <input
              type="text"
              id="fName"
              value={fName}
              onChange={(e) => setfName(e.target.value)}
              placeholder="Enter your first name"
              required
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="lName" className="mb-1 block text-sm">
              Last Name
            </label>
            <input
              type="text"
              id="lName"
              value={lName}
              onChange={(e) => setlName(e.target.value)}
              placeholder="Enter your last name"
              required
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className={inputClasses}
            />
          </div>

          {/* Password Field with Show/Hide Toggle */}
          <div className="relative">
            <label htmlFor="password" className="mb-1 block text-sm">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className={inputClasses}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 cursor-pointer text-sm text-gray-600 hover:text-black"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Confirm Password Field with Show/Hide Toggle */}
          <div className="relative">
            <label htmlFor="confirmPassword" className="mb-1 block text-sm">
              Confirm Password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className={inputClasses}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 cursor-pointer text-sm text-gray-600 hover:text-black"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Verification Code Field (Placeholder) */}
          <div>
            <label htmlFor="verificationCode" className="mb-1 block text-sm">
              Verification Code{" "}
              <span className="text-gray-400">(coming soon)</span>
            </label>
            <input
              type="text"
              id="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="(User will receive an email for this)"
              disabled
              className="w-full cursor-not-allowed rounded border border-gray-500 bg-white/40 p-3 text-black placeholder-gray-600"
            />
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer rounded bg-yellow-800 py-3 text-lg text-white transition duration-300 ease-in-out hover:bg-yellow-700"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-300">
          Already have an account?{" "}
          <Link href="/login" className="text-yellow-500 hover:text-yellow-400">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
