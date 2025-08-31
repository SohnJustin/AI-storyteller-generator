// app/book-cover/page.tsx
"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion"; // If you choose to use Framer Motion

const BookCover = ({ title }: { title: string }) => {
  return (
    <div style={styles.container}>
      {/* Book Cover */}
      <motion.div style={styles.bookCover}>
        <h2 style={styles.title}>{title}</h2>
      </motion.div>

      {/* Option Buttons */}
      <div style={styles.buttonContainer}>
        {/* STORY_ID should be programmatically replaced in client code after a story is generated */}
        {/* TODO: Replace STORY_ID with the actual ID returned from generate-story */}
        <Link href="/book/STORY_ID?mode=readAlong" prefetch>
          <button style={styles.button}>Have it read to me</button>
        </Link>
        <Link href="/book/STORY_ID?mode=readMyself" prefetch>
          <button style={styles.button}>Read it myself</button>
        </Link>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#000",
  },
  bookCover: {
    width: "300px",
    height: "400px",
    background: "linear-gradient(145deg, #b58840 0%, #7a5933 100%)",
    border: "6px ridge #5a3e1b",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 15px rgba(0, 0, 0, 0.6)",
  },
  title: {
    color: "#f4e1b0",
    fontFamily: "'Georgia', serif",
    fontSize: "2.5rem",
    textAlign: "center",
    textShadow: "1px 1px 2px #3c2f1a",
    margin: 0,
  },
  buttonContainer: {
    marginTop: "20px",
    display: "flex",
    gap: "10px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "white",
    color: "black",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

const Page = () => <BookCover title="Your Story" />;
export default Page;
