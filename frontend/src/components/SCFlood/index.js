// SCFlood/index.js
import { GeoJsonLayer, IconLayer } from "@deck.gl/layers";
import React, { useState } from "react";

function formatTooltipData(item) {
    let tooltipData = "";

    if (item.ID !== undefined) {
        tooltipData += `ID: ${item.ID}\n`;
    }
    if (item.strDamage !== undefined) {
        tooltipData += `Structural Damage (percent): ${item.strDamage}\n`;
    }
    if (item.dollarDamage !== undefined) {
        tooltipData += `Structural Damage (dolar): ${item.dollarDamage}\n`;
    }
    if (item.cntDamagePercentage !== undefined) {
        tooltipData += `Content Damage (percent): ${item.cntDamagePercentage}\n`;
    }
    if (item.cntDamageDollar !== undefined) {
        tooltipData += `Content Damage (dolar): ${item.cntDamageDollar}\n`;
    }
    return tooltipData.trim(); // Remove trailing newline
}

export async function createFloodDamageIconLayer(mapid) {
    const url = `https://ifis.iowafloodcenter.org/ifis/app/inc/inc_get_hazusdata.php?mapid=${mapid}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const hazusDataArray = await response.json();

        // IconLayer için veri hazırlığı
        const iconLayerData = hazusDataArray.map((item) => {
            const dataItem = {
                ID: item[0],
                strDamage: item[1],
                dollarDamage: item[2],
                position: [item[3], item[4]],
                cntDamagePercentage: item[5],
                cntDamageDollar: item[6],
            };
            dataItem.tooltip_data = formatTooltipData(dataItem);
            return dataItem;
        });

        // IconLayer oluştur
        const iconLayer = new IconLayer({
            id: "icon-layer-flood",
            data: iconLayerData,
            pickable: true,
            iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas(ifis).png`,
            iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map(ifis).json`,
            getIcon: (d) => "yellow",
            sizeScale: 5,
            getPosition: (d) => d.position,
            getSize: (d) => 1,
            getColor: (d) => [255, 0, 0],
            getTooltip: ({ object }) => object && object.tooltip_data,
        });

        return iconLayer;
    } catch (error) {
        console.error("Error fetching Hazus data:", error);
    }
}

export const FloodMenu = ({ isFloodLayerSelected, isMenuOpenFlood, setIsMenuOpenFlood, handleLayerSelectChangeFlood }) => {
    const handleLayerSelectChange = async (event) => {
        handleLayerSelectChangeFlood(event);
    };
    return (
        isFloodLayerSelected &&isMenuOpenFlood &&(
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
                    width: "300px"
                }}
            >
                <button
                    onClick={() => { console.log('X button clicked'); setIsMenuOpenFlood(false) }}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        fontSize: '15px',
                        cursor: 'pointer'
                    }}
                >
                    &times;
                </button>

                <div style={{ marginTop: '30px' }}>
                    <h3 style={{ backgroundColor: '#4A90E2', color: 'white', padding: '5px', borderRadius: '4px', fontSize: '16px' }}>WATERLOO</h3>
                    <p style={{ fontSize: '14px', lineHeight: '1.5' }}><strong>River:</strong> Cedar River</p>
                    <p style={{ fontSize: '14px', lineHeight: '1.5' }}><strong>Gauge ID:</strong> 05464000</p>
                    <p style={{ fontSize: '14px', lineHeight: '1.5' }}><strong>Flood Level:</strong> 13 ft</p>
                </div>

                {/* <div style={{ marginTop: '20px' }}>
                    <h4 style={{ backgroundColor: '#8CC152', color: 'white', padding: '5px', borderRadius: '4px' }}>View Maps by</h4>
                    <label style={{ display: 'block', margin: '5px 0' }}>
                        <input type="checkbox" value="riverStage" /> River Stage
                    </label>
                    <label style={{ display: 'block', margin: '5px 0' }}>
                        <input type="checkbox" value="annualChance" /> Annual Chance
                    </label>
                </div>  */}

                {/* <div style={{ marginTop: '20px' }}>
                    <h4 style={{ backgroundColor: '#4A90E2', color: 'white', padding: '5px', borderRadius: '4px' }}>Flood Map Controller</h4>
                    <p>Stage: {stage} ft</p> 
                    <p>Discharge: {discharge} cfs</p> 
                    <input type="range" min="0" max="100" value={stage}
                        onChange={handleRangeChange} style={{ width: '100%' }} />
                    <label style={{ display: 'block', margin: '5px 0' }}>
                        <input type="checkbox" value="waterDepth" /> Water Depth
                    </label>
                    <label style={{ display: 'block', margin: '5px 0' }}>
                        <input type="checkbox" value="damageEstimate" /> Damage Estimate
                    </label>
                </div> */}

                <div style={{ marginTop: '20px' }}>
                    <h4 style={{ backgroundColor: '#8CC152', color: 'white', padding: '5px', borderRadius: '4px', fontSize: '15px' }}>Flood Risk</h4>
                    <select id="layerSelect" defaultValue="25" onChange={handleLayerSelectChange} style={{ fontSize: '13px', width: '100%' }}>
                        {/* <option value="2">2yr</option> */}
                        <option value="10">10yr</option>
                        <option value="25">25yr</option>
                        <option value="50">50yr</option>
                        <option value="100">100yr</option>
                        {/* <option value="200">200yr</option> */}
                        <option value="500">500yr</option>
                    </select>
                </div>
            </div>
        )
    );
};

export async function getFloodLayer(id, floodYear) {
  try {
    const path = `${process.env.PUBLIC_URL}/data/flood/flood_${floodYear}yr.geojson`;
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // Gelen verileri JSON formatında çözümleyin
    const data = await response.json();

        const layer = new GeoJsonLayer({
            id,
            data,
            pickable: true,
            stroked: true,
            filled: true,
            lineWidthMinPixels: 2, // Optional: specify line width
            lineWidthMaxPixels: 5, // Optional: specify line width
            getFillColor: [0, 100, 255, 100], // Su rengi: açık mavi
            getLineColor: [0, 0, 0], // Kenar rengi: siyah
            getRadius: 100,
            getLineWidth: 1,
            getElevation: 30,
        });

        return layer;
    } catch (error) {
        console.error("Error fetching or processing GeoJSON data:", error);
        throw error;
    }
}
