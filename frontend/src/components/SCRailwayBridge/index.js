import { IconLayer } from "@deck.gl/layers";

function formatTooltipData(item) {
  let tooltipData = '';

  if (item.name !== undefined) {
    tooltipData += `Bridge Name: ${item.name}\n`;
  }
  if (item.year_built !== undefined && item.year_built > 0) {
    tooltipData += `Year Built: ${item.year_built}\n`;
  }
  // if (item.foundation !== undefined) {
  //   tooltipData += `Foundation: ${item.foundation}\n`;
  // }
  // if (item.scour_index !== undefined) {
  //   tooltipData += `Scour Index: ${item.scour_index}\n`;
  // }
  // if (item.traffic !== undefined) {
  //   tooltipData += `Traffic: ${item.traffic}\n`;
  // }
  // if (item.condition !== undefined) {
  //   tooltipData += `Condition: ${item.condition}\n`;
  // }
  if (item.cost !== undefined) {
    tooltipData += `Cost: ${item.cost}\n`;
  }
  // if (item.comment !== undefined) {
  //   tooltipData += `Comment: ${item.comment}`;
  // }

  return tooltipData.trim(); // Remove trailing newline
}

export async function RailwayBridgesLayer() {
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
      cost: feature.properties.cost,
      //comment: feature.properties.comment,
    };

    item.tooltip_data = formatTooltipData(item);
    return item;
  });

  const layerRailwayBridges = new IconLayer({
    id: 'RailBridge',
    data: processedData,
    pickable: true,
    iconAtlas: `${process.env.PUBLIC_URL}/icons/icon_atlas.png`,
    iconMapping: `${process.env.PUBLIC_URL}/icons/icon_atlas_map.json`,
    getIcon: d => 'paragon-5-orange',
    sizeScale: 5,
    getPosition: d => d.coordinates,
    getSize: d => 8,
    getTooltip: ({ object }) => object && object.tooltip_data,
    //getColor: d => [255, 0, 0],
  });

  return layerRailwayBridges;
}
