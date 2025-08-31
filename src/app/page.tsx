// src/app/page.tsx
"use client";

import React from "react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div>
      <div className="relative h-screen overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 object-cover w-full h-full blur"
        >
          <source src="coffeeShopBackground.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Overlay for better text contrast */}
        <div className="absolute inset-0 bg-black opacity-70">
          {/* Hero Section */}
          <section className="flex flex-col items-center justify-center h-screen bg-cover bg-center text-center text-white p-8">
            <h1 className="text-3xl mb-4">Welcome to AI Storyteller</h1>
            <p className="text-xl max-w-[600px] mb-8">
              Craft your own adventure with our AI-powered story generator.
              Unleash your creativity and let ancient tales and modern
              technology combine to bring your stories to life.
            </p>
            <Link href="/generate-story">
              <button className=" transition delay-50 duration-300 ease-in-out py-4 px-8 text-xl bg-yellow-800 text-white rounded cursor-pointer hover:bg-yellow-700">
                Start Creating Your Story
              </button>
            </Link>
          </section>
        </div>
      </div>

      {/* About Section */}
      <div>
        <section
          className=" py-16 px-8 relative h-screen overflow-hidden bg-cover bg-center text-center text-white"
          style={{ backgroundImage: "url('backgroundimg.jpg')" }}
        >
          <h2 className="text-4xl mb-4">About the Project</h2>
          <p className="text-lg max-w-[800px] mx-auto">
            AI Storyteller is designed to transform your ideas into captivating
            narratives. Our platform leverages advanced AI algorithms to
            generate unique stories based on your input. Whether you're looking
            for a quick tale to brighten your day or a detailed adventure, our
            system creates it for you—blending timeless narrative traditions
            with modern innovation.
          </p>
        </section>
      </div>
      {/* Feedback Section */}
      <div>
        <section
          className=" py-16 px-8 relative h-screen overflow-hidden bg-cover bg-center text-center text-white"
          style={{ backgroundImage: "url('backgroundGif.gif')" }}
        >
          <h2 className="text-4xl mb-4">Drop some feedback</h2>
          <p className="text-lg max-w-[800px] mx-auto">
            We would love to hear your thoughts about the project. Your feedback
            is invaluable in helping us improve and enhance your experience.
            Whether you have suggestions, comments, or just want to share your
            thoughts, please feel free to reach out to us!
          </p>
        </section>
      </div>
    </div>
  );
}
