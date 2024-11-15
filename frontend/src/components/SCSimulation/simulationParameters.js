import React from "react";

export function SimulationParameters({
  selectedRouteNumber,
  handleRouteNumberChange,
}) {
  const levels = {
    50: "Low",
    300: "Moderate",
    600: "High",
    1000: "Very High",
  };

  const handleSliderChange = (event) => {
    handleRouteNumberChange(Number(event.target.value));
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "230px",
        right: "10px",
        zIndex: 998,
        backgroundColor: "white",
        padding: "10px",
        borderRadius: "8px",
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
        width: "300px",
      }}
    >
      <h4
        style={{
          backgroundColor: "#4A90E2",
          color: "white",
          padding: "5px",
          borderRadius: "4px",
          fontSize: "15px",
        }}
      >
        Simulation Parameters
      </h4>
      
      <div style={{ marginTop: "10px" }}>
        <label style={{ fontSize: "14px", display: "block", marginBottom: "5px" }}>
          Traffic Level:
        </label>
        <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
          {Object.entries(levels).map(([value, label]) => (
            <label
              key={value}
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              <input
                type="radio"
                name="routeNumber"
                value={value}
                checked={selectedRouteNumber === Number(value)}
                onChange={handleSliderChange}
                style={{ marginRight: "8px" }}
              />
              {label} ({value} routes)
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}