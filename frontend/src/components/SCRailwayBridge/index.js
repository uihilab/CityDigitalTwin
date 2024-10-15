import { IconLayer } from "@deck.gl/layers";
import formatObjectData from "../SC3DBuilding/formatObjectData";

const keyMappings = {
  name: "Bridge Name",
  year_built: "Year Built",
  cost: "Cost",
  // You can uncomment and add these as needed:
  // foundation: "Foundation",
  // scour_index: "Scour Index",
  // traffic: "Traffic",
  // condition: "Condition",
  // comment: "Comment",
};

export async function RailwayBridgesLayer(openDetailsBox) {
  const response = await fetch(`${process.env.PUBLIC_URL}/data/railwaybridge.geojson`);
  const data = await response.json();

  const processedData = data.features.map((feature) => {
    const item = {
      name: feature.properties.name,
      coordinates: feature.geometry.coordinates,
      year_built: feature.properties.yearbuilt,
      //foundation: feature.properties.foundation,
      //scour_index: feature.properties.scourindex,
      //traffic: feature.properties.traffic,
      //condition: feature.properties.condition,
      //cost: feature.properties.cost,
      //comment: feature.properties.comment,
    };

    item.tooltip_data = formatObjectData(item, keyMappings, "tooltip");
    item.details_data = formatObjectData(item, keyMappings, "details");
    return item;
  });

  const layerRailwayBridges = new IconLayer({
    id: "RailBridge",
    data: processedData,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_map.png`,
    iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_publictransportation.json`,
    getIcon: (d) => "harbour-bridge",
    sizeScale: 5,
    getPosition: (d) => d.coordinates,
    getSize: (d) => 8,
    getTooltip: ({ object }) => object && object.tooltip_data,
    onClick: (info, event) => {
      if (info.object) {
        openDetailsBox(info.object.details_data);
      }
    },
  });

  return layerRailwayBridges;
}
