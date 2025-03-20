/* src/app/components/Navbar.tsx
NavBar will have:

1.  Logo - on the left side of the navbar. When clicked, it should take you back to the home page.
2.  Menu button - on the right side of the navbar. When clicked, it should open a dropdown menu with 
links to the login and signup pages.

Depending on whether they're logged in or not will determine what else will be shown within the navbar 
(e.g. profile, logout, etc).


3/20/25
Further iterations will include other things but for now this is all that I'll include.

*/
"use client";

import React, { useState } from "react";
import Link from "next/link";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1>This is NavBar</h1>
        <Link href="/">AI Storyteller (Home Page)</Link>
      </div>
      <div className="navbar-right">
        <button onClick={() => setMenuOpen(!menuOpen)}>Menu</button>
        {menuOpen && (
          <div className="menu">
            <Link href="/login">Login</Link>
            <Link href="/signup">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
