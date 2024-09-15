import React from "react";

export function FloodYearMenu({
  selectedFloodYear,
  handleFloodYearChange,
}) {
  const handleFloodYearSelectChange = (event) => {
    handleFloodYearChange(event.target.value);
  };

  return (
    (
      <div
        id="floodYearSelector"
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 1000,
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "8px",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
          width: "300px",
        }}
      >
       

        <div style={{ marginTop: "30px" }}>
          <h3
            style={{
              backgroundColor: "#4A90E2",
              color: "white",
              padding: "5px",
              borderRadius: "4px",
              fontSize: "16px",
            }}
          >
            WATERLOO
          </h3>
          <p style={{ fontSize: "14px", lineHeight: "1.5" }}>
            <strong>River:</strong> Cedar River
          </p>
          <p style={{ fontSize: "14px", lineHeight: "1.5" }}>
            <strong>Gauge ID:</strong> 05464000
          </p>
        </div>

        <div style={{ marginTop: "20px" }}>
          <h4
            style={{
              backgroundColor: "#8CC152",
              color: "white",
              padding: "5px",
              borderRadius: "4px",
              fontSize: "15px",
            }}
          >
            Flood Risk
          </h4>
          <select
            id="floodYearSelect"
            value={selectedFloodYear}
            onChange={handleFloodYearSelectChange}
            style={{ fontSize: "13px", width: "100%" }}
          >
            <option value="0">None</option>
            <option value="10">10yr</option>
            <option value="25">25yr</option>
            <option value="50">50yr</option>
            <option value="100">100yr</option>
            <option value="500">500yr</option>
          </select>
        </div>
      </div>
    )
  );
}
