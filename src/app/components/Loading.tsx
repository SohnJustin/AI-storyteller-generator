//src/app/components/Loading.tsx
import React from "react";

const Loading = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.8)",
        color: "white",
        zIndex: 1000,
      }}
    >
      <h1>Loading your story...</h1>
    </div>
  );
};
export default Loading;
