import { GeoJsonLayer } from "@deck.gl/layers";
import { IconLayer } from "@deck.gl/layers";

function formatTooltipData(item) {
  let tooltipData = "";
  if (item.name !== undefined) {
    tooltipData += `Name: ${item.name}\n`;
  }
  if (item.station_number !== undefined) {
    tooltipData += `Station Number: ${item.station_number}\n`;
  }
  if (item.station_type !== undefined) {
    tooltipData += `Station Type: ${item.station_type}\n`;

    return tooltipData.trim(); // Remove trailing newline
  }
}
export async function fetchRailwayData() {
  const response = await fetch(`${process.env.PUBLIC_URL}/data/Rail_Line_Active.geojson`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  // Gelen verileri JSON formatında çözümleyin
  const data = await response.json();
  return data;
}

export function CreateRailwayLayer(geojsonData) {
  const layers = new GeoJsonLayer({
    id: "RailwayNetwork",
    data: geojsonData,
    pickable: true,
    getLineColor: [0, 0, 139, 255],
    getRadius: 90,
    getLineWidth: 10,
    getElevation: 30,
  });
  return layers;
}
export async function CreateRailwayStations(geojsonData) {
  const processedData = geojsonData.features.map((feature) => {
    const item = {
      name: feature.properties.NAME,
      coordinates: feature.geometry.coordinates,
      station_number: feature.properties.STATION_NUMBER,
      //foundation: feature.properties.foundation,
      //scour_index: feature.properties.scourindex,
      //traffic: feature.properties.traffic,
      //condition: feature.properties.condition,
      station_type: feature.properties.BASE_STATION_TYPE,
    };

    item.tooltip_data = formatTooltipData(item);
    return item;
  });

  const layerRailway = new IconLayer({
    id: "RailwayStations",
    data: processedData,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas.png`,
    iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map.json`,
    getIcon: (d) => "paragon-5-orange",
    sizeScale: 5,
    getPosition: (d) => d.coordinates,
    getSize: (d) => 5,
    getTooltip: ({ object }) => object && object.tooltip_data,
    //getColor: d => [255, 0, 0],
  });
  return layerRailway;
}
export async function FetchRailwayStations() {
  const response = await fetch(`${process.env.PUBLIC_URL}/data/RTN_Base_Station.geojson`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  // Gelen verileri JSON formatında çözümleyin
  const data = await response.json();
  return data;
}
