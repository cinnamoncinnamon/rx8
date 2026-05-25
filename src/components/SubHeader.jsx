import React from "react";
import { gradient } from "../constants";

export default function SubHeader({ title, onBack }) {
  return (
    <div style={{ background: gradient, padding: "0 0 0" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", gap: 10 }}>
        <button
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,.2)",
            border: "none",
            color: "#fff",
            fontSize: 20,
            cursor: "pointer",
            borderRadius: 8,
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ‹
        </button>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 16, flex: 1, textAlign: "center" }}>
          {title}
        </span>
        <div style={{ width: 34 }} />
      </div>
    </div>
  );
}