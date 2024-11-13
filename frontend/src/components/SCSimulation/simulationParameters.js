import React from "react";

export function SimulationParameters({
  selectedRouteNumber,
  handleRouteNumberChange,
}) {
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
        <label 
          htmlFor="routeNumberSlider" 
          style={{ fontSize: "14px", display: "block", marginBottom: "5px" }}
        >
          Number of Routes: {selectedRouteNumber}
        </label>
        <input
          type="range"
          id="routeNumberSlider"
          min="1"
          max="1000"
          value={selectedRouteNumber}
          onChange={handleSliderChange}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
} 