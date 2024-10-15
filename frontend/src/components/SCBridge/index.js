import { IconLayer } from "@deck.gl/layers";
import formatObjectData from "../SC3DBuilding/formatObjectData";

const keyMappings = {
  bridge_name: "Bridge Name",
  city: "City",
  county: "County",
  condition: "Condition",
  sufficiency: "Sufficiency Rating",
  age: "Age",
};

export async function BridgesgridLayer(openDetailsBox) {
  const response = await fetch(`${process.env.PUBLIC_URL}/data/iowa_bridges.geojson`);
  const data = await response.json();

  const processedData = data.features.map((feature) => {
    const item = {
      bridge_name: feature.properties.NBI6,
      coordinates: feature.geometry.coordinates,
      city: feature.properties.CITY,
      county: feature.properties.COUNTY,
      condition: feature.properties.BRIDGECOND,
      sufficiency: feature.properties.SUFFICIENC,
      age: feature.properties.Age,
    };

    item.tooltip_data = formatObjectData(item, keyMappings, "tooltip");
    item.details_data = formatObjectData(item, keyMappings, "details");
    return item;
  });

  const layerBridges = new IconLayer({
    id: "Bridges",
    data: processedData,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas.png`,
    iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map.json`,
    getIcon: (d) => "paragon-5-red",
    sizeScale: 5,
    getPosition: (d) => d.coordinates,
    getSize: (d) => 5,
    getTooltip: ({ object }) => object && object.tooltip_data,
    //getColor: d => [255, 0, 0],
    onClick: (info, event) => {
      //console.log("Clicked:", info);
      if (info.object) {
        openDetailsBox(info.object.details_data);
      }
    },
  });

  return layerBridges;
}
