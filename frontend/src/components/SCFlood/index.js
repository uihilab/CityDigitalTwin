import React, { useState, useEffect } from "react";
import { GeoJsonLayer, IconLayer } from "@deck.gl/layers";
import formatObjectData from "../SC3DBuilding/formatObjectData";

export const floodMapIdMapping = {
  500: "1036053", // Örnek mapid
  100: "1036044",
  50: "1036040",
  25: "1036035",
};

const keyMappings = {
  ID: "ID",
  strDamage: "Structural Damage (%)",
  dollarDamage: "Structural Damage ($)",
  cntDamagePercentage: "Content Damage (%)",
  cntDamageDollar: "Content Damage ($)",
};

// Helper function to calculate the marker index based on damage percentages
function calculateMarkerIndex(stprct, cnprct) {
  const combinedPercentage = stprct + cnprct;
  // Divide by 50 and round to determine which marker to use (0-3)
  return Math.min(Math.round(combinedPercentage / 50), 3);
}

function getHazardColor(stprct, cnprct) {
  const markers = [];
  markers[0] = "yellow";
  markers[1] = "orange";
  markers[2] = "red";
  markers[3] = "purple";
  const index = calculateMarkerIndex(stprct, cnprct);
  return markers[index];
}

export async function getFloodLayer(id, floodYear) {
  try {
    const path = `${process.env.PUBLIC_URL}/data/flood/flood_${floodYear}yr.geojson`;
    //console.log(`Fetching flood data from: ${path}`); // Log the path to verify the file location

    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    //console.log(`Flood data loaded for year ${floodYear}:`, data); // Log the fetched data

    const layer = new GeoJsonLayer({
      id,
      data,
      pickable: false,
      stroked: true,
      filled: true,
      lineWidthMinPixels: 2,
      lineWidthMaxPixels: 5,
      getFillColor: [0, 100, 255, 100], // Light blue for water
      getLineColor: [0, 0, 0], // Black border
      getRadius: 100,
      getLineWidth: 1,
      getElevation: 30,
      collisionCheck: true,
    });
    //debugger;
    //console.log(`GeoJsonLayer created for flood year ${floodYear}`); // Log successful layer creation
    return layer;
  } catch (error) {
    console.error("Error fetching or processing GeoJSON data:", error);
    throw error;
  }
}

