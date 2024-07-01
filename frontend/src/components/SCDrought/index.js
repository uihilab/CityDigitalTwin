import { GeoJsonLayer } from "@deck.gl/layers";

// Legend verileri
const legendData = [
  { label: "Exceptional Drought", fillColor: "#730000", lineColor: "#730000" },
  { label: "Extreme Drought", fillColor: "#e60000", lineColor: "#e60000" },
  { label: "Severe Drought", fillColor: "#ffaa00", lineColor: "#ffaa00" },
  { label: "Moderate Drought", fillColor: "#fcd37f", lineColor: "#fcd37f" },
  { label: "Abnormally Dry", fillColor: "#ffff00", lineColor: "#ffff00" },
  // ... additional entries if needed
];

// GeoJSON verilerini fetch etme
export async function FetchDroughtData() {
  const response = await fetch("./data/drought_map.geojson");
  const data = await response.json();
  return data;
}

// Hex renk kodunu RGBA formatına dönüştüren fonksiyon
const hexToRGBA = (hex, alpha = 255) => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b, alpha];
};

// Legend HTML oluşturma fonksiyonu
export function createLegendHTML() {
  const legendContainer = document.createElement('div');
  legendContainer.className = 'legend-container';
  legendContainer.style.position = 'absolute';
  legendContainer.style.bottom = '10px';
  legendContainer.style.right = '10px';
  legendContainer.style.padding = '10px';
  legendContainer.style.backgroundColor = 'white';
  legendContainer.style.border = '1px solid black';
  legendContainer.style.zIndex = '1000';

  legendData.forEach(entry => {
    const legendEntry = document.createElement('div');
    legendEntry.className = 'legend-entry';

    const colorCircle = document.createElement('div');
    colorCircle.className = 'color-circle';
    colorCircle.style.width = '12px';
    colorCircle.style.height = '12px';
    colorCircle.style.backgroundColor = entry.fillColor;
    colorCircle.style.display = 'inline-block';
    colorCircle.style.marginRight = '8px';

    const legendLabel = document.createElement('span');
    legendLabel.className = 'legend-label';
    legendLabel.textContent = entry.label;

    legendEntry.appendChild(colorCircle);
    legendEntry.appendChild(legendLabel);

    legendContainer.appendChild(legendEntry);
  });

  return legendContainer.outerHTML; // Convert to string for insertion
}

// Kuraklık katmanı oluşturma fonksiyonu
export async function DroughtLayer(JsonData) {
  return new GeoJsonLayer({
    id: 'Drought',
    data: JsonData,
    filled: true,
    pointRadiusMinPixels: 2,
    pointRadiusScale: 2000,
    getPointRadius: f => 10,
    getFillColor: d => hexToRGBA(d.properties.fillColor, 200), // 200 for alpha
    getLineColor: d => hexToRGBA(d.properties.lineColor, 255), // 255 for full opacity

    pickable: true,
    autoHighlight: true,
    onClick: info => {
      if (info.object) {
        alert(`Clicked on ${info.object.properties.name}`);
      }
    }
  });
}
