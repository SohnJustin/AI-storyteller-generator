"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "../components/Loading";

const StoryGenerator = () => {
  const [genre, setGenre] = useState("");
  const [length, setLength] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Declare router at the top level
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ length, prompt: content, genre }),
      });

      if (!res.ok) {
        setError("Error generating story");
        setLoading(false);
        return;
      }

      const data = await res.json();
      // Redirect to the book-cover page with the generated title and story passed as query parameters.
      if (data.id) {
        router.push(`/book/${data.id}?mode=readAlong`);
      } else {
        // fallback if DB insert failed
        sessionStorage.setItem("currentStory", data.story ?? "");
        sessionStorage.setItem("currentTitle", data.title ?? "Your Story");
        router.push(`/book?mode=readAlong`);
      }
    } catch (err) {
      setError("Error generating story");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        boxSizing: "border-box",
        backgroundColor: "black", // Page background
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
          backgroundColor: "black", // Form background
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid white",
          color: "white", // Text color for labels
        }}
      >
        <div style={{ marginBottom: "15px", width: "100%" }}>
          <label
            htmlFor="storyGenre"
            style={{ display: "block", marginBottom: "5px", color: "white" }}
          >
            Story Genre:
          </label>
          <select
            id="storyGenre"
            name="storyGenre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: "white", // White input background
              color: "black", // Black text inside input
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            <option value="">Select Genre</option>
            <option value="fantasy">Fantasy</option>
            <option value="sci-fi">Sci-Fi</option>
            <option value="mystery">Mystery</option>
            <option value="romance">Romance</option>
            <option value="horror">Horror</option>
            <option value="adventure">Adventure</option>
            <option value="historical">Historical</option>
            <option value="action">Action</option>
            <option value="thriller">Thriller</option>
            <option value="non-fiction">Non-Fiction</option>
            <option value="children">Children's</option>
          </select>
        </div>

        <div style={{ marginBottom: "15px", width: "100%" }}>
          <label
            htmlFor="storyLength"
            style={{ display: "block", marginBottom: "5px", color: "white" }}
          >
            Story Length:
          </label>
          <select
            id="storyLength"
            name="storyLength"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: "white", // White input background
              color: "black", // Black text inside input
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            <option value="">Select Length</option>
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </div>

        <div style={{ marginBottom: "15px", width: "100%" }}>
          <label
            htmlFor="storyContent"
            style={{ display: "block", marginBottom: "5px", color: "white" }}
          >
            Story Content:
          </label>
          <textarea
            id="storyContent"
            name="storyContent"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              minHeight: "100px",
              backgroundColor: "white", // White input background
              color: "black", // Black text inside input
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          ></textarea>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: "white",
              color: "black",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Generate Story
          </button>
        </div>
      </form>

      {loading && <Loading />}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default StoryGenerator;
