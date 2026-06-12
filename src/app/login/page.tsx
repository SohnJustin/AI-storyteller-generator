"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    // Success — refresh session state and go home.
    router.push("/");
    router.refresh();
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center p-4"
      style={{ backgroundImage: "url('/backgroundimg.jpg')" }}
    >
      {/* Dark overlay for contrast, matching the landing page */}
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative w-full max-w-md rounded-lg border border-yellow-800/60 bg-black/60 p-8 text-white shadow-xl backdrop-blur-sm">
        <h1 className="mb-2 text-center text-3xl">Welcome Back</h1>
        <p className="mb-6 text-center text-sm text-gray-300">
          Sign in to continue your story.
        </p>

        {error && (
          <p className="mb-4 rounded bg-red-900/40 px-3 py-2 text-center text-sm text-red-300">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full rounded border border-gray-300 bg-white/95 p-3 text-black outline-none focus:border-yellow-700 focus:ring-1 focus:ring-yellow-700"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full rounded border border-gray-300 bg-white/95 p-3 text-black outline-none focus:border-yellow-700 focus:ring-1 focus:ring-yellow-700"
            />
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer rounded bg-yellow-800 py-3 text-lg text-white transition duration-300 ease-in-out hover:bg-yellow-700"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-300">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-yellow-500 hover:text-yellow-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
