// This is the login page component. It contains a simple form with email and password fields.
// When the form is submitted, it logs the email and password to the console and redirects to the home page.
//
// The form is controlled by two state variables, email and password, which are updated as the user types in the input fields.
// The handleSubmit function is called when the form is submitted, preventing the default form submission behavior and logging the email and password to the console.
// Finally, the router.push("/") function is called to redirect the user to the home page.
//
// The form is styled using inline styles for simplicity, but you can customize the styles as needed.
// You can also add validation logic to the form fields to ensure that the user enters valid data.
//
// To use this component, you can import it into your app and render it as needed.
// For example, you can create a login page that includes this component and any other content you want to display.
// You can also add additional logic to handle the login process, such as calling an API to authenticate the user.

"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavBar from "../components/Navbar";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally call your login API
    console.log(`Logging in with Email: ${email}, Password: ${password}`);
    // On successful login, redirect to the home page (or profile page)
    router.push("/");
  };

  return (
    <div
      className="login-page"
      style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}
    >
      <h1>This is Login Page</h1>
      <form onSubmit={handleSubmit}>
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
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
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
        </div>
        <button type="submit" style={{ padding: "0.75rem 1.5rem" }}>
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