export function FloodMenu({
  isFloodLayerSelected,
  isMenuOpenFlood,
  setIsMenuOpenFlood,
  setMapLayers,
  removeLayer,
  openDetailsBox,
}) {
  const [isFloodDamageActive, setFloodDamageActive] = useState(true);
  const [currentFloodYear, setCurrentFloodYear] = useState("25");
  const [damageSummary, setDamageSummary] = useState(null);

  async function createFloodDamageIconLayer(mapid, openDetailsBox) {
    const url = `https://ifis.iowafloodcenter.org/ifis/app/inc/inc_get_hazusdata.php?mapid=${mapid}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const hazusDataArray = await response.json();

      // Calculate damage summary
      const damageSummary = {
        totalStructuralDamage: 0,
        totalContentDamage: 0,
        averageStructuralDamagePercentage: 0,
        averageContentDamagePercentage: 0,
        propertiesWithDamage: 0
      };

      hazusDataArray.forEach(item => {
        const strDamage = parseFloat(item[1]);
        const cntDamage = parseFloat(item[5]);
        const dollarStructuralDamage = parseFloat(item[2]);
        const dollarContentDamage = parseFloat(item[6]);

        // Count properties with any damage
        if (strDamage > 0 || cntDamage > 0) {
          damageSummary.propertiesWithDamage++;
        }

        // Accumulate damage percentages and dollar amounts
        damageSummary.totalStructuralDamage += dollarStructuralDamage;
        damageSummary.totalContentDamage += dollarContentDamage;
      });

      // Calculate averages
      damageSummary.averageStructuralDamagePercentage = 
        hazusDataArray.reduce((sum, item) => sum + parseFloat(item[1]), 0) / hazusDataArray.length;
      damageSummary.averageContentDamagePercentage = 
        hazusDataArray.reduce((sum, item) => sum + parseFloat(item[5]), 0) / hazusDataArray.length;

      // IconLayer için veri hazırlığı
      const iconLayerData = hazusDataArray.map((item) => {
        const dataItem = {
          ID: item[0],
          strDamage: item[1],
          dollarDamage: item[2],
          position: [item[3], item[4]],
          cntDamagePercentage: item[5],
          cntDamageDollar: item[6],
          tooltip_data: formatObjectData(
            {
              ID: item[0],
              strDamage: item[1],
              dollarDamage: item[2],
              cntDamagePercentage: item[5],
              cntDamageDollar: item[6],
            },
            keyMappings,
            "tooltip"
          ),
          details_data: formatObjectData(
            {
              ID: item[0],
              strDamage: item[1],
              dollarDamage: item[2],
              cntDamagePercentage: item[5],
              cntDamageDollar: item[6],
            },
            keyMappings,
            "details"
          ),
        };
        return dataItem;
      });

      // IconLayer oluştur
      const iconLayer = new IconLayer({
        id: "icon-layer-flood",
        data: iconLayerData,
        pickable: true,
        iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas(ifis).png`,
        iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map(ifis).json`,
        getIcon: (d) => getHazardColor(d.strDamage, d.cntDamagePercentage),
        sizeScale: 3,
        getPosition: (d) => d.position,
        getSize: (d) => 4,
        getColor: (d) => [255, 0, 0],
        getElevation: 50,
        getTooltip: ({ object }) => object && object.tooltip_data,
        onClick: (info, event) => {
          if (info.object) {
            openDetailsBox(info.object.details_data);
          }
        },
      });

      // Return both the layer and the damage summary
      return { 
        iconLayer, 
        damageSummary 
      };
    } catch (error) {
      console.error("Error fetching Hazus data:", error);
    }
  }

  async function handleFloodDamage(isActive, year = null) {
    let mapid = null;
    let selectedYear = year;
    if (selectedYear === null) {
      selectedYear = currentFloodYear;
    }
    if (floodMapIdMapping[selectedYear]) {
      mapid = floodMapIdMapping[selectedYear];
    } else {
      mapid = null;
    }
    removeLayer("icon-layer-flood");
    if (isActive && mapid) {
      const { iconLayer, damageSummary } = await createFloodDamageIconLayer(mapid, openDetailsBox);
      setMapLayers(iconLayer);
      // Store damage summary in state to display in the UI
      setDamageSummary(damageSummary);
    }
  }

  async function handleLayerSelectChangeFlood(event) {
    removeLayer("flood");
    removeLayer("icon-layer-flood");

    const selectedLayer = event.target.value;

    const layer = await getFloodLayer("flood", selectedLayer);
    setMapLayers(layer);
  }

  useEffect(() => {
    const loadFloodLayer = async () => {
      removeLayer("flood");
      removeLayer("icon-layer-flood");
      setDamageSummary(null);
      try {
        const layer = await getFloodLayer("flood", currentFloodYear);
        setMapLayers(layer);
        handleFloodDamage(isFloodDamageActive, currentFloodYear);
      } catch (error) {
        console.error("Error loading flood layer:", error);
      }
    };

    // Only load the layer if flood is selected and menu is open
    if (isFloodLayerSelected && isMenuOpenFlood) {
      loadFloodLayer();
    }
  }, [isFloodLayerSelected, isMenuOpenFlood, currentFloodYear]);

  const handleLayerSelectChange = async (event) => {
    setCurrentFloodYear(event.target.value);
    //handleLayerSelectChangeFlood(event);
    //handleFloodDamage(isFloodDamageActive, event.target.value);
  };

  return (
    isFloodLayerSelected &&
    isMenuOpenFlood && (
      <div
        id="layerSelector"
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
        <button
          onClick={() => {
            console.log("X button clicked");
            setIsMenuOpenFlood(false);
          }}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "none",
            border: "none",
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          &times;
        </button>

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
          <p style={{ fontSize: "14px", lineHeight: "1.5" }}>
            <strong>Flood Level:</strong> 13 ft
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
            id="layerSelect"
            defaultValue="25"
            onChange={handleLayerSelectChange}
            style={{ fontSize: "13px", width: "100%" }}
          >
            {/* <option value="2">2yr</option> */}
            <option value="10">10yr</option>
            <option value="25">25yr</option>
            <option value="50">50yr</option>
            <option value="100">100yr</option>
            {/* <option value="200">200yr</option> */}
            <option value="500">500yr</option>
          </select>
        </div>

        <div style={{ marginTop: "20px" }}>
          <label style={{ fontSize: "14px", lineHeight: "1.5" }}>
            <input
              type="checkbox"
              checked={isFloodDamageActive}
              onChange={(e) => {
                const isChecked = e.target.checked; // Get the current checked state
                setFloodDamageActive(isChecked); // Update the state
                handleFloodDamage(isChecked); // Use the current state directly
              }}
            />
            Show flood damage
          </label>
        </div>
        {isFloodDamageActive && damageSummary && (
          <div style={{ marginTop: "20px" }}>
            <h4
              style={{
                backgroundColor: "#FF6347", // Changed to a reddish color
                color: "white",
                padding: "5px",
                borderRadius: "4px",
                fontSize: "15px",
              }}
            >
              Damage Summary
            </h4>
            <p style={{ fontSize: "14px", lineHeight: "1.5" }}>
              <strong>Properties with Damage:</strong> {damageSummary.propertiesWithDamage}
            </p>
            <p style={{ fontSize: "14px", lineHeight: "1.5" }}>
              <strong>Total Structural Damage:</strong> ${damageSummary.totalStructuralDamage.toLocaleString()}
            </p>
            <p style={{ fontSize: "14px", lineHeight: "1.5" }}>
              <strong>Total Content Damage:</strong> ${damageSummary.totalContentDamage.toLocaleString()}
            </p>
            <p style={{ fontSize: "14px", lineHeight: "1.5" }}>
              <strong>Avg. Structural Damage:</strong> {damageSummary.averageStructuralDamagePercentage.toFixed(2)}%
            </p>
            <p style={{ fontSize: "14px", lineHeight: "1.5" }}>
              <strong>Avg. Content Damage:</strong> {damageSummary.averageContentDamagePercentage.toFixed(2)}%
            </p>
          </div>
        )}
      </div>
    )
  );
}

