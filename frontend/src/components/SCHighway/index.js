import React, { useState } from "react";
import { GeoJsonLayer } from "@deck.gl/layers";

const highwayDataPath = `${process.env.PUBLIC_URL}/data/roads/roads_waterloo.geojson`;
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

  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const handleCheckboxChange = async (event) => {
    const { value, checked } = event.target;
    const color = JSON.parse(event.target.getAttribute('data-color'));
    setCheckboxState((prevState) => ({
      ...prevState,
      [value]: checked,
    }));
    const layerName = `${layerPrefix}_${value}`;
    let lineWidth = 1;
    switch (value) {
      case "primary":
        lineWidth = 5; // En önemli yol, en kalın çizgi
        break;
      case "secondary":
        lineWidth = 3; // İkinci en önemli yol
        break;
      case "residential":
        lineWidth = 2; // Konut yolları
        break;
      case "service":
        lineWidth = 1.5; // Hizmet yolları
        break;
      case "motorway":
        lineWidth = 4; // Otoyollar (biraz daha önemli)
        break;
      case "cycleway":
        lineWidth = 1; // Bisiklet yolları, en ince çizgi
        break;
      default:
        lineWidth = 1; // Varsayılan ince çizgi
    }


    if (checked) {
      const data = await loadFilteredGeoJsonData(highwayDataPath, value);
      const coloredLayer = CreateColourfulGeoJsonLayer(layerName, data, color);
      setMapLayers(coloredLayer); // Load data for the checked checkbox
    } else {
      removeLayer(layerName); // Remove data for the unchecked checkbox
    }
  };
  if (!isMenuOpen) return null; // Menü kapalıysa render edilmez
  return (
    <div
      style={{
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
      }}
    >
      {/* Kapatma Butonu */}
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
          backgroundColor: "#4A90E2",  // Mavi başlık rengi
          color: "white",
          padding: "5px",  // Başlığa padding eklendi
          borderTopLeftRadius: "10px",
          borderTopRightRadius: "10px",
          fontSize: "16px",  // Büyük yazı boyutu
          fontWeight: "bold",  // Kalın yazı
          textAlign: "center",  // Yazı ortalanacak
          margin: "30px 10px 0 10px",  // Üstten ve yanlardan boşluk eklendi
        }}
      >
        Highway Layers
      </h3>
      <div style={{ padding: "10px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontSize: "14px"}}>
          <input
            type="checkbox"
            name="primary"
            value="primary"
            checked={checkboxState.primary}
            onChange={handleCheckboxChange}
            data-color="[255, 0, 0]"
          />
          <span style={{ marginLeft: "8px" }}>Primary</span>
        </label>

        <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>
          <input
            type="checkbox"
            name="secondary"
            value="secondary"
            checked={checkboxState.secondary}
            onChange={handleCheckboxChange}
            data-color="[0, 0, 255]"
          />
          <span style={{ marginLeft: "8px" }}>Secondary</span>
        </label>

        <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>
          <input
            type="checkbox"
            name="residential"
            value="residential"
            checked={checkboxState.residential}
            onChange={handleCheckboxChange}
            data-color="[95, 95, 95]"
          />
           <span style={{ marginLeft: "8px" }}>Residential</span>
        </label>

        <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>
          <input
            type="checkbox"
            name="service"
            value="service"
            checked={checkboxState.service}
            onChange={handleCheckboxChange}
            data-color="[190, 190, 190]"
          />
          <span style={{ marginLeft: "8px" }}>Service</span>
        </label>

        <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>
          <input
            type="checkbox"
            name="motorway"
            value="motorway"
            checked={checkboxState.motorway}
            onChange={handleCheckboxChange}
            data-color="[80, 80, 80]"
          />
          <span style={{ marginLeft: "8px" }}>Motorway</span>
        </label>

        <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>
          <input
            type="checkbox"
            name="cycleway"
            value="cycleway"
            checked={checkboxState.cycleway}
            onChange={handleCheckboxChange}
            data-color="[255, 0, 0]"
          />
          <span style={{ marginLeft: "8px" }}>Cycleway</span>
        </label>
      </div>
    </div>
  );
}

export default HighwayCheckboxComponent;
