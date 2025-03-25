/* src/app/components/Navbar.tsx
NavBar will have:

1.  Logo - on the left side of the navbar. When clicked, it should take you back to the home page.
2.  Menu button - on the right side of the navbar. When clicked, it should open a dropdown menu with 
links to the login and signup pages.

Depending on whether they're logged in or not will determine what else will be shown within the navbar 
(e.g. profile, logout, etc).


3/20/25
Further iterations will include other things but for now this is all that I'll include.

*/ "use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isLoggedIn } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);

  // Set hasMounted to true once the component is mounted on the client.
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // While not mounted, return null (or a placeholder) so that the server and client match.
  if (!hasMounted) {
    return null;
  }

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem",
        backgroundColor: "lightblue",
      }}
    >
      <div className="navbar-left">
        <Link
          href="/"
          style={{
            color: "white",
            fontSize: "1.5rem",
            fontWeight: "bold",
            textDecoration: "none",
          }}
        >
          AI Storyteller Generator
        </Link>
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        {isLoggedIn ? (
          <>
            <Link
              href="/profile"
              style={{ color: "white", textDecoration: "none" }}
            >
              Profile
            </Link>
            <Link
              href="/logout"
              style={{ color: "white", textDecoration: "none" }}
            >
              Logout
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/login"
              style={{ color: "white", textDecoration: "none" }}
            >
              Login
            </Link>
            <Link
              href="/signup"
              style={{ color: "white", textDecoration: "none" }}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
