import { IconLayer } from "@deck.gl/layers";
import formatObjectData from "../SC3DBuilding/formatObjectData";

const keyMappings = {
  BUSINESS_DATE: "Business Date",
  EFFECTIVE_START_DATE: "Effective Start Date",
};

export async function AddRailwayCrossingLayer(openDetailsBox) {
  const response = await fetch(`${process.env.PUBLIC_URL}/data/Rail_Crossing.geojson`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  // Gelen verileri JSON formatında çözümleyin
  const data = await response.json();

  const processedData = data.features.map((feature) => {
    const item = {
      BUSINESS_DATE: feature.properties.BUSINESS_DATE,
      coordinates: feature.geometry.coordinates,
      EFFECTIVE_START_DATE: feature.properties.EFFECTIVE_START_DATE,
    };

    item.tooltip_data = formatObjectData(item, keyMappings, "tooltip");
    item.details_data = formatObjectData(item, keyMappings, "details");
    return item;
  });

  const layerRailway = new IconLayer({
    id: "RailwayCross",
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
  debugger;
  return layerRailway;
}
