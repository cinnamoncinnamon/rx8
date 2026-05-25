import React from "react";
import { NUM_COLORS } from "../constants";

export default function Ball({ number, size = 44, selected = false, onClick }) {
  const colors = NUM_COLORS[number];
  const dual = colors.length === 2;
  const isGreen = colors.includes("green");
  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        position: "relative",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        flexShrink: 0,
        border: selected ? "3px solid #FF6B35" : "none",
        boxShadow: selected ? "0 0 12px #FF6B3599" : "0 2px 8px #0004",
        transform: selected ? "scale(1.1)" : "scale(1)",
        transition: "transform .15s",
      }}
    >
      {dual ? (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: isGreen ? "#22C55E" : "#EF4444",
              clipPath: "polygon(0 0,50% 0,50% 100%,0 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#7C3AED",
              clipPath: "polygon(50% 0,100% 0,100% 100%,50% 100%)",
            }}
          />
        </>
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: isGreen ? "#22C55E" : "#EF4444",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "15%",
          right: "15%",
          bottom: "15%",
          borderRadius: "50%",
          background: "rgba(255,255,255,.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: size * 0.38,
            fontWeight: 800,
            color: isGreen ? "#22C55E" : "#EF4444",
          }}
        >
          {number}
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "15%",
          width: "35%",
          height: "25%",
          borderRadius: "50%",
          background: "rgba(255,255,255,.4)",
        }}
      />
    </div>
  );
}