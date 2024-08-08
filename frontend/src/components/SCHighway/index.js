import React, { useState } from "react";
import { GeoJsonLayer } from "@deck.gl/layers";

const highwayDataPath = `${process.env.PUBLIC_URL}/data/highway_waterloo.geojson`;
const layerPrefix = "highway";
// Verilen bir anahtar ve veri yolundaki GeoJSON verilerini yükler ve belirli bir özelliğe göre filtreler
async function loadFilteredGeoJsonData(dataPath, propertyName) {
  const jsonData = await fetch(dataPath);
  const data = await jsonData.json();
  const filteredData = data.features.filter(
    (feature) => feature.properties.highway === propertyName
  );
  return filteredData;
}

function CreateColourfulGeoJsonLayer(id, data, color) {
  const layer = new GeoJsonLayer({
    id,
    data,
    getLineColor: color, // Çizgi rengini belirle
    lineWidthMinPixels: 2, // Opsiyonel: çizgi kalınlığını belirle
    lineWidthMaxPixels: 5, // Opsiyonel: çizgi kalınlığını belirle
  });
  return layer;
}

function HighwayCheckboxComponent({ setMapLayers, removeLayer }) {
  const [checkboxState, setCheckboxState] = useState({
    primary: false,
    secondary: false,
    residential: false,
    service: false,
    motorway: false,
    cycleway: false,
  });

  const handleCheckboxChange = async (event) => {
    const { value, checked } = event.target;
    const color = JSON.parse(event.target.getAttribute('data-color'));
    setCheckboxState((prevState) => ({
      ...prevState,
      [value]: checked,
    }));
    const layerName = `${layerPrefix}_${value}`;
    if (checked) {
      const data = await loadFilteredGeoJsonData(highwayDataPath, value);
      const coloredLayer = CreateColourfulGeoJsonLayer(layerName, data, color);
      setMapLayers(coloredLayer); // Load data for the checked checkbox
    } else {
      removeLayer(layerName); // Remove data for the unchecked checkbox
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        padding: "10px",
        boxSizing: "border-box",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        zIndex: 999,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        borderRadius: "5px",
      }}
    >
      <label style={{ marginRight: "10px" }}>
        <input
          type="checkbox"
          name="primary"
          value="primary"
          checked={checkboxState.primary}
          onChange={handleCheckboxChange}
          data-color="[255, 0, 0]"
        />
        Primary
      </label>
      <br />
      <label style={{ marginRight: "10px" }}>
        <input
          type="checkbox"
          name="secondary"
          value="secondary"
          checked={checkboxState.secondary}
          onChange={handleCheckboxChange}
          data-color="[0, 0, 255]"
        />
        Secondary
      </label>
      <br />
      <label style={{ marginRight: "10px" }}>
        <input
          type="checkbox"
          name="residential"
          value="residential"
          checked={checkboxState.residential}
          onChange={handleCheckboxChange}
          data-color="[95, 95, 95]"
        />
        Residential
      </label>
      <br />
      <label style={{ marginRight: "10px" }}>
        <input
          type="checkbox"
          name="service"
          value="service"
          checked={checkboxState.service}
          onChange={handleCheckboxChange}
          data-color="[190, 190, 190]"
        />
        Service
      </label>
      <br />
      <label style={{ marginRight: "10px" }}>
        <input
          type="checkbox"
          name="motorway"
          value="motorway"
          checked={checkboxState.motorway}
          onChange={handleCheckboxChange}
          data-color="[80, 80, 80]"
        />
        Motorway
      </label>
      <br />
      <label style={{ marginRight: "10px" }}>
        <input
          type="checkbox"
          name="cycleway"
          value="cycleway"
          checked={checkboxState.cycleway}
          onChange={handleCheckboxChange}
          data-color="[255, 0, 0]"
        />
        Cycleway
      </label>
    </div>
  );
}

export default HighwayCheckboxComponent;
