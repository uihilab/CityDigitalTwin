import React from "react";

export function BusRouteMenu({ selectedRoutes, handleRouteChange, routesData }) {
  // Handler for individual checkbox changes
  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    let updatedSelectedRoutes = [...selectedRoutes];

    if (checked) {
      updatedSelectedRoutes.push(value);
    } else {
      updatedSelectedRoutes = updatedSelectedRoutes.filter((id) => id !== value);
    }

    handleRouteChange(updatedSelectedRoutes);
  };

  // Handler for "Select All" button
  const handleSelectAll = () => {
    const allRouteIds = routesData.map((route) => route.route_id);
    handleRouteChange(allRouteIds);
  };

  // Handler for "Select None" button
  const handleSelectNone = () => {
    handleRouteChange([]);
  };

  // If routesData is empty, display a loading indicator or message
  if (!routesData || routesData.length === 0) {
    return (
      <div
        id="busRouteSelector"
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
        <p>Loading routes...</p>
      </div>
    );
  }

  return (
    <div
      id="busRouteSelector"
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
        maxHeight: "400px",
        overflowY: "auto",
      }}
    >
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
          Waterloo Bus Routes
        </h4>

        {/* Select All / Select None Buttons */}
        <div style={{ marginBottom: "10px" }}>
          <button
            onClick={handleSelectAll}
            style={{ marginRight: "10px" }}
            disabled={routesData.length === 0}
          >
            Select All
          </button>
          <button onClick={handleSelectNone} disabled={routesData.length === 0}>
            Select None
          </button>
        </div>

        <div style={{ fontSize: "13px", width: "100%" }}>
          {routesData.map((route) => (
            <div
              key={route.route_id}
              style={{
                marginBottom: "5px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <label style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  value={route.route_id}
                  checked={selectedRoutes.includes(route.route_id)}
                  onChange={handleCheckboxChange}
                />
                 {/* Color Box */}
            <span
              style={{
                display: "inline-block",
                width: "20px",
                height: "10px",
                backgroundColor: route.color || "#000000",
                marginLeft: "5px",
                marginRight: "5px",
              }}
            ></span>
            {/* Route Name */}
            <span style={{ color: "black" }}>{route.route_name}</span>
          </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
