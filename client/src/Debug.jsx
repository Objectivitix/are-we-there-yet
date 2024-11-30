import { useState } from "react";

export default function Debug() {
  const [placeId, setPlaceId] = useState("");

  const handleDebug = () => {
    if (!placeId) {
      alert("Please enter a Place ID.");
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${placeId}`;
    window.open(url, "_blank");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <label
        htmlFor="placeId"
        style={{ display: "block", marginBottom: "8px" }}
      >
        Enter Place ID:
      </label>
      <input
        type="text"
        id="placeId"
        value={placeId}
        onChange={(e) => setPlaceId(e.target.value)}
        style={{ padding: "8px", marginRight: "10px", width: "300px" }}
      />
      <button
        onClick={handleDebug}
        style={{
          padding: "8px 12px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Debug
      </button>
    </div>
  );
}
