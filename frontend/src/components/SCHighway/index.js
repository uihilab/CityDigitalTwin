import React, { useEffect, useState } from "react";
import { GeoJsonLayer } from "@deck.gl/layers";

const highwayDataPath = `${process.env.PUBLIC_URL}/data/roads/roads_waterloo.geojson`;
const layerPrefix = "highway";

async function loadFilteredGeoJsonData(dataPath, propertyName) {
  const jsonData = await fetch(dataPath);
  const data = await jsonData.json();
  const filteredData = data.features.filter(
    (feature) => feature.properties.highway === propertyName
  );
  return filteredData;
}

function CreateColourfulGeoJsonLayer(id, data, color, lineWidthMinPixels, lineWidthMaxPixels) {
  const layer = new GeoJsonLayer({
    id,
    data,
    getLineColor: color,
    lineWidthMinPixels,
    lineWidthMaxPixels,
  });
  return layer;
}

function HighwayCheckboxComponent({ setMapLayers, removeLayer }) {
  const [checkboxState, setCheckboxState] = useState({
    primary: true,
    secondary: true,
    residential: true,
    service: true,
    motorway: true,
    cycleway: true,
  });

  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [selectAllChecked, setSelectAllChecked] = useState(true);

  useEffect(() => {
    // Load all roads by default
    const loadAllRoads = async () => {
      const highwayTypes = Object.keys(checkboxState);
      for (let type of highwayTypes) {
        if (checkboxState[type]) {
          const data = await loadFilteredGeoJsonData(highwayDataPath, type);
          const color = getColorForHighwayType(type);
          const { lineWidthMinPixels, lineWidthMaxPixels } = getLineWidthForHighwayType(type);
          const layer = CreateColourfulGeoJsonLayer(`${layerPrefix}_${type}`, data, color, lineWidthMinPixels, lineWidthMaxPixels);
          setMapLayers(layer);
        }
      }
    };

    loadAllRoads();
  }, []);

  const getColorForHighwayType = (type) => {
    switch (type) {
      case "primary":
        return [252, 186, 3]; // Similar to Google Maps primary road color
      case "secondary":
        return [255, 217, 102]; // Similar to Google Maps secondary road color
      case "residential":
        return [240, 240, 240]; // Similar to Google Maps residential road color
      case "service":
        return [240, 240, 240]; // Similar to Google Maps service road color
      case "motorway":
        return [233, 150, 122]; // Similar to Google Maps motorway color
      case "cycleway":
        return [173, 216, 230]; // Similar to Google Maps cycleway color
      default:
        return [0, 0, 0];
    }
  };

  const getLineWidthForHighwayType = (type) => {
    switch (type) {
      case "primary":
        return { lineWidthMinPixels: 8, lineWidthMaxPixels: 12 };
      case "secondary":
        return { lineWidthMinPixels: 6, lineWidthMaxPixels: 10 };
      case "residential":
      case "service":
      case "motorway":
      case "cycleway":
        return { lineWidthMinPixels: 2, lineWidthMaxPixels: 4 };
      default:
        return { lineWidthMinPixels: 2, lineWidthMaxPixels: 4 };
    }
  };

  const handleCheckboxChange = async (event) => {
    const { value, checked } = event.target;
    const color = JSON.parse(event.target.getAttribute('data-color'));
    const { lineWidthMinPixels, lineWidthMaxPixels } = getLineWidthForHighwayType(value);
    setCheckboxState((prevState) => ({
      ...prevState,
      [value]: checked,
    }));
    const layerName = `${layerPrefix}_${value}`;

    if (checked) {
      const data = await loadFilteredGeoJsonData(highwayDataPath, value);
      const coloredLayer = CreateColourfulGeoJsonLayer(layerName, data, color, lineWidthMinPixels, lineWidthMaxPixels);
      setMapLayers(coloredLayer);
    } else {
      removeLayer(layerName);
    }
  };

  const handleSelectAllChange = async (event) => {
    const checked = event.target.checked;
    setSelectAllChecked(checked);

    const updatedState = Object.keys(checkboxState).reduce((acc, key) => {
      acc[key] = checked;
      return acc;
    }, {});
    setCheckboxState(updatedState);

    const highwayTypes = Object.keys(updatedState);
    if (checked) {
      for (let type of highwayTypes) {
        const data = await loadFilteredGeoJsonData(highwayDataPath, type);
        const color = getColorForHighwayType(type);
        const { lineWidthMinPixels, lineWidthMaxPixels } = getLineWidthForHighwayType(type);
        const layer = CreateColourfulGeoJsonLayer(`${layerPrefix}_${type}`, data, color, lineWidthMinPixels, lineWidthMaxPixels);
        setMapLayers(layer);
      }
    } else {
      for (let type of highwayTypes) {
        const layerName = `${layerPrefix}_${type}`;
        removeLayer(layerName);
      }
    }
  };

  if (!isMenuOpen) return null;

  return (
    <div style={{
      position: "fixed",
      right: "20px",
      top: "20px",
      width: "200px",
      height: "auto",
      backgroundColor: "white",
      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
      borderRadius: "10px",
      zIndex: 1000,
      padding: "10px",
      overflowY: "auto",
    }}>
      <button
        onClick={() => setIsMenuOpen(false)}
        style={{
          position: 'absolute',
          top: '4px',
          right: '10px',
          background: 'none',
          border: 'none',
          fontSize: '15px',
          cursor: 'pointer',
          color: '#333',
        }}
      >
        &times;
      </button>
      <h3
        style={{
          borderRadius: '4px',
          fontSize: '16px',
          backgroundColor: "#4A90E2",
          color: "white",
          padding: "5px",
          borderTopLeftRadius: "10px",
          borderTopRightRadius: "10px",
          fontWeight: "bold",
          textAlign: "center",
          margin: "30px 10px 0 10px",
        }}>
        Highway Layers
      </h3>
      <div style={{ padding: "10px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>
            <input
              type="checkbox"
              checked={selectAllChecked}
              onChange={handleSelectAllChange}
            />
            <span style={{ marginLeft: "8px" }}>Select All/None</span>
          </label>
        </div>
        {Object.keys(checkboxState).map((type) => (
          <label key={type} style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>
            <span style={{
              display: "inline-block",
              width: "15px",
              height: "15px",
              backgroundColor: `rgb(${getColorForHighwayType(type).join(",")})`,
              marginRight: "10px",
              borderRadius: "3px",
            }}></span>
            <input
              type="checkbox"
              name={type}
              value={type}
              checked={checkboxState[type]}
              onChange={handleCheckboxChange}
              data-color={JSON.stringify(getColorForHighwayType(type))}
            />
            <span style={{ marginLeft: "8px" }}>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default HighwayCheckboxComponent;
