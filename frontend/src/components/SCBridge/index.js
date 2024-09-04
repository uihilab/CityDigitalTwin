import { IconLayer } from "@deck.gl/layers";

function formatTooltipData(item) {
  let tooltipData = "";

  if (item.bridge_name !== undefined) {
    tooltipData += `Bridge Name: ${item.bridge_name}\n`;
  }
  if (item.city !== undefined) {
    tooltipData += `City: ${item.city}\n`;
  }
  if (item.county !== undefined) {
    tooltipData += `County: ${item.county}\n`;
  }
  if (item.condition !== undefined) {
    tooltipData += `Condition: ${item.condition}\n`;
  }
  if (item.sufficiency !== undefined) {
    tooltipData += `Sufficiency Rating: ${item.sufficiency}\n`;
  }
  if (item.age !== undefined) {
    tooltipData += `Age: ${item.age}\n`;
  }

  return tooltipData.trim(); // Remove trailing newline
}

export async function BridgesgridLayer() {

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

    item.tooltip_data = formatTooltipData(item);
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
  });

  return layerBridges;
}
