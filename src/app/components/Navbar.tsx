"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

const Navbar = () => {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return (
    <nav className="flex items-center justify-between p-4 bg-blue-300">
      <div className="navbar-left">
        <Link href="/">
          <span className="text-white text-2xl font-bold no-underline">
            AI Storyteller Generator
          </span>
        </Link>
      </div>
      <div className="flex gap-4">
        {isLoggedIn ? (
          <>
            <Link href="/profile" className="text-white no-underline">
              Profile
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-white no-underline cursor-pointer"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-white no-underline">
              Login
            </Link>
            <Link href="/signup" className="text-white no-underline">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
