import { GeoJsonLayer } from "@deck.gl/layers";
import { IconLayer } from "@deck.gl/layers";
import formatObjectData from "../SC3DBuilding/formatObjectData";

const keyMappings = {
  name: "Name",
  station_number: "Station Number",
  station_type: "Station Type",
};

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
    getLineColor: [255, 69, 0, 255], // Changed to a bright orange-red color
    getRadius: 90,
    getLineWidth: 12, // Adjusted line width for better visibility
    getElevation: 30,
    lineDashArray: [0, 0], // Removed dash style for a solid, consistent line
  });
  return layers;
}


export async function CreateRailwayStations(geojsonData, openDetailsBox) {
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

    item.tooltip_data = formatObjectData(item, keyMappings, "tooltip");
    item.details_data = formatObjectData(item, keyMappings, "details");
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
    onClick: (info, event) => {
      if (info.object) {
        openDetailsBox(info.object.details_data);
      }
    },
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
